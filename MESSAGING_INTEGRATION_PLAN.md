# E2E Encrypted Messaging Service Integration Plan

## Overview

This document outlines the implementation plan for integrating the Lycusa E2E Encrypted Messaging Service into the Next.js frontend. The messaging service is an Elixir Phoenix application that provides WebSocket-based real-time messaging with client-side End-to-End Encryption (E2EE).

## Service Architecture Summary

### Messaging Service Features
- **Real-time messaging** via Phoenix Channels (WebSocket)
- **E2E Encryption** using ECDH P-256 + AES-GCM-256
- **JWT Authentication** (RS256, shared with auth service)
- **Media uploads** (encrypted and unencrypted)
- **Conversation lifecycle** tied to orders (via Kafka events)
- **Rate limiting** on all endpoints

### Key Endpoints

#### HTTP API (via API Gateway: `/messaging/*`)
```
GET  /api/conversations                     - List user conversations
GET  /api/conversations/:id/messages        - Get message history
POST /api/public_keys                       - Upload public key
GET  /api/public_keys/:user_id             - Get user's public key
POST /api/public_keys/batch                - Batch fetch public keys
POST /api/conversations/:id/media          - Upload media (unencrypted)
POST /api/conversations/:id/media/encrypted - Upload encrypted media
GET  /api/media/:key                       - Get presigned download URL
```

#### WebSocket
```
ws://host:port/socket/websocket?token=<JWT>
Topic: room:<conversation_id>
Events: new_message, room_closed
```

---

## Implementation Plan

### Phase 1: Foundation Setup

#### 1.1 Install Dependencies
```bash
npm install phoenix @noble/secp256k1
# or use Web Crypto API directly (no additional deps needed for crypto)
```

**Files to create/modify:**
- `package.json` - Add phoenix client

#### 1.2 Create Type Definitions
**File:** `app/lib/types/messaging.ts`

```typescript
// Conversation types
export interface Conversation {
  id: string;
  order_id: string;
  user_one_id: string;  // buyer
  user_two_id: string;  // seller
  status: ConversationStatus;
  last_message_at: string | null;
  inserted_at: string;
  updated_at: string;
}

export enum ConversationStatus {
  OPEN = "open",
  CLOSED = "closed",
}

// Message types
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  // Text message (one of these)
  content?: string;              // Plain text (legacy)
  encrypted_content?: string;    // E2EE encrypted (base64)
  nonce?: string;                // Encryption nonce (base64)
  // Media message
  media_key?: string;
  media_type?: MediaType;
  media_size?: number;
  media_filename?: string;
  media_mime_type?: string;
  media_url?: string;            // Presigned URL
  // Encrypted media metadata
  encrypted_media_metadata?: string;
  media_metadata_nonce?: string;
  // Timestamps
  inserted_at: string;
}

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
  FILE = "file",
}

// Public key types
export interface UserPublicKey {
  user_id: string;
  public_key: string;  // base64 encoded
  inserted_at: string;
  updated_at: string;
}

// Request/Response types
export interface SendMessagePayload {
  encrypted_content: string;
  nonce: string;
}

export interface SendMediaPayload {
  media_key: string;
  media_type: MediaType;
  media_size: number;
  media_filename: string;
  media_mime_type: string;
}

export interface UploadMediaResponse {
  ok: boolean;
  media_key: string;
  media_url: string;
  media_type: string;
  media_size: number;
  media_filename: string;
  media_mime_type: string;
}

// Decrypted message for UI
export interface DecryptedMessage extends Omit<Message, 'encrypted_content' | 'nonce'> {
  decryptedContent?: string;
  decryptionFailed?: boolean;
}
```

#### 1.3 Environment Configuration
**File:** `.env.local`

```bash
# Existing
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:4000

# Add messaging service direct URL for WebSocket
NEXT_PUBLIC_MESSAGING_WS_URL=ws://localhost:4001/socket/websocket
```

---

### Phase 2: API Integration

#### 2.1 Add Messaging API Functions
**File:** `app/lib/api.ts` (add to existing file)

