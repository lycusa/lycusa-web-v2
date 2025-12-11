/**
 * E2E Encryption utilities using Web Crypto API
 * Implements ECDH P-256 key exchange + AES-GCM-256 encryption
 */

// Storage keys for IndexedDB
const DB_NAME = "lycusa_e2ee";
const STORE_NAME = "keys";
const PRIVATE_KEY_STORAGE = "lycusa_e2ee_private_key";
const PUBLIC_KEY_STORAGE = "lycusa_e2ee_public_key";

// Enable debug logging
const DEBUG_E2EE = true;

const debugLog = (...args: unknown[]) => {
  if (DEBUG_E2EE) {
    console.log("[E2EE Debug]", ...args);
  }
};

// ===== Type Definitions =====

export interface E2EEKeyPair {
  privateKey: CryptoKey;
  publicKey: CryptoKey;
}

export interface EncryptedData {
  encrypted: string; // base64
  nonce: string; // base64
}

// ===== Helper Functions =====

/**
 * Convert ArrayBuffer to Base64 string
 */
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Convert Base64 string to ArrayBuffer
 */
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// ===== Key Generation =====

/**
 * Generate a new ECDH key pair for E2E encryption
 */
export const generateKeyPair = async (): Promise<E2EEKeyPair> => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true, // extractable (needed for export/storage)
    ["deriveKey", "deriveBits"]
  );

  return {
    privateKey: keyPair.privateKey,
    publicKey: keyPair.publicKey,
  };
};

/**
 * Export public key to base64 for server storage
 */
export const exportPublicKey = async (publicKey: CryptoKey): Promise<string> => {
  const exported = await window.crypto.subtle.exportKey("raw", publicKey);
  const base64 = arrayBufferToBase64(exported);
  debugLog("Exported public key length:", exported.byteLength, "bytes");
  debugLog("Public key fingerprint:", await getKeyFingerprint(base64));
  return base64;
};

/**
 * Get a short fingerprint of a base64 public key for debugging
 */
export const getKeyFingerprint = async (base64Key: string): Promise<string> => {
  try {
    const keyData = base64ToArrayBuffer(base64Key);
    const hash = await window.crypto.subtle.digest("SHA-256", keyData);
    const hashArray = Array.from(new Uint8Array(hash));
    return hashArray.slice(0, 4).map(b => b.toString(16).padStart(2, '0')).join(':');
  } catch {
    return "unknown";
  }
};

/**
 * Import a public key from base64 (from server)
 */
export const importPublicKey = async (base64Key: string): Promise<CryptoKey> => {
  debugLog("Importing public key...");
  debugLog("Public key fingerprint:", await getKeyFingerprint(base64Key));

  const keyData = base64ToArrayBuffer(base64Key);
  debugLog("Key data length:", keyData.byteLength, "bytes");

  // P-256 uncompressed public key should be 65 bytes (04 || x || y)
  if (keyData.byteLength !== 65) {
    console.warn("[E2EE] Warning: Public key is not 65 bytes (P-256 uncompressed), got:", keyData.byteLength);
    // Check if it might be a 32-byte X25519 key
    if (keyData.byteLength === 32) {
      throw new Error("Public key appears to be X25519 (32 bytes), but P-256 ECDH is expected (65 bytes). Key format mismatch.");
    }
  }

  try {
    const key = await window.crypto.subtle.importKey(
      "raw",
      keyData,
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      []
    );
    debugLog("Public key imported successfully");
    return key;
  } catch (err) {
    console.error("[E2EE] Failed to import public key:", err);
    console.error("[E2EE] Key data length was:", keyData.byteLength, "bytes");
    throw err;
  }
};

// ===== Key Exchange =====

/**
 * Derive shared secret from ECDH key exchange
 * This creates a symmetric AES-GCM key for encryption/decryption
 */
export const deriveSharedKey = async (
  privateKey: CryptoKey,
  recipientPublicKey: CryptoKey
): Promise<CryptoKey> => {
  debugLog("Deriving shared key...");
  debugLog("Private key algorithm:", privateKey.algorithm);
  debugLog("Recipient public key algorithm:", recipientPublicKey.algorithm);

  try {
    const sharedKey = await window.crypto.subtle.deriveKey(
      {
        name: "ECDH",
        public: recipientPublicKey,
      },
      privateKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      false, // not extractable (security)
      ["encrypt", "decrypt"]
    );
    debugLog("Shared key derived successfully");
    return sharedKey;
  } catch (err) {
    console.error("[E2EE] Failed to derive shared key:", err);
    throw err;
  }
};

// ===== Message Encryption/Decryption =====

/**
 * Encrypt a message using AES-GCM
 */
export const encryptMessage = async (
  plaintext: string,
  sharedKey: CryptoKey
): Promise<EncryptedData> => {
  // Generate random IV (12 bytes for AES-GCM)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedMessage = new TextEncoder().encode(plaintext);

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    sharedKey,
    encodedMessage
  );

  return {
    encrypted: arrayBufferToBase64(encrypted),
    nonce: arrayBufferToBase64(iv.buffer),
  };
};

/**
 * Decrypt a message using AES-GCM
 */
