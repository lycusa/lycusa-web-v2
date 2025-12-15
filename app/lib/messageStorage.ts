/**
 * Message Storage Module
 * Stores decrypted message plaintexts in IndexedDB for persistence across sessions.
 * This is industry standard - Signal, WhatsApp, etc. all cache decrypted messages locally.
 * 
 * Key insight: Signal Protocol messages can only be decrypted ONCE because the
 * ratchet advances. We MUST cache the plaintext after successful decryption.
 */

const DB_NAME = 'lycusa-messages-v1';
const DB_VERSION = 1;
const STORE_NAME = 'messages';
const MAX_LOCAL_MESSAGES = 1000; // Prevent unbounded growth

export interface LocalMessageEntry {
    id: string;           // Primary key (message ID)
    plaintext: string;
    ciphertext?: string;  // Secondary lookup key
    timestamp: number;
}

let db: IDBDatabase | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Initialize the IndexedDB database
 * Thread-safe: multiple calls return the same promise
 */
export async function initMessageStore(): Promise<void> {
    if (typeof window === 'undefined') return;

    if (db) return; // Already initialized

    if (initPromise) return initPromise; // Initialization in progress

    initPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('[MessageStorage] Failed to open database:', request.error);
            initPromise = null;
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            console.log('[MessageStorage] Database initialized');
            resolve();
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
                // Create index for ciphertext lookups (secondary key)
                store.createIndex('ciphertext', 'ciphertext', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
                console.log('[MessageStorage] Object store created');
            }
        };
    });

    return initPromise;
}

/**
 * Ensure database is initialized before operations
 */
async function ensureDb(): Promise<IDBDatabase> {
    if (!db) {
        await initMessageStore();
    }
    if (!db) {
        throw new Error('Failed to initialize message database');
    }
    return db;
}

/**
 * Store plaintext of a message locally (sent OR received)
 * This is critical for Signal Protocol - messages can only be decrypted once,
 * so we cache the plaintext after successful decryption.
 * @param messageId - The server-assigned message ID
 * @param plaintext - The plaintext content
 * @param ciphertext - Optional ciphertext for secondary lookup
 */
export async function storeLocalMessagePlaintext(
    messageId: string,
    plaintext: string,
    ciphertext?: string
): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        const database = await ensureDb();
        const id = String(messageId); // Ensure ID is a string

        const entry: LocalMessageEntry = {
            id,
            plaintext,
            ciphertext,
            timestamp: Date.now(),
        };

        return new Promise((resolve, reject) => {
            const tx = database.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);

            // Use put to insert or update
            const request = store.put(entry);

            request.onsuccess = () => {
                console.log(`[MessageStorage] Cached message ${id}`);
                resolve();
            };

            request.onerror = () => {
                console.warn('[MessageStorage] Failed to store message:', request.error);
                reject(request.error);
            };

            // Prune old messages after successful write
            tx.oncomplete = () => {
                pruneOldMessages().catch(console.warn);
            };
        });
    } catch (err) {
        console.warn('[MessageStorage] Failed to store message:', err);
    }
}

/**
 * Retrieve plaintext of a message
 * Uses primary lookup by ID, with fallback to ciphertext lookup
 * @param messageId - The message ID to look up
 * @param ciphertext - Optional ciphertext for secondary lookup
 * @returns The plaintext or null if not found
 */
export async function getLocalMessagePlaintext(
    messageId: string,
    ciphertext?: string
): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
        const database = await ensureDb();
        const id = String(messageId);

        return new Promise((resolve) => {
            const tx = database.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);

            // Primary lookup by ID
            const request = store.get(id);

            request.onsuccess = () => {
                const entry = request.result as LocalMessageEntry | undefined;

                if (entry) {
                    resolve(entry.plaintext);
                    return;
                }

                // Fallback: Try secondary lookup by ciphertext
                if (ciphertext) {
                    const index = store.index('ciphertext');
                    const cipherRequest = index.get(ciphertext);

                    cipherRequest.onsuccess = () => {
                        const cipherEntry = cipherRequest.result as LocalMessageEntry | undefined;

                        if (cipherEntry) {
                            console.log(
                                `%c[MessageStorage] AUTO-HEALING: Found by ciphertext! Updating ID ${cipherEntry.id} -> ${id}`,
                                'background: purple; color: white'
                            );

                            // Auto-heal: Update the ID to match the server's ID
                            const updateEntry: LocalMessageEntry = {
                                ...cipherEntry,
                                id,
                                timestamp: Date.now(),
                            };

                            // Update asynchronously (don't block return)
                            const updateTx = database.transaction(STORE_NAME, 'readwrite');
                            const updateStore = updateTx.objectStore(STORE_NAME);
                            updateStore.put(updateEntry);
                            // Delete the old entry
                            updateStore.delete(cipherEntry.id);

                            resolve(cipherEntry.plaintext);
                        } else {
                            resolve(null);
                        }
                    };

                    cipherRequest.onerror = () => resolve(null);
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => {
                console.warn('[MessageStorage] Failed to retrieve message:', request.error);
                resolve(null);
            };
        });
    } catch (err) {
        console.warn('[MessageStorage] Failed to retrieve message:', err);
        return null;
    }
}