```typescript
// ===== Messaging Service API =====

// List user's conversations
export const listConversations = async (): Promise<Conversation[]> => {
  const response = await api.get("/messaging/api/conversations");
  return response.data;
};

// Get conversation messages
export const getConversationMessages = async (
  conversationId: string
): Promise<Message[]> => {
  const response = await api.get(
    `/messaging/api/conversations/${conversationId}/messages`
  );
  return response.data;
};

// Get conversation by order ID
export const getConversationByOrderId = async (
  orderId: string
): Promise<Conversation | null> => {
  const conversations = await listConversations();
  return conversations.find(c => c.order_id === orderId) || null;
};

// ===== Public Key API =====

// Upload user's public key
export const uploadPublicKey = async (publicKey: string): Promise<void> => {
  await api.post("/messaging/api/public_keys", {
    public_key: publicKey,
  });
};

// Get a user's public key
export const getPublicKey = async (userId: string): Promise<string | null> => {
  try {
    const response = await api.get(`/messaging/api/public_keys/${userId}`);
    return response.data.public_key;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

// Batch get public keys
export const batchGetPublicKeys = async (
  userIds: string[]
): Promise<Record<string, string>> => {
  const response = await api.post("/messaging/api/public_keys/batch", {
    user_ids: userIds,
  });
  return response.data.public_keys;
};

// ===== Media API =====

// Upload media (unencrypted)
export const uploadMedia = async (
  conversationId: string,
  file: File,
  type: MediaType
): Promise<UploadMediaResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const response = await api.post(
    `/messaging/api/conversations/${conversationId}/media`,
    formData
  );
  return response.data;
};

// Upload encrypted media
export const uploadEncryptedMedia = async (
  conversationId: string,
  encryptedBlob: Blob,
  type: MediaType
): Promise<UploadMediaResponse> => {
  const formData = new FormData();
  formData.append("file", encryptedBlob);
  formData.append("type", type);

  const response = await api.post(
    `/messaging/api/conversations/${conversationId}/media/encrypted`,
    formData
  );
  return response.data;
};

// Get presigned media URL
export const getMediaUrl = async (mediaKey: string): Promise<string> => {
  const response = await api.get(
    `/messaging/api/media/${encodeURIComponent(mediaKey)}`
  );
  return response.data.url;
};
```

---

### Phase 3: E2E Encryption Module

#### 3.1 Create Crypto Utilities
**File:** `app/lib/crypto.ts`

```typescript
/**
 * E2E Encryption utilities using Web Crypto API
 * Implements ECDH P-256 key exchange + AES-GCM-256 encryption
 */

// Storage keys for encrypted keypair
const PRIVATE_KEY_STORAGE = "lycusa_e2ee_private_key";
const PUBLIC_KEY_STORAGE = "lycusa_e2ee_public_key";

// ECDH Key pair type
export interface E2EEKeyPair {
  privateKey: CryptoKey;
  publicKey: CryptoKey;
}

// Helper: ArrayBuffer to Base64
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Helper: Base64 to ArrayBuffer
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Generate a new ECDH key pair for E2E encryption
 */
export const generateKeyPair = async (): Promise<E2EEKeyPair> => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true, // extractable
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
  return arrayBufferToBase64(exported);
};

/**
 * Import a public key from base64 (from server)
 */
export const importPublicKey = async (base64Key: string): Promise<CryptoKey> => {
  const keyData = base64ToArrayBuffer(base64Key);
  return window.crypto.subtle.importKey(
    "raw",
    keyData,
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    []
  );
};

/**
 * Derive shared secret from ECDH key exchange
 */
export const deriveSharedKey = async (
  privateKey: CryptoKey,
  recipientPublicKey: CryptoKey
): Promise<CryptoKey> => {
  return window.crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: recipientPublicKey,
    },
    privateKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false, // not extractable
    ["encrypt", "decrypt"]
  );
};

/**
 * Encrypt a message using AES-GCM
 */
export const encryptMessage = async (
  plaintext: string,
  sharedKey: CryptoKey
): Promise<{ encrypted: string; nonce: string }> => {
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
    nonce: arrayBufferToBase64(iv),
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
  const encrypted = base64ToArrayBuffer(encryptedBase64);
  const iv = base64ToArrayBuffer(nonceBase64);

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(iv),
    },
    sharedKey,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
};

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
    nonce: arrayBufferToBase64(iv),
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

// ===== Key Storage (IndexedDB for security) =====

const DB_NAME = "lycusa_e2ee";
const STORE_NAME = "keys";

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
 * Store key pair in IndexedDB
 */
export const storeKeyPair = async (keyPair: E2EEKeyPair): Promise<void> => {
  const db = await openDB();

  // Export keys for storage
  const privateKeyJwk = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);
  const publicKeyJwk = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    store.put(privateKeyJwk, PRIVATE_KEY_STORAGE);
    store.put(publicKeyJwk, PUBLIC_KEY_STORAGE);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
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

    if (!privateKeyJwk || !publicKeyJwk) {
      return null;
    }

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
  } catch {
    return null;
  }
};

/**
 * Clear stored keys (for logout)
 */
export const clearStoredKeys = async (): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch {
    // Ignore errors during cleanup
  }
};
```

