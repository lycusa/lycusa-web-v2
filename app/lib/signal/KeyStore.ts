
import { SignalIdentity, SignalSession } from './types';

const DB_NAME = 'signal-protocol';
const DB_VERSION = 1;

const STORES = {
    IDENTITY: 'identity',
    SIGNED_PREKEY: 'signedPreKey',
    ONETIME_PREKEYS: 'oneTimePreKeys',
    SESSIONS: 'sessions',
} as const;

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

    async saveIdentity(
        identityKeyPair: CryptoKeyPair,
        registrationId: number
    ): Promise<void> {
        const publicKeyRaw = await crypto.subtle.exportKey(
            'raw',
            identityKeyPair.publicKey
        );
        const privateKeyJwk = await crypto.subtle.exportKey(
            'jwk',
            identityKeyPair.privateKey
        );

        await this.put(STORES.IDENTITY, {
            id: 'local',
            publicKey: this.arrayBufferToBase64(publicKeyRaw),
            privateKey: privateKeyJwk,
            registrationId,
            createdAt: Date.now(),
        });
    }

    async getIdentity(): Promise<SignalIdentity | null> {
        const stored = await this.get<any>(STORES.IDENTITY, 'local');
        if (!stored) return null;

        const publicKey = await crypto.subtle.importKey(
            'raw',
            this.base64ToArrayBuffer(stored.publicKey),
            { name: 'ECDH', namedCurve: 'P-256' },
            true,
            []
        );

        const privateKey = await crypto.subtle.importKey(
            'jwk',
            stored.privateKey,
            { name: 'ECDH', namedCurve: 'P-256' },
            true,
            ['deriveKey', 'deriveBits']
        );

        return {
            publicKey,
            privateKey,
            publicKeyRaw: this.base64ToArrayBuffer(stored.publicKey),
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

    async saveHelperKeys(
        signedPreKey: { keyId: number; keyPair: CryptoKeyPair; signature: ArrayBuffer },
        oneTimePreKeys: Array<{ keyId: number; keyPair: CryptoKeyPair }>
    ): Promise<void> {
        // Save Signed PreKey
        const spkPub = await crypto.subtle.exportKey('raw', signedPreKey.keyPair.publicKey);
        const spkPriv = await crypto.subtle.exportKey('jwk', signedPreKey.keyPair.privateKey);

        await this.put(STORES.SIGNED_PREKEY, {
            keyId: signedPreKey.keyId,
            publicKey: this.arrayBufferToBase64(spkPub),
            privateKey: spkPriv,
            signature: this.arrayBufferToBase64(signedPreKey.signature),
            createdAt: Date.now()
        });

        // Save OneTime PreKeys
        for (const key of oneTimePreKeys) {
            const otpPub = await crypto.subtle.exportKey('raw', key.keyPair.publicKey);
            const otpPriv = await crypto.subtle.exportKey('jwk', key.keyPair.privateKey);

            await this.put(STORES.ONETIME_PREKEYS, {
                keyId: key.keyId,
                publicKey: this.arrayBufferToBase64(otpPub),
                privateKey: otpPriv,
                createdAt: Date.now()
            });
        }
    }

    // Helper method to retrieve a specific OnTime PreKey by ID (needed for decryption)
    async getOneTimePreKey(keyId: number): Promise<CryptoKeyPair | null> {
        const stored = await this.get<any>(STORES.ONETIME_PREKEYS, keyId);
        if (!stored) return null;

        const publicKey = await crypto.subtle.importKey(
            'raw',
            this.base64ToArrayBuffer(stored.publicKey),
            { name: 'ECDH', namedCurve: 'P-256' },
            true,
            []
        );

        const privateKey = await crypto.subtle.importKey(
            'jwk',
            stored.privateKey,
            { name: 'ECDH', namedCurve: 'P-256' },
            true,
            ['deriveKey', 'deriveBits']
        );

        return { publicKey, privateKey };
    }

    async removeOneTimePreKey(keyId: number): Promise<void> {
        // Logic to remove...
        return new Promise((resolve, reject) => {
            const tx = this.db!.transaction(STORES.ONETIME_PREKEYS, 'readwrite');
            const store = tx.objectStore(STORES.ONETIME_PREKEYS);
            const request = store.delete(keyId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getSignedPreKey(keyId: number): Promise<CryptoKeyPair | null> {
        const stored = await this.get<any>(STORES.SIGNED_PREKEY, keyId);
        if (!stored) return null;

        const publicKey = await crypto.subtle.importKey(
            'raw',
            this.base64ToArrayBuffer(stored.publicKey),
            { name: 'ECDH', namedCurve: 'P-256' },
            true,
            []
        );

        const privateKey = await crypto.subtle.importKey(
            'jwk',
            stored.privateKey,
            { name: 'ECDH', namedCurve: 'P-256' },
            true,
            ['deriveKey', 'deriveBits']
        );

        return { publicKey, privateKey };
    }

    private async get<T>(storeName: string, key: string | number): Promise<T | undefined> {
        if (!this.db) await this.init(); // Auto-init
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

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
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
