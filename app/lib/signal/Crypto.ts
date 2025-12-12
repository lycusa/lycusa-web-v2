
import { x25519 } from '@noble/curves/ed25519';
import { ed25519 } from '@noble/curves/ed25519';
import { randomBytes } from '@noble/hashes/utils';

/**
 * SignalCrypto - Handles all cryptographic operations for Signal Protocol
 * Uses X25519 for key exchange and Ed25519 for signing (via @noble/curves)
 * This matches the standard Signal Protocol specification
 */

// Key pair types for X25519 (different from Web Crypto CryptoKeyPair)
export interface X25519KeyPair {
    publicKey: Uint8Array;  // 32 bytes
    privateKey: Uint8Array; // 32 bytes
}

export interface Ed25519KeyPair {
    publicKey: Uint8Array;  // 32 bytes
    privateKey: Uint8Array; // 64 bytes (seed + public key)
}

export class SignalCrypto {
    /**
     * Generate X25519 key pair for Diffie-Hellman key exchange
     * Returns 32-byte public key as required by Signal Protocol
     */
    static async generateKeyPair(): Promise<CryptoKeyPair> {
        const privateKey = randomBytes(32);
        const publicKey = x25519.getPublicKey(privateKey);

        // Wrap in CryptoKeyPair-like structure for compatibility
        // We'll store the raw bytes and handle them specially
        return {
            privateKey: await this.wrapPrivateKey(privateKey),
            publicKey: await this.wrapPublicKey(publicKey)
        };
    }

    /**
     * Generate Ed25519 key pair for signing
     */
    static async generateSigningKeyPair(): Promise<CryptoKeyPair> {
        const privateKey = ed25519.utils.randomPrivateKey();
        const publicKey = ed25519.getPublicKey(privateKey);

        return {
            privateKey: await this.wrapPrivateKeyEd(privateKey),
            publicKey: await this.wrapPublicKeyEd(publicKey)
        };
    }

    static generateRegistrationId(): number {
        const arr = randomBytes(4);
        const view = new DataView(arr.buffer);
        return view.getUint32(0, true) & 0x3fff;
    }

    /**
     * Export public key to raw bytes (32 bytes for X25519)
     */
    static async exportPublicKey(key: CryptoKey): Promise<ArrayBuffer> {
        // Check if it's our wrapped key
        const raw = (key as any)._raw;
        if (raw) {
            return raw.buffer.slice(0);
        }
        // Fallback for Web Crypto keys
        return window.crypto.subtle.exportKey('raw', key);
    }

    /**
     * Import X25519 public key from raw bytes
     */
    static async importPublicKey(buffer: BufferSource): Promise<CryptoKey> {
        let bytes: Uint8Array;
        if (buffer instanceof ArrayBuffer) {
            bytes = new Uint8Array(buffer);
        } else if (buffer instanceof Uint8Array) {
            bytes = buffer;
        } else {
            bytes = new Uint8Array((buffer as ArrayBufferView).buffer);
        }

        if (bytes.length !== 32) {
            throw new Error(`Invalid X25519 public key length: ${bytes.length} (expected 32)`);
        }

        return this.wrapPublicKey(bytes);
    }

    /**
     * Perform X25519 Diffie-Hellman key exchange
     */
    static async ecdh(privateKey: CryptoKey, publicKey: CryptoKey): Promise<Uint8Array> {
        const privRaw = (privateKey as any)._raw as Uint8Array;
        const pubRaw = (publicKey as any)._raw as Uint8Array;

        if (!privRaw || !pubRaw) {
            throw new Error('Invalid key format for ECDH');
        }

        return x25519.getSharedSecret(privRaw, pubRaw);
    }

    /**
     * Sign data using Ed25519
     */
    static async sign(privateKey: CryptoKey, data: ArrayBuffer): Promise<ArrayBuffer> {
        const privRaw = (privateKey as any)._raw as Uint8Array;
        if (!privRaw) {
            throw new Error('Invalid private key format for signing');
        }
        const message = new Uint8Array(data);
        const signature = ed25519.sign(message, privRaw);
        // Return a new ArrayBuffer from the signature - copy to ensure we have an ArrayBuffer
        const result = new ArrayBuffer(signature.length);
        new Uint8Array(result).set(signature);
        return result;
    }