---

### Phase 4: WebSocket Integration

#### 4.1 Create Phoenix Socket Manager
**File:** `app/lib/socket.ts`

```typescript
import { Socket, Channel } from "phoenix";
import { getAccessToken } from "./auth";
import { Message, SendMessagePayload, SendMediaPayload } from "./types/messaging";

const MESSAGING_WS_URL = process.env.NEXT_PUBLIC_MESSAGING_WS_URL ||
  "ws://localhost:4001/socket/websocket";

// Singleton socket instance
let socket: Socket | null = null;
let activeChannels: Map<string, Channel> = new Map();

// Event listeners
type MessageHandler = (message: Message) => void;
type RoomClosedHandler = (data: { reason: string; conversation_id: string }) => void;

const messageHandlers: Map<string, Set<MessageHandler>> = new Map();
const roomClosedHandlers: Map<string, Set<RoomClosedHandler>> = new Map();

/**
 * Connect to the messaging WebSocket
 */
export const connectSocket = (): Socket => {
  if (socket?.isConnected()) {
    return socket;
  }

  const token = getAccessToken();
  if (!token) {
    throw new Error("No authentication token available");
  }

  socket = new Socket(MESSAGING_WS_URL, {
    params: { token },
    reconnectAfterMs: (tries) => {
      // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
      return Math.min(1000 * Math.pow(2, tries), 30000);
    },
    heartbeatIntervalMs: 30000,
  });

  socket.onError(() => {
    console.error("[WebSocket] Connection error");
  });

  socket.onClose(() => {
    console.log("[WebSocket] Connection closed");
  });

  socket.connect();

  return socket;
};

/**
 * Disconnect from the WebSocket
 */
export const disconnectSocket = (): void => {
  activeChannels.forEach((channel) => {
    channel.leave();
  });
  activeChannels.clear();
  messageHandlers.clear();
  roomClosedHandlers.clear();

  socket?.disconnect();
  socket = null;
};

/**
 * Join a conversation room
 */
export const joinRoom = (conversationId: string): Promise<Channel> => {
  return new Promise((resolve, reject) => {
    if (!socket) {
      connectSocket();
    }

    if (!socket) {
      reject(new Error("Socket not connected"));
      return;
    }

    // Check if already joined
    const existing = activeChannels.get(conversationId);
    if (existing) {
      resolve(existing);
      return;
    }

    const channel = socket.channel(`room:${conversationId}`, {});

    channel
      .join()
      .receive("ok", () => {
        console.log(`[WebSocket] Joined room:${conversationId}`);
        activeChannels.set(conversationId, channel);
        setupChannelHandlers(conversationId, channel);
        resolve(channel);
      })
      .receive("error", (err) => {
        console.error(`[WebSocket] Failed to join room:${conversationId}`, err);
        reject(err);
      })
      .receive("timeout", () => {
        console.error(`[WebSocket] Timeout joining room:${conversationId}`);
        reject(new Error("Timeout joining room"));
      });
  });
};

/**
 * Leave a conversation room
 */
export const leaveRoom = (conversationId: string): void => {
  const channel = activeChannels.get(conversationId);
  if (channel) {
    channel.leave();
    activeChannels.delete(conversationId);
    messageHandlers.delete(conversationId);
    roomClosedHandlers.delete(conversationId);
  }
};

/**
 * Setup event handlers for a channel
 */
const setupChannelHandlers = (conversationId: string, channel: Channel): void => {
  // Handle incoming messages
  channel.on("new_message", (payload: Message) => {
    const handlers = messageHandlers.get(conversationId);
    handlers?.forEach((handler) => handler(payload));
  });

  // Handle room closure
  channel.on("room_closed", (payload: { reason: string; conversation_id: string }) => {
    const handlers = roomClosedHandlers.get(conversationId);
    handlers?.forEach((handler) => handler(payload));
  });
};

/**
 * Send an encrypted message
 */
export const sendMessage = (
  conversationId: string,
  payload: SendMessagePayload
): Promise<Message> => {
  return new Promise((resolve, reject) => {
    const channel = activeChannels.get(conversationId);
    if (!channel) {
      reject(new Error("Not connected to room"));
      return;
    }

    channel
      .push("new_message", payload)
      .receive("ok", (response: Message) => {
        resolve(response);
      })
      .receive("error", (err) => {
        reject(err);
      })
      .receive("timeout", () => {
        reject(new Error("Message send timeout"));
      });
  });
};

/**
 * Send a media message
 */
export const sendMediaMessage = (
  conversationId: string,
  payload: SendMediaPayload
): Promise<Message> => {
  return new Promise((resolve, reject) => {
    const channel = activeChannels.get(conversationId);
    if (!channel) {
      reject(new Error("Not connected to room"));
      return;
    }

    channel
      .push("new_message", payload)
      .receive("ok", (response: Message) => {
        resolve(response);
      })
      .receive("error", (err) => {
        reject(err);
      })
      .receive("timeout", () => {
        reject(new Error("Message send timeout"));
      });
  });
};

/**
 * Subscribe to new messages in a room
 */
export const onMessage = (
  conversationId: string,
  handler: MessageHandler
): (() => void) => {
  if (!messageHandlers.has(conversationId)) {
    messageHandlers.set(conversationId, new Set());
  }
  messageHandlers.get(conversationId)!.add(handler);

  // Return unsubscribe function
  return () => {
    messageHandlers.get(conversationId)?.delete(handler);
  };
};

/**
 * Subscribe to room closed events
 */
export const onRoomClosed = (
  conversationId: string,
  handler: RoomClosedHandler
): (() => void) => {
  if (!roomClosedHandlers.has(conversationId)) {
    roomClosedHandlers.set(conversationId, new Set());
  }
  roomClosedHandlers.get(conversationId)!.add(handler);

  // Return unsubscribe function
  return () => {
    roomClosedHandlers.get(conversationId)?.delete(handler);
  };
};

/**
 * Check if connected to a room
 */
export const isInRoom = (conversationId: string): boolean => {
  return activeChannels.has(conversationId);
};

/**
 * Get connection status
 */
export const isConnected = (): boolean => {
  return socket?.isConnected() ?? false;
};
```