export const decryptMessage = async (
  encryptedBase64: string,
  nonceBase64: string,
  sharedKey: CryptoKey
): Promise<string> => {
  debugLog("Decrypting message...");
  debugLog("Encrypted base64 length:", encryptedBase64.length);
  debugLog("Nonce base64:", nonceBase64);

  try {
    const encrypted = base64ToArrayBuffer(encryptedBase64);
    const iv = base64ToArrayBuffer(nonceBase64);

    debugLog("Encrypted bytes length:", encrypted.byteLength);
    debugLog("IV bytes length:", iv.byteLength);

    if (iv.byteLength !== 12) {
      console.warn("[E2EE] Warning: IV length is not 12 bytes, got:", iv.byteLength);
    }

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(iv),
      },
      sharedKey,
      encrypted
    );

    const result = new TextDecoder().decode(decrypted);
    debugLog("Decryption successful, message length:", result.length);
    return result;
  } catch (err) {
    console.error("[E2EE] Decryption failed:", err);
    console.error("[E2EE] Encrypted content (first 50 chars):", encryptedBase64.substring(0, 50));
    console.error("[E2EE] Nonce:", nonceBase64);
    throw err;
  }
};

// ===== File Encryption/Decryption =====

/**
 * Encrypt a file/blob
 */
export const encryptFile = async (
  file: File | Blob,
  sharedKey: CryptoKey
): Promise<{ encrypted: Blob; nonce: string }> => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const fileBuffer = await file.arrayBuffer();

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    sharedKey,
    fileBuffer
  );

  return {
    encrypted: new Blob([encrypted], { type: "application/octet-stream" }),
    nonce: arrayBufferToBase64(iv.buffer),
  };
};

/**
 * Decrypt a file/blob
 */
export const decryptFile = async (
  encryptedBlob: Blob,
  nonceBase64: string,
  sharedKey: CryptoKey,
  mimeType: string
): Promise<Blob> => {
  const encrypted = await encryptedBlob.arrayBuffer();
  const iv = base64ToArrayBuffer(nonceBase64);

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(iv),
    },
    sharedKey,
    encrypted
  );

  return new Blob([decrypted], { type: mimeType });
};

/**
 * Encrypt metadata (filename, mime type) for encrypted media
 */
export const encryptMetadata = async (
  metadata: { filename: string; mimeType: string },
  sharedKey: CryptoKey
): Promise<EncryptedData> => {
  const jsonString = JSON.stringify(metadata);
  return encryptMessage(jsonString, sharedKey);
};

/**
 * Decrypt metadata for encrypted media
 */
export const decryptMetadata = async (
  encryptedBase64: string,
  nonceBase64: string,
  sharedKey: CryptoKey
): Promise<{ filename: string; mimeType: string }> => {
  const decrypted = await decryptMessage(encryptedBase64, nonceBase64, sharedKey);
  return JSON.parse(decrypted);
};

// ===== Key Storage (IndexedDB) =====

/**
 * Open IndexedDB connection
 */
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

/**
 * Store key pair in IndexedDB (more secure than localStorage)
 */
export const storeKeyPair = async (keyPair: E2EEKeyPair): Promise<void> => {
  const db = await openDB();

  // Export keys to JWK format for storage
  const privateKeyJwk = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.privateKey
  );
  const publicKeyJwk = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.publicKey
  );

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    store.put(privateKeyJwk, PRIVATE_KEY_STORAGE);
    store.put(publicKeyJwk, PUBLIC_KEY_STORAGE);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

/**
 * Load key pair from IndexedDB
 */
export const loadKeyPair = async (): Promise<E2EEKeyPair | null> => {
  try {
    const db = await openDB();

    const getKey = (key: string): Promise<JsonWebKey | null> => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    };

    const privateKeyJwk = await getKey(PRIVATE_KEY_STORAGE);
    const publicKeyJwk = await getKey(PUBLIC_KEY_STORAGE);

    db.close();

    if (!privateKeyJwk || !publicKeyJwk) {
      return null;
    }

    // Import keys from JWK format
    const privateKey = await window.crypto.subtle.importKey(
      "jwk",
      privateKeyJwk,
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveKey", "deriveBits"]
    );

    const publicKey = await window.crypto.subtle.importKey(
      "jwk",
      publicKeyJwk,
      { name: "ECDH", namedCurve: "P-256" },
      true,
      []
    );

    return { privateKey, publicKey };
  } catch (error) {
    console.error("Failed to load key pair:", error);
    return null;
  }
};

/**
 * Clear stored keys (for logout or security reset)
 */
export const clearStoredKeys = async (): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.clear();

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  } catch (error) {
    // Ignore errors during cleanup
    console.warn("Failed to clear stored keys:", error);
  }
};

/**
 * Check if keys exist in storage
 */
export const hasStoredKeys = async (): Promise<boolean> => {
  try {
    const keyPair = await loadKeyPair();
    return keyPair !== null;
  } catch {
    return false;
  }
};

/**
 * Force regenerate keys - clears stored keys and generates new ones
 * Call this when there's a key mismatch that can't be resolved
 */
export const forceRegenerateKeys = async (): Promise<E2EEKeyPair> => {
  console.log("[E2EE] Force regenerating keys...");
  await clearStoredKeys();
  const keyPair = await generateKeyPair();
  await storeKeyPair(keyPair);
  console.log("[E2EE] New keys generated and stored");
  return keyPair;
};