/**
 * Store plaintext with a temporary ID (before server response)
 * Used for optimistic updates
 */
export async function storeLocalMessageWithTempId(
    tempId: string,
    plaintext: string
): Promise<void> {
    return storeLocalMessagePlaintext(tempId, plaintext);
}

/**
 * Update the message ID after server confirms (temp -> real ID)
 * Also removes the old temp entry to avoid duplicates
 */
export async function updateLocalMessageId(
    tempId: string,
    realId: string
): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        const database = await ensureDb();
        const tId = String(tempId);
        const rId = String(realId);

        return new Promise((resolve, reject) => {
            const tx = database.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);

            // Get the temp entry
            const getRequest = store.get(tId);

            getRequest.onsuccess = () => {
                const tempEntry = getRequest.result as LocalMessageEntry | undefined;

                if (!tempEntry) {
                    resolve(); // No temp entry to update
                    return;
                }

                // Check if real ID already exists
                const checkRequest = store.get(rId);

                checkRequest.onsuccess = () => {
                    const realExists = !!checkRequest.result;

                    if (realExists) {
                        // Real ID already exists, just remove temp entry
                        console.log(`[MessageStorage] Real ID ${rId} already exists, removing temp ID ${tId}`);
                        store.delete(tId);
                    } else {
                        // Create new entry with real ID, delete temp entry
                        const newEntry: LocalMessageEntry = {
                            ...tempEntry,
                            id: rId,
                            timestamp: Date.now(),
                        };
                        store.put(newEntry);
                        store.delete(tId);
                        console.log(`[MessageStorage] Updated temp ID ${tId} to real ID ${rId}`);
                    }

                    resolve();
                };

                checkRequest.onerror = () => reject(checkRequest.error);
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    } catch (err) {
        console.warn('[MessageStorage] Failed to update message ID:', err);
    }
}

/**
 * Clean up old temp_ entries from the cache
 * Call this periodically or on init to remove stale temp IDs
 */
export async function cleanupTempMessages(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        const database = await ensureDb();

        return new Promise((resolve, reject) => {
            const tx = database.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);

            const request = store.openCursor();
            let deletedCount = 0;

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

                if (cursor) {
                    const entry = cursor.value as LocalMessageEntry;

                    if (entry.id.startsWith('temp_')) {
                        cursor.delete();
                        deletedCount++;
                    }

                    cursor.continue();
                } else {
                    // Cursor finished
                    if (deletedCount > 0) {
                        console.log(`[MessageStorage] Cleaned up ${deletedCount} stale temp entries`);
                    }
                    resolve();
                }
            };

            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.warn('[MessageStorage] Failed to cleanup temp messages:', err);
    }
}

/**
 * Prune old messages to prevent unbounded growth
 * Keeps the most recent MAX_LOCAL_MESSAGES entries
 */
async function pruneOldMessages(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        const database = await ensureDb();

        return new Promise((resolve) => {
            const tx = database.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);

            // Count total messages
            const countRequest = store.count();

            countRequest.onsuccess = () => {
                const count = countRequest.result;

                if (count <= MAX_LOCAL_MESSAGES) {
                    resolve();
                    return;
                }

                // Need to prune - get oldest entries by timestamp
                const deleteCount = count - MAX_LOCAL_MESSAGES;
                const index = store.index('timestamp');
                const cursorRequest = index.openCursor(); // Opens in ascending order (oldest first)

                let deleted = 0;

                cursorRequest.onsuccess = (event) => {
                    const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

                    if (cursor && deleted < deleteCount) {
                        cursor.delete();
                        deleted++;
                        cursor.continue();
                    } else {
                        if (deleted > 0) {
                            console.log(`[MessageStorage] Pruned ${deleted} old messages`);
                        }
                        resolve();
                    }
                };

                cursorRequest.onerror = () => resolve();
            };

            countRequest.onerror = () => resolve();
        });
    } catch (err) {
        console.warn('[MessageStorage] Failed to prune old messages:', err);
    }
}