---

### Phase 5: React Hooks

#### 5.1 Create Messaging Hooks
**File:** `app/hooks/useMessaging.ts`

```typescript
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  connectSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  sendMessage as socketSendMessage,
  sendMediaMessage as socketSendMediaMessage,
  onMessage,
  onRoomClosed,
  isConnected,
} from "@/app/lib/socket";
import {
  listConversations,
  getConversationMessages,
  getPublicKey,
  uploadPublicKey,
  uploadMedia,
  uploadEncryptedMedia,
} from "@/app/lib/api";
import {
  generateKeyPair,
  exportPublicKey,
  importPublicKey,
  deriveSharedKey,
  encryptMessage,
  decryptMessage,
  encryptFile,
  loadKeyPair,
  storeKeyPair,
  E2EEKeyPair,
} from "@/app/lib/crypto";
import {
  Conversation,
  Message,
  DecryptedMessage,
  MediaType,
} from "@/app/lib/types/messaging";
import { getUserFromToken } from "@/app/lib/auth";

/**
 * Hook for E2EE key management
 */
export const useE2EEKeys = () => {
  const [keyPair, setKeyPair] = useState<E2EEKeyPair | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or load keys
  useEffect(() => {
    const initKeys = async () => {
      try {
        // Try to load existing keys
        let keys = await loadKeyPair();

        if (!keys) {
          // Generate new keys
          keys = await generateKeyPair();
          await storeKeyPair(keys);

          // Upload public key to server
          const publicKeyBase64 = await exportPublicKey(keys.publicKey);
          await uploadPublicKey(publicKeyBase64);
        }

        setKeyPair(keys);
        setIsInitialized(true);
      } catch (err: any) {
        console.error("Failed to initialize E2EE keys:", err);
        setError(err.message);
      }
    };

    initKeys();
  }, []);

  // Regenerate keys (e.g., for security reset)
  const regenerateKeys = useCallback(async () => {
    try {
      const keys = await generateKeyPair();
      await storeKeyPair(keys);

      const publicKeyBase64 = await exportPublicKey(keys.publicKey);
      await uploadPublicKey(publicKeyBase64);

      setKeyPair(keys);
      return keys;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return { keyPair, isInitialized, error, regenerateKeys };
};

/**
 * Hook for listing conversations
 */
export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listConversations();
      setConversations(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, loading, error, refetch: fetchConversations };
};

/**
 * Hook for a single conversation with real-time messaging
 */
export const useConversation = (conversationId: string) => {
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClosed, setIsClosed] = useState(false);
  const [closedReason, setClosedReason] = useState<string | null>(null);

  const { keyPair, isInitialized: keysReady } = useE2EEKeys();
  const sharedKeyRef = useRef<CryptoKey | null>(null);
  const recipientIdRef = useRef<string | null>(null);

  // Get current user
  const currentUser = getUserFromToken();

  // Derive shared key for encryption/decryption
  const deriveKey = useCallback(async (recipientId: string) => {
    if (!keyPair) return null;

    try {
      const recipientPublicKeyBase64 = await getPublicKey(recipientId);
      if (!recipientPublicKeyBase64) {
        console.warn(`No public key found for user ${recipientId}`);
        return null;
      }

      const recipientPublicKey = await importPublicKey(recipientPublicKeyBase64);
      const sharedKey = await deriveSharedKey(keyPair.privateKey, recipientPublicKey);

      sharedKeyRef.current = sharedKey;
      recipientIdRef.current = recipientId;

      return sharedKey;
    } catch (err) {
      console.error("Failed to derive shared key:", err);
      return null;
    }
  }, [keyPair]);

  // Decrypt a message
  const decryptMessageContent = useCallback(async (
    msg: Message,
    sharedKey: CryptoKey
  ): Promise<DecryptedMessage> => {
    if (msg.encrypted_content && msg.nonce) {
      try {
        const decryptedContent = await decryptMessage(
          msg.encrypted_content,
          msg.nonce,
          sharedKey
        );
        return { ...msg, decryptedContent, decryptionFailed: false };
      } catch (err) {
        console.error("Failed to decrypt message:", err);
        return { ...msg, decryptionFailed: true };
      }
    }
    // Plain text message (legacy)
    return { ...msg, decryptedContent: msg.content };
  }, []);

  // Fetch and decrypt message history
  useEffect(() => {
    if (!conversationId || !keysReady || !currentUser) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);

        // Get conversation to find recipient
        const conversations = await listConversations();
        const conversation = conversations.find(c => c.id === conversationId);

        if (!conversation) {
          setError("Conversation not found");
          return;
        }

        // Determine recipient (the other user in conversation)
        const recipientId = conversation.user_one_id === currentUser.id
          ? conversation.user_two_id
          : conversation.user_one_id;

        // Derive shared key
        const sharedKey = await deriveKey(recipientId);

        // Fetch messages
        const rawMessages = await getConversationMessages(conversationId);

        // Decrypt messages
        if (sharedKey) {
          const decrypted = await Promise.all(
            rawMessages.map(msg => decryptMessageContent(msg, sharedKey))
          );
          setMessages(decrypted);
        } else {
          // No shared key - show messages as-is (will show decryption failed)
          setMessages(rawMessages.map(msg => ({ ...msg, decryptionFailed: true })));
        }

        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId, keysReady, currentUser, deriveKey, decryptMessageContent]);

  // Connect to WebSocket room
  useEffect(() => {
    if (!conversationId || !keysReady) return;

    let unsubMessage: (() => void) | null = null;
    let unsubClosed: (() => void) | null = null;

    const connect = async () => {
      try {
        connectSocket();
        await joinRoom(conversationId);

        // Subscribe to new messages
        unsubMessage = onMessage(conversationId, async (msg: Message) => {
          if (sharedKeyRef.current) {
            const decrypted = await decryptMessageContent(msg, sharedKeyRef.current);
            setMessages(prev => [...prev, decrypted]);
          } else {
            setMessages(prev => [...prev, { ...msg, decryptionFailed: true }]);
          }
        });

        // Subscribe to room closure
        unsubClosed = onRoomClosed(conversationId, (data) => {
          setIsClosed(true);
          setClosedReason(data.reason);
        });
      } catch (err: any) {
        setError(err.message);
      }
    };

    connect();

    return () => {
      unsubMessage?.();
      unsubClosed?.();
      leaveRoom(conversationId);
    };
  }, [conversationId, keysReady, decryptMessageContent]);

  // Send encrypted message
  const sendMessage = useCallback(async (content: string) => {
    if (!sharedKeyRef.current) {
      throw new Error("Encryption not initialized");
    }

    const { encrypted, nonce } = await encryptMessage(content, sharedKeyRef.current);

    await socketSendMessage(conversationId, {
      encrypted_content: encrypted,
      nonce: nonce,
    });
  }, [conversationId]);

  // Send media message
  const sendMedia = useCallback(async (
    file: File,
    type: MediaType,
    encrypt: boolean = true
  ) => {
    if (encrypt && sharedKeyRef.current) {
      // Encrypt file before upload
      const { encrypted, nonce } = await encryptFile(file, sharedKeyRef.current);
      const response = await uploadEncryptedMedia(conversationId, encrypted, type);

      // Send media message via WebSocket
      await socketSendMediaMessage(conversationId, {
        media_key: response.media_key,
        media_type: type,
        media_size: response.media_size,
        media_filename: file.name,
        media_mime_type: file.type,
      });
    } else {
      // Upload without encryption
      const response = await uploadMedia(conversationId, file, type);

      await socketSendMediaMessage(conversationId, {
        media_key: response.media_key,
        media_type: type,
        media_size: response.media_size,
        media_filename: response.media_filename,
        media_mime_type: response.media_mime_type,
      });
    }
  }, [conversationId]);

  return {
    messages,
    loading,
    error,
    isClosed,
    closedReason,
    sendMessage,
    sendMedia,
    isConnected: isConnected(),
  };
};
```