    /**
     * Verify Ed25519 signature
     */
    static async verify(publicKey: CryptoKey, signature: ArrayBuffer, data: ArrayBuffer): Promise<boolean> {
        const pubRaw = (publicKey as any)._raw as Uint8Array;
        if (!pubRaw) {
            throw new Error('Invalid public key format for verification');
        }
        const msg = new Uint8Array(data);
        const sig = new Uint8Array(signature);
        return ed25519.verify(sig, msg, pubRaw);
    }

    // ===== Helper functions for key wrapping =====

    private static async wrapPrivateKey(raw: Uint8Array): Promise<CryptoKey> {
        const wrapped = { _raw: raw, type: 'private', algorithm: { name: 'X25519' } };
        return wrapped as unknown as CryptoKey;
    }

    private static async wrapPublicKey(raw: Uint8Array): Promise<CryptoKey> {
        const wrapped = { _raw: raw, type: 'public', algorithm: { name: 'X25519' } };
        return wrapped as unknown as CryptoKey;
    }

    private static async wrapPrivateKeyEd(raw: Uint8Array): Promise<CryptoKey> {
        const wrapped = { _raw: raw, type: 'private', algorithm: { name: 'Ed25519' } };
        return wrapped as unknown as CryptoKey;
    }

    private static async wrapPublicKeyEd(raw: Uint8Array): Promise<CryptoKey> {
        const wrapped = { _raw: raw, type: 'public', algorithm: { name: 'Ed25519' } };
        return wrapped as unknown as CryptoKey;
    }

    // ===== Utility functions =====

    static arrayBufferToBase64(buffer: BufferSource): string {
        const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer as ArrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    static base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    static stringToArrayBuffer(str: string): ArrayBuffer {
        const encoder = new TextEncoder();
        return encoder.encode(str).buffer;
    }

    static arrayBufferToString(buffer: ArrayBuffer): string {
        const decoder = new TextDecoder();
        return decoder.decode(buffer);
    }

    static concat(...buffers: ArrayBuffer[] | Uint8Array[]): Uint8Array {
        const totalLength = buffers.reduce((acc, buf) => acc + buf.byteLength, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const buffer of buffers) {
            const uint8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
            result.set(uint8, offset);
            offset += uint8.byteLength;
        }
        return result;
    }

    static async hkdf(input: Uint8Array, salt: Uint8Array | null, info: BufferSource, length: number): Promise<ArrayBuffer> {
        const hkdfKey = await window.crypto.subtle.importKey(
            'raw',
            input as any,
            { name: 'HKDF' },
            false,
            ['deriveBits']
        );

        const bits = await window.crypto.subtle.deriveBits(
            {
                name: 'HKDF',
                hash: 'SHA-256',
                salt: salt ? (salt as unknown as BufferSource) : (new Uint8Array(32) as unknown as BufferSource),
                info: info
            },
            hkdfKey,
            length * 8
        );

        return bits;
    }

    static async deriveAesKey(sharedSecret: BufferSource, info: BufferSource): Promise<CryptoKey> {
        const hkdfKey = await window.crypto.subtle.importKey(
            'raw',
            sharedSecret,
            { name: 'HKDF' },
            false,
            ['deriveKey']
        );

        // Create a proper ArrayBuffer for salt
        const saltBuffer = new ArrayBuffer(32);
        const salt = new Uint8Array(saltBuffer);

        return window.crypto.subtle.deriveKey(
            {
                name: 'HKDF',
                hash: 'SHA-256',
                salt: salt as unknown as BufferSource,
                info: info
            },
            hkdfKey,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    }

    static async encrypt(key: CryptoKey, data: ArrayBuffer): Promise<{ ciphertext: ArrayBuffer, iv: ArrayBuffer }> {
        const ivBytes = randomBytes(12);
        // Copy IV to a new ArrayBuffer to ensure we have proper ArrayBuffer type
        const ivBuffer = new ArrayBuffer(ivBytes.length);
        const iv = new Uint8Array(ivBuffer);
        iv.set(ivBytes);

        const ciphertext = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            key,
            data
        );
        return { ciphertext, iv: ivBuffer };
    }

    static async decrypt(key: CryptoKey, ciphertext: ArrayBuffer, iv: Uint8Array): Promise<ArrayBuffer> {
        return window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv as unknown as BufferSource,
            },
            key,
            ciphertext
        );
    }
}
