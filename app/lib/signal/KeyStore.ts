
import { SignalIdentity, SignalSession } from './types';

const DB_NAME = 'signal-protocol-v2'; // Bumped version for new key format
const DB_VERSION = 1;

const STORES = {
    IDENTITY: 'identity',
    SIGNED_PREKEY: 'signedPreKey',
    ONETIME_PREKEYS: 'oneTimePreKeys',
    SESSIONS: 'sessions',
} as const;

/**
 * KeyStore for Signal Protocol keys
 * Updated to work with X25519/Ed25519 raw key format
 */
export class KeyStore {
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        if (typeof window === 'undefined') return; // Server-side check

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                if (!db.objectStoreNames.contains(STORES.IDENTITY)) {
                    db.createObjectStore(STORES.IDENTITY, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(STORES.SIGNED_PREKEY)) {
                    db.createObjectStore(STORES.SIGNED_PREKEY, { keyPath: 'keyId' });
                }
                if (!db.objectStoreNames.contains(STORES.ONETIME_PREKEYS)) {
                    db.createObjectStore(STORES.ONETIME_PREKEYS, { keyPath: 'keyId' });
                }
                if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
                    db.createObjectStore(STORES.SESSIONS, { keyPath: 'sessionKey' });
                }
            };
        });
    }

    async hasIdentity(): Promise<boolean> {
        const identity = await this.get(STORES.IDENTITY, 'local');
        return identity !== undefined;
    }

    /**
     * Save identity key pair (X25519 format - raw bytes)
     */
    async saveIdentity(
        identityKeyPair: CryptoKeyPair,
        registrationId: number
    ): Promise<void> {
        // Extract raw bytes from wrapped keys
        const publicKeyRaw = (identityKeyPair.publicKey as any)._raw as Uint8Array;
        const privateKeyRaw = (identityKeyPair.privateKey as any)._raw as Uint8Array;

        if (!publicKeyRaw || !privateKeyRaw) {
            throw new Error('Invalid key format - expected X25519 wrapped keys');
        }

        await this.put(STORES.IDENTITY, {
            id: 'local',
            publicKey: this.arrayBufferToBase64(publicKeyRaw),
            privateKey: this.arrayBufferToBase64(privateKeyRaw),
            registrationId,
            createdAt: Date.now(),
        });
    }

    /**
     * Get identity key pair
     */
    async getIdentity(): Promise<SignalIdentity | null> {
        const stored = await this.get<any>(STORES.IDENTITY, 'local');
        if (!stored) return null;

        const publicKeyRaw = this.base64ToArrayBuffer(stored.publicKey);
        const privateKeyRaw = this.base64ToArrayBuffer(stored.privateKey);

        // Wrap as CryptoKey-like objects
        const publicKey = {
            _raw: new Uint8Array(publicKeyRaw),
            type: 'public',
            algorithm: { name: 'X25519' }
        } as unknown as CryptoKey;

        const privateKey = {
            _raw: new Uint8Array(privateKeyRaw),
            type: 'private',
            algorithm: { name: 'X25519' }
        } as unknown as CryptoKey;

        return {
            publicKey,
            privateKey,
            publicKeyRaw,
            registrationId: stored.registrationId,
        };
    }

    async saveSession(
        recipientId: string,
        conversationId: string,
        sessionState: Omit<SignalSession, 'recipientId' | 'conversationId'>
    ): Promise<void> {
        const key = `${recipientId}:${conversationId}`;
        await this.put(STORES.SESSIONS, {
            sessionKey: key,
            recipientId,
            conversationId,
            ...sessionState,
            updatedAt: Date.now(),
        });
    }

    async getSession(
        recipientId: string,
        conversationId: string
    ): Promise<SignalSession | null> {
        const key = `${recipientId}:${conversationId}`;
        return (await this.get<SignalSession>(STORES.SESSIONS, key)) || null;
    }

    async hasSession(
        recipientId: string,
        conversationId: string
    ): Promise<boolean> {
        const session = await this.getSession(recipientId, conversationId);
        return session !== null;
    }

    /**
     * Save signed prekey and optional one-time prekeys
     */
    async saveHelperKeys(
        signedPreKey: { keyId: number; keyPair: CryptoKeyPair; signature: ArrayBuffer },
        oneTimePreKeys: Array<{ keyId: number; keyPair: CryptoKeyPair }>
    ): Promise<void> {
        // Save Signed PreKey (Ed25519 format)
        const spkPubRaw = (signedPreKey.keyPair.publicKey as any)._raw as Uint8Array;
        const spkPrivRaw = (signedPreKey.keyPair.privateKey as any)._raw as Uint8Array;

        if (!spkPubRaw || !spkPrivRaw) {
            throw new Error('Invalid signed prekey format');
        }

        await this.put(STORES.SIGNED_PREKEY, {
            keyId: signedPreKey.keyId,
            publicKey: this.arrayBufferToBase64(spkPubRaw),
            privateKey: this.arrayBufferToBase64(spkPrivRaw),
            signature: this.arrayBufferToBase64(new Uint8Array(signedPreKey.signature)),
            createdAt: Date.now()
        });

        // Save OneTime PreKeys (X25519 format)
        for (const key of oneTimePreKeys) {
            const otpPubRaw = (key.keyPair.publicKey as any)._raw as Uint8Array;
            const otpPrivRaw = (key.keyPair.privateKey as any)._raw as Uint8Array;

            if (!otpPubRaw || !otpPrivRaw) {
                throw new Error('Invalid one-time prekey format');
            }

            await this.put(STORES.ONETIME_PREKEYS, {
                keyId: key.keyId,
                publicKey: this.arrayBufferToBase64(otpPubRaw),
                privateKey: this.arrayBufferToBase64(otpPrivRaw),
                createdAt: Date.now()
            });
        }
    }

    /**
     * Get one-time prekey by ID
     */
    async getOneTimePreKey(keyId: number): Promise<CryptoKeyPair | null> {
        const stored = await this.get<any>(STORES.ONETIME_PREKEYS, keyId);
        if (!stored) return null;

        const publicKeyRaw = this.base64ToArrayBuffer(stored.publicKey);
        const privateKeyRaw = this.base64ToArrayBuffer(stored.privateKey);

        return {
            publicKey: {
                _raw: new Uint8Array(publicKeyRaw),
                type: 'public',
                algorithm: { name: 'X25519' }
            } as unknown as CryptoKey,
            privateKey: {
                _raw: new Uint8Array(privateKeyRaw),
                type: 'private',
                algorithm: { name: 'X25519' }
            } as unknown as CryptoKey
        };
    }

    async removeOneTimePreKey(keyId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction(STORES.ONETIME_PREKEYS, 'readwrite');
            const store = tx.objectStore(STORES.ONETIME_PREKEYS);
            const request = store.delete(keyId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get signed prekey by ID
     */
    async getSignedPreKey(keyId: number): Promise<CryptoKeyPair | null> {
        const stored = await this.get<any>(STORES.SIGNED_PREKEY, keyId);
        if (!stored) return null;

        const publicKeyRaw = this.base64ToArrayBuffer(stored.publicKey);
        const privateKeyRaw = this.base64ToArrayBuffer(stored.privateKey);

        return {
            publicKey: {
                _raw: new Uint8Array(publicKeyRaw),
                type: 'public',
                algorithm: { name: 'Ed25519' }
            } as unknown as CryptoKey,
            privateKey: {
                _raw: new Uint8Array(privateKeyRaw),
                type: 'private',
                algorithm: { name: 'Ed25519' }
            } as unknown as CryptoKey
        };
    }

    private async get<T>(storeName: string, key: string | number): Promise<T | undefined> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    private async put(storeName: string, value: unknown): Promise<void> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.put(value);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
        const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }
}