---

### Phase 6: UI Components

#### 6.1 Component Structure
```
app/
├── messages/
│   ├── page.tsx                      # Conversations list page
│   └── [conversationId]/
│       └── page.tsx                  # Chat page
└── components/
    └── messages/
        ├── ConversationList.tsx      # List of conversations
        ├── ConversationCard.tsx      # Single conversation item
        ├── ChatContainer.tsx         # Main chat container
        ├── MessageList.tsx           # Scrollable message list
        ├── MessageBubble.tsx         # Single message bubble
        ├── MessageInput.tsx          # Text input + media upload
        ├── MediaPreview.tsx          # Image/video preview
        ├── EncryptionIndicator.tsx   # E2EE status indicator
        └── index.ts                  # Barrel exports
```

#### 6.2 Key Components Overview

**ConversationList.tsx** - Displays all user conversations
- Shows other participant info (fetch user details)
- Shows last message preview (decrypted)
- Shows unread indicator
- Links to chat page

**ChatContainer.tsx** - Main chat interface
- Header with recipient info + encryption status
- Message list
- Input area
- Handles E2EE initialization

**MessageBubble.tsx** - Individual message
- Different styles for sent/received
- Decrypted content display
- Decryption failed indicator
- Media preview for images/videos
- Timestamp

**MessageInput.tsx** - Message composition
- Text input
- Media upload button (image/video picker)
- Send button
- Disabled state when room is closed

