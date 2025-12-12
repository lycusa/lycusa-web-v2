
export class SignalCrypto {
    static async generateKeyPair(): Promise<CryptoKeyPair> {
        return window.crypto.subtle.generateKey(
            {
                name: 'ECDH',
                namedCurve: 'P-256',
            },
            true,
            ['deriveKey', 'deriveBits']
        );
    }

    static generateRegistrationId(): number {
        return window.crypto.getRandomValues(new Uint32Array(1))[0] & 0x3fff;
    }

    // This generates the Signed PreKey Pair
    static async generateSigningKeyPair(): Promise<CryptoKeyPair> {
        return this.generateKeyPair();
    }

    static async exportPublicKey(key: CryptoKey): Promise<ArrayBuffer> {
        return window.crypto.subtle.exportKey('raw', key);
    }

    static async importPublicKey(buffer: BufferSource): Promise<CryptoKey> {
        return window.crypto.subtle.importKey(
            'raw',
            buffer,
            { name: 'ECDH', namedCurve: 'P-256' },
            true,
            []
        );
    }

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

    static async deriveAesKey(sharedSecret: BufferSource, info: BufferSource): Promise<CryptoKey> {
        // Use HKDF to derive key from shared secret
        const hkdfKey = await window.crypto.subtle.importKey(
            'raw',
            sharedSecret,
            { name: 'HKDF' },
            false,
            ['deriveKey']
        );

        return window.crypto.subtle.deriveKey(
            {
                name: 'HKDF',
                hash: 'SHA-256',
                salt: new Uint8Array(32), // Zero salt if not provided
                info: info
            },
            hkdfKey,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
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

    static async encrypt(key: CryptoKey, data: ArrayBuffer): Promise<{ ciphertext: ArrayBuffer, iv: ArrayBuffer }> {
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const ciphertext = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            key,
            data
        );
        return { ciphertext, iv: iv.buffer };
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

    static async ecdh(privateKey: CryptoKey, publicKey: CryptoKey): Promise<Uint8Array> {
        const bits = await window.crypto.subtle.deriveBits(
            {
                name: 'ECDH',
                public: publicKey,
            },
            privateKey,
            256
        );
        return new Uint8Array(bits);
    }

    // Helper for signing with an ECDH key (by re-importing as ECDSA)
    static async sign(privateKey: CryptoKey, data: ArrayBuffer): Promise<ArrayBuffer> {
        // Export partial private key
        const jwk = await window.crypto.subtle.exportKey('jwk', privateKey);

        // Import as ECDSA
        const signingKey = await window.crypto.subtle.importKey(
            'jwk',
            { ...jwk, key_ops: ['sign'] },
            { name: 'ECDSA', namedCurve: 'P-256' },
            false,
            ['sign']
        );

        return window.crypto.subtle.sign(
            {
                name: 'ECDSA',
                hash: { name: 'SHA-256' },
            },
            signingKey,
            data
        );
    }

    static async verify(publicKey: CryptoKey, signature: ArrayBuffer, data: ArrayBuffer): Promise<boolean> {
        const raw = await window.crypto.subtle.exportKey('raw', publicKey);
        const verifyKey = await window.crypto.subtle.importKey(
            'raw',
            raw,
            { name: 'ECDSA', namedCurve: 'P-256' },
            false,
            ['verify']
        );

        return window.crypto.subtle.verify(
            {
                name: 'ECDSA',
                hash: { name: 'SHA-256' },
            },
            verifyKey,
            signature,
            data
        );
    }
}