**EncryptionIndicator.tsx** - E2EE status
- Lock icon when encrypted
- Warning when encryption unavailable
- Tooltip with encryption details

---

### Phase 7: Pages

#### 7.1 Conversations List Page
**File:** `app/messages/page.tsx`

```typescript
"use client";

import { useAuth } from "@/app/components/auth/AuthGuard";
import { useConversations, useE2EEKeys } from "@/app/hooks/useMessaging";
import ConversationList from "@/app/components/messages/ConversationList";
import EncryptionIndicator from "@/app/components/messages/EncryptionIndicator";

export default function MessagesPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { conversations, loading, error, refetch } = useConversations();
  const { isInitialized: keysReady, error: keyError } = useE2EEKeys();

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <RedirectToSignIn />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <EncryptionIndicator isInitialized={keysReady} error={keyError} />
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {conversations.length === 0 ? (
        <EmptyState message="No conversations yet" />
      ) : (
        <ConversationList
          conversations={conversations}
          currentUserId={user.id}
        />
      )}
    </div>
  );
}
```

#### 7.2 Chat Page
**File:** `app/messages/[conversationId]/page.tsx`

```typescript
"use client";

import { use } from "react";
import { useAuth } from "@/app/components/auth/AuthGuard";
import { useConversation } from "@/app/hooks/useMessaging";
import ChatContainer from "@/app/components/messages/ChatContainer";

interface Props {
  params: Promise<{ conversationId: string }>;
}

export default function ChatPage({ params }: Props) {
  const { conversationId } = use(params);
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const {
    messages,
    loading,
    error,
    isClosed,
    closedReason,
    sendMessage,
    sendMedia,
    isConnected,
  } = useConversation(conversationId);

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <RedirectToSignIn />;
  }

  return (
    <ChatContainer
      conversationId={conversationId}
      messages={messages}
      currentUserId={user.id}
      isClosed={isClosed}
      closedReason={closedReason}
      isConnected={isConnected}
      onSendMessage={sendMessage}
      onSendMedia={sendMedia}
      error={error}
    />
  );
}
```

---

### Phase 8: Integration Points

#### 8.1 Order Detail Integration
Add "Message Seller/Buyer" button on order detail pages.

**File:** `app/orders/[orderId]/page.tsx` (modify existing)

```typescript
// Add to imports
import { getConversationByOrderId } from "@/app/lib/api";
import Link from "next/link";

// In component
const [conversationId, setConversationId] = useState<string | null>(null);

useEffect(() => {
  const fetchConversation = async () => {
    const conversation = await getConversationByOrderId(orderId);
    if (conversation) {
      setConversationId(conversation.id);
    }
  };
  fetchConversation();
}, [orderId]);

// In render
{conversationId && (
  <Link
    href={`/messages/${conversationId}`}
    className="btn btn-primary"
  >
    Message {isBuyer ? 'Seller' : 'Buyer'}
  </Link>
)}
```

#### 8.2 Navigation Integration
Add Messages link to navigation/header.

**File:** `app/components/layout/Header.tsx` (or similar)

```typescript
// Add messages link with unread count badge
<Link href="/messages" className="nav-link">
  <MessageIcon />
  {unreadCount > 0 && (
    <span className="badge">{unreadCount}</span>
  )}
</Link>
```

#### 8.3 Auth Cleanup
Clear E2EE keys on logout.

**File:** `app/lib/auth.ts` (modify existing)

```typescript
import { clearStoredKeys } from "./crypto";

export const logout = async () => {
  clearTokens();
  await clearStoredKeys(); // Clear E2EE keys
  window.location.href = "/signin";
};
```

---

### Phase 9: API Gateway Configuration

The messaging service needs to be added to the API Gateway routing.

#### 9.1 Gateway Route Configuration
Add routes for messaging service:

```
/messaging/api/*     -> messaging-service:4001/api/*
/messaging/socket/*  -> messaging-service:4001/socket/* (WebSocket upgrade)
```

Or configure direct WebSocket connection from client to messaging service using `NEXT_PUBLIC_MESSAGING_WS_URL`.

---

## Implementation Order

### Sprint 1: Foundation (Days 1-2)
1. Install dependencies (`phoenix` client)
2. Create type definitions (`types/messaging.ts`)
3. Add environment configuration
4. Create crypto utilities (`crypto.ts`)
5. Add API functions to `api.ts`

### Sprint 2: Real-time Communication (Days 3-4)
1. Create socket manager (`socket.ts`)
2. Create messaging hooks (`useMessaging.ts`)
3. Test WebSocket connection and message flow

### Sprint 3: UI Components (Days 5-7)
1. Create base components:
   - `ConversationCard.tsx`
   - `MessageBubble.tsx`
   - `MessageInput.tsx`
   - `EncryptionIndicator.tsx`
2. Create container components:
   - `ConversationList.tsx`
   - `ChatContainer.tsx`
   - `MessageList.tsx`
3. Style with Tailwind CSS

### Sprint 4: Pages & Integration (Days 8-9)
1. Create messages list page (`/messages`)
2. Create chat page (`/messages/[conversationId]`)
3. Add Message button to order details
4. Add Messages link to navigation
5. Handle logout cleanup

### Sprint 5: Testing & Polish (Day 10)
1. Test E2EE flow end-to-end
2. Test media upload/download
3. Test room closure handling
4. Test reconnection scenarios
5. Polish UI/UX

---

## Security Considerations

1. **Private keys never leave the client** - Only public keys are uploaded
2. **IndexedDB for key storage** - More secure than localStorage
3. **Key regeneration option** - Allow users to reset their keys
4. **Decryption failure handling** - Show appropriate UI when decryption fails
5. **Room closure handling** - Disable input when conversation is closed
6. **Token validation** - JWT token attached to all requests

---

## Testing Checklist

- [ ] E2EE key generation and storage
- [ ] Public key upload/fetch
- [ ] Message encryption/decryption
- [ ] WebSocket connection/reconnection
- [ ] Real-time message receiving
- [ ] Message sending
- [ ] Media upload (encrypted)
- [ ] Media download and decryption
- [ ] Room closure notification
- [ ] Conversation list loading
- [ ] Message history loading
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness

---

## Dependencies Summary

```json
{
  "dependencies": {
    "phoenix": "^1.7.0"
  }
}
```

No additional crypto libraries needed - Web Crypto API is used.

---

## File Structure Summary

```
app/
├── lib/
│   ├── api.ts              # + messaging API functions
│   ├── auth.ts             # + logout cleanup
│   ├── crypto.ts           # NEW: E2EE utilities
│   ├── socket.ts           # NEW: Phoenix socket manager
│   └── types/
│       └── messaging.ts    # NEW: Messaging types
├── hooks/
│   └── useMessaging.ts     # NEW: Messaging React hooks
├── messages/
│   ├── page.tsx            # NEW: Conversations list
│   └── [conversationId]/
│       └── page.tsx        # NEW: Chat page
└── components/
    └── messages/
        ├── ConversationList.tsx
        ├── ConversationCard.tsx
        ├── ChatContainer.tsx
        ├── MessageList.tsx
        ├── MessageBubble.tsx
        ├── MessageInput.tsx
        ├── MediaPreview.tsx
        ├── EncryptionIndicator.tsx
        └── index.ts
```
