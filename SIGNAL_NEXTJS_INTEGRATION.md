# Signal Protocol Integration Guide for Next.js

This guide explains how to integrate the Lycusa E2EE messaging microservice with a Next.js frontend application using the Signal Protocol for end-to-end encryption.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Project Structure](#project-structure)
5. [Signal Client Setup](#signal-client-setup)
6. [API Integration](#api-integration)
7. [WebSocket Integration](#websocket-integration)
8. [React Hooks](#react-hooks)
9. [Components](#components)
10. [Security Considerations](#security-considerations)
11. [Testing](#testing)

---

## Overview

The messaging service uses the Signal Protocol to provide:

- **End-to-End Encryption (E2EE)**: Messages are encrypted on the client and decrypted only by the recipient
- **Perfect Forward Secrecy (PFS)**: Compromised keys cannot decrypt past messages
- **Deniable Authentication**: Participants can verify each other without third-party proof

### Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Next.js App   │◄───────►│  Message Server │◄───────►│   Next.js App   │
│   (Client A)    │  WSS    │   (Phoenix)     │  WSS    │   (Client B)    │
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │                           │                           │
         │ IndexedDB                 │ PostgreSQL                │ IndexedDB
         │ (Private Keys)            │ (Public Keys,             │ (Private Keys)
         │ (Session State)           │  Encrypted Msgs)          │ (Session State)
         │                           │                           │
         ▼                           ▼                           ▼
    Keys never leave            Server CANNOT               Keys never leave
    the client                  read messages               the client
```

---

## Prerequisites

- Next.js 13+ (App Router recommended)
- Node.js 18+
- A running instance of the messaging microservice
- JWT authentication system

---

## Installation

### 1. Install Dependencies

```bash
npm install phoenix zustand
# or
yarn add phoenix zustand
# or
pnpm add phoenix zustand
```

### 2. Copy Signal Client Files

Copy the Signal Protocol client files from the microservice to your Next.js project:

```bash
mkdir -p src/lib/signal
cp path/to/microservice/priv/static/signal/*.js src/lib/signal/
```

Or create TypeScript versions (recommended):

```bash
touch src/lib/signal/KeyStore.ts
touch src/lib/signal/Crypto.ts
touch src/lib/signal/SignalClient.ts
touch src/lib/signal/types.ts
```

---

## Project Structure

```
src/
├── lib/
│   └── signal/
│       ├── types.ts           # TypeScript types
│       ├── KeyStore.ts        # IndexedDB storage
│       ├── Crypto.ts          # Cryptographic operations
│       ├── SignalClient.ts    # Main Signal client
│       └── index.ts           # Exports
├── hooks/
│   ├── useSignal.ts           # Signal Protocol hook
│   ├── useChat.ts             # Chat functionality hook
│   └── useSocket.ts           # WebSocket hook
├── stores/
│   └── chatStore.ts           # Zustand store for chat state
├── components/
│   └── chat/
│       ├── ChatRoom.tsx       # Main chat component
│       ├── MessageList.tsx    # Message display
│       ├── MessageInput.tsx   # Message input
│       └── SignalStatus.tsx   # Registration status
└── app/
    └── chat/
        └── [conversationId]/
            └── page.tsx       # Chat page
```

---

## Signal Client Setup

### Types (`src/lib/signal/types.ts`)

```typescript
export interface SignalIdentity {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyRaw: ArrayBuffer;
  registrationId: number;
}

export interface SignalSession {
  recipientId: string;
  conversationId: string;
  sharedSecret: string;
  ephemeralPublicKey?: string;
  messageCounter: number;
  isInitiator: boolean;
  createdAt: number;
}

export interface PreKeyBundle {
  registration_id: number;
  identity_key: string;
  signed_prekey_id: number;
  signed_prekey: string;
  signed_prekey_signature: string;
  onetime_prekey_id?: number;
  onetime_prekey?: string;
  recipient_needs_prekeys: boolean;
}

export interface EncryptedMessage {
  ciphertext: string;
  messageType: 1 | 2; // 1 = PreKeyMessage, 2 = SignalMessage
  sessionId: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  signal_ciphertext: string;
  signal_message_type: 1 | 2;
  inserted_at: string;
  decryptedContent?: string;
  media_key?: string;
  media_type?: string;
  media_size?: number;
  media_url?: string;
}
```

### KeyStore (`src/lib/signal/KeyStore.ts`)

```typescript
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
    const stored = await this.get(STORES.IDENTITY, 'local');
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
    return this.get(STORES.SESSIONS, key);
  }

  async hasSession(
    recipientId: string,
    conversationId: string
  ): Promise<boolean> {
    const session = await this.getSession(recipientId, conversationId);
    return session !== null;
  }

  // ... Additional methods for pre-keys (see full implementation)

  private async get<T>(storeName: string, key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async put(storeName: string, value: unknown): Promise<void> {
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

import { SignalIdentity, SignalSession } from './types';
```

### SignalClient (`src/lib/signal/SignalClient.ts`)

```typescript
import { KeyStore } from './KeyStore';
import { SignalCrypto } from './Crypto';
import type {
  PreKeyBundle,
  EncryptedMessage,
  SignalSession,
} from './types';

export class SignalClient {
  private baseUrl: string;
  private token: string;
  private keyStore: KeyStore;
  private initialized = false;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.keyStore = new KeyStore();
  }

  async init(): Promise<void> {
    await this.keyStore.init();
    this.initialized = true;
  }

  async isRegistered(): Promise<boolean> {
    return this.keyStore.hasIdentity();
  }

  /**
   * Register user with Signal Protocol.
   * Generates identity key, signed pre-key, and one-time pre-keys.
   */
  async register(): Promise<void> {
    if (!this.initialized) await this.init();

    // Generate identity key pair
    const identityKeyPair = await SignalCrypto.generateKeyPair();
    const registrationId = SignalCrypto.generateRegistrationId();
    const signingKeyPair = await SignalCrypto.generateSigningKeyPair();

    // Save identity locally
    await this.keyStore.saveIdentity(identityKeyPair, registrationId);

    // Export and upload to server
    const identityPublicKeyRaw = await SignalCrypto.exportPublicKey(
      identityKeyPair.publicKey
    );

    await this.apiCall('POST', '/identity', {
      identity_key: SignalCrypto.arrayBufferToBase64(identityPublicKeyRaw),
      registration_id: registrationId,
    });

    // Upload pre-keys
    await this.uploadSignedPreKey(signingKeyPair);
    await this.uploadOneTimePreKeys(100);
  }

  /**
   * Encrypt a message for a recipient.
   */
  async encryptMessage(
    recipientId: string,
    conversationId: string,
    plaintext: string
  ): Promise<EncryptedMessage> {
    if (!this.initialized) await this.init();

    let session = await this.keyStore.getSession(recipientId, conversationId);
    let messageType: 1 | 2 = 2;

    if (!session) {
      session = await this.establishSession(recipientId, conversationId);
      messageType = 1; // First message is PreKeyMessage
    }

    // Derive message key
    const sharedSecret = SignalCrypto.base64ToArrayBuffer(session.sharedSecret);
    const counterBytes = new Uint32Array([session.messageCounter]);
    const info = SignalCrypto.concat(
      SignalCrypto.stringToArrayBuffer('Message'),
      counterBytes.buffer
    );

    const messageKey = await SignalCrypto.deriveAesKey(sharedSecret, info);
    const plaintextBuffer = SignalCrypto.stringToArrayBuffer(plaintext);
    const { ciphertext, iv } = await SignalCrypto.encrypt(
      messageKey,
      plaintextBuffer
    );

    // Build envelope
    const envelope: Record<string, unknown> = {
      counter: session.messageCounter,
      iv: SignalCrypto.arrayBufferToBase64(iv),
      ciphertext: SignalCrypto.arrayBufferToBase64(ciphertext),
    };

    if (messageType === 1) {
      envelope.ephemeralKey = session.ephemeralPublicKey;
      envelope.signedPreKeyId = session.usedSignedPreKeyId;
      if (session.usedOneTimePreKeyId) {
        envelope.oneTimePreKeyId = session.usedOneTimePreKeyId;
      }
    }

    // Update counter
    session.messageCounter++;
    await this.keyStore.saveSession(recipientId, conversationId, session);

    return {
      ciphertext: btoa(JSON.stringify(envelope)),
      messageType,
      sessionId: `${recipientId}:${conversationId}`,
    };
  }

  /**
   * Decrypt a received message.
   */
  async decryptMessage(
    senderId: string,
    conversationId: string,
    ciphertextBase64: string,
    messageType: 1 | 2
  ): Promise<string> {
    if (!this.initialized) await this.init();

    const envelope = JSON.parse(atob(ciphertextBase64));
    let session = await this.keyStore.getSession(senderId, conversationId);

    if (messageType === 1 && !session) {
      session = await this.processPreKeyMessage(
        senderId,
        conversationId,
        envelope
      );
    }

    if (!session) {
      throw new Error('No session found for sender');
    }

    // Derive message key
    const sharedSecret = SignalCrypto.base64ToArrayBuffer(session.sharedSecret);
    const counterBytes = new Uint32Array([envelope.counter]);
    const info = SignalCrypto.concat(
      SignalCrypto.stringToArrayBuffer('Message'),
      counterBytes.buffer
    );

    const messageKey = await SignalCrypto.deriveAesKey(sharedSecret, info);
    const ciphertext = SignalCrypto.base64ToArrayBuffer(envelope.ciphertext);
    const iv = new Uint8Array(SignalCrypto.base64ToArrayBuffer(envelope.iv));
    const plaintextBuffer = await SignalCrypto.decrypt(
      messageKey,
      ciphertext,
      iv
    );

    return SignalCrypto.arrayBufferToString(plaintextBuffer);
  }

  /**
   * Establish session with recipient using X3DH.
   */
  private async establishSession(
    recipientId: string,
    conversationId: string
  ): Promise<SignalSession> {
    const bundle = await this.apiCall<PreKeyBundle>(
      'GET',
      `/bundle/${recipientId}`
    );
    const identity = await this.keyStore.getIdentity();

    if (!identity) {
      throw new Error('Not registered. Call register() first.');
    }

    // Import recipient's keys
    const recipientIdentityKey = await SignalCrypto.importPublicKey(
      SignalCrypto.base64ToArrayBuffer(bundle.identity_key)
    );
    const recipientSignedPreKey = await SignalCrypto.importPublicKey(
      SignalCrypto.base64ToArrayBuffer(bundle.signed_prekey)
    );

    let recipientOneTimePreKey: CryptoKey | null = null;
    if (bundle.onetime_prekey) {
      recipientOneTimePreKey = await SignalCrypto.importPublicKey(
        SignalCrypto.base64ToArrayBuffer(bundle.onetime_prekey)
      );
    }

    // Generate ephemeral key
    const ephemeralKeyPair = await SignalCrypto.generateKeyPair();
    const ephemeralPublicKeyRaw = await SignalCrypto.exportPublicKey(
      ephemeralKeyPair.publicKey
    );

    // X3DH key agreement
    const dh1 = await SignalCrypto.ecdh(
      identity.privateKey,
      recipientSignedPreKey
    );
    const dh2 = await SignalCrypto.ecdh(
      ephemeralKeyPair.privateKey,
      recipientIdentityKey
    );
    const dh3 = await SignalCrypto.ecdh(
      ephemeralKeyPair.privateKey,
      recipientSignedPreKey
    );

    let dhConcat: Uint8Array;
    if (recipientOneTimePreKey) {
      const dh4 = await SignalCrypto.ecdh(
        ephemeralKeyPair.privateKey,
        recipientOneTimePreKey
      );
      dhConcat = SignalCrypto.concat(dh1, dh2, dh3, dh4);
    } else {
      dhConcat = SignalCrypto.concat(dh1, dh2, dh3);
    }

    // Derive shared secret
    const info = SignalCrypto.stringToArrayBuffer('Signal Protocol');
    const sharedSecret = await SignalCrypto.hkdf(dhConcat, null, info, 32);

    const session: SignalSession = {
      recipientId,
      conversationId,
      sharedSecret: SignalCrypto.arrayBufferToBase64(sharedSecret),
      ephemeralPublicKey: SignalCrypto.arrayBufferToBase64(ephemeralPublicKeyRaw),
      usedSignedPreKeyId: bundle.signed_prekey_id,
      usedOneTimePreKeyId: bundle.onetime_prekey_id,
      messageCounter: 0,
      isInitiator: true,
      createdAt: Date.now(),
    };

    await this.keyStore.saveSession(recipientId, conversationId, session);

    // Notify server
    try {
      await this.apiCall('POST', '/sessions', {
        conversation_id: conversationId,
        recipient_id: recipientId,
        used_signed_prekey_id: bundle.signed_prekey_id,
        used_onetime_prekey_id: bundle.onetime_prekey_id,
      });
    } catch (e) {
      console.warn('Failed to notify server of session', e);
    }

    return session;
  }

  private async apiCall<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown' }));
      throw new Error(error.error || `API error: ${response.status}`);
    }

    return response.json();
  }

  // ... Additional methods (uploadSignedPreKey, uploadOneTimePreKeys, etc.)
}
```

---

## API Integration

### API Client (`src/lib/api/signal.ts`)

```typescript
const API_BASE = process.env.NEXT_PUBLIC_MSG_SERVICE_URL || 'http://localhost:4000';

export const signalApi = {
  async registerIdentity(token: string, identityKey: string, registrationId: number) {
    const response = await fetch(`${API_BASE}/api/signal/identity`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identity_key: identityKey,
        registration_id: registrationId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to register identity');
    }

    return response.json();
  },

  async getPreKeyBundle(token: string, userId: string) {
    const response = await fetch(`${API_BASE}/api/signal/bundle/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get pre-key bundle');
    }

    return response.json();
  },

  async uploadSignedPreKey(
    token: string,
    keyId: number,
    publicKey: string,
    signature: string
  ) {
    const response = await fetch(`${API_BASE}/api/signal/prekeys/signed`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key_id: keyId,
        public_key: publicKey,
        signature: signature,
      }),
    });

    return response.json();
  },

  async uploadOneTimePreKeys(
    token: string,
    prekeys: Array<{ key_id: number; public_key: string }>
  ) {
    const response = await fetch(`${API_BASE}/api/signal/prekeys/onetime`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prekeys }),
    });

    return response.json();
  },

  async getPreKeyCount(token: string) {
    const response = await fetch(`${API_BASE}/api/signal/prekeys/count`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.json();
  },
};
```

---

## WebSocket Integration

### WebSocket Hook (`src/hooks/useSocket.ts`)

```typescript
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket, Channel } from 'phoenix';

const WS_URL = process.env.NEXT_PUBLIC_MSG_SERVICE_WS || 'ws://localhost:4000/socket';

interface UseSocketOptions {
  token: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: unknown) => void;
}

export function useSocket({ token, onConnect, onDisconnect, onError }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socket = new Socket(WS_URL, {
      params: { token },
    });

    socket.onOpen(() => {
      setIsConnected(true);
      onConnect?.();
    });

    socket.onClose(() => {
      setIsConnected(false);
      onDisconnect?.();
    });

    socket.onError((error) => {
      onError?.(error);
    });

    socket.connect();
    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, onConnect, onDisconnect, onError]);

  const joinChannel = useCallback((topic: string): Channel | null => {
    if (!socketRef.current) return null;

    const channel = socketRef.current.channel(topic, {});
    return channel;
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    joinChannel,
  };
}
```

### Chat Hook (`src/hooks/useChat.ts`)

```typescript
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Channel } from 'phoenix';
import { useSocket } from './useSocket';
import { useSignal } from './useSignal';
import type { ChatMessage } from '@/lib/signal/types';

interface UseChatOptions {
  token: string;
  conversationId: string;
  recipientId: string;
  userId: string;
}

export function useChat({
  token,
  conversationId,
  recipientId,
  userId
}: UseChatOptions) {
  const channelRef = useRef<Channel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isConnected, joinChannel } = useSocket({
    token,
    onConnect: () => console.log('Socket connected'),
    onError: (err) => setError(String(err)),
  });

  const {
    signalClient,
    isRegistered,
    encryptMessage,
    decryptMessage
  } = useSignal(token);

  // Join channel when connected
  useEffect(() => {
    if (!isConnected || !conversationId || !isRegistered) return;

    const channel = joinChannel(`room:${conversationId}`);
    if (!channel) return;

    channel
      .join()
      .receive('ok', () => {
        setIsJoined(true);
        setError(null);
      })
      .receive('error', (resp) => {
        setError(`Failed to join: ${JSON.stringify(resp)}`);
      });

    // Handle incoming messages
    channel.on('new_message', async (msg: ChatMessage) => {
      try {
        // Don't decrypt our own messages (already have plaintext)
        if (msg.sender_id === userId) {
          return;
        }

        const decrypted = await decryptMessage(
          msg.sender_id,
          conversationId,
          msg.signal_ciphertext,
          msg.signal_message_type
        );

        setMessages((prev) => [
          ...prev,
          { ...msg, decryptedContent: decrypted },
        ]);
      } catch (err) {
        console.error('Decryption failed:', err);
        setMessages((prev) => [
          ...prev,
          { ...msg, decryptedContent: '[Decryption failed]' },
        ]);
      }
    });

    channelRef.current = channel;

    return () => {
      channel.leave();
      channelRef.current = null;
      setIsJoined(false);
    };
  }, [isConnected, conversationId, isRegistered, userId, joinChannel, decryptMessage]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!channelRef.current || !isJoined || !isRegistered) {
      throw new Error('Not ready to send messages');
    }

    const encrypted = await encryptMessage(recipientId, conversationId, content);

    return new Promise<ChatMessage>((resolve, reject) => {
      channelRef.current!
        .push('new_message', {
          signal_ciphertext: encrypted.ciphertext,
          signal_message_type: encrypted.messageType,
        })
        .receive('ok', (response: ChatMessage) => {
          // Add sent message to local state with decrypted content
          const msgWithContent = { ...response, decryptedContent: content };
          setMessages((prev) => [...prev, msgWithContent]);
          resolve(msgWithContent);
        })
        .receive('error', (resp) => {
          reject(new Error(JSON.stringify(resp)));
        });
    });
  }, [isJoined, isRegistered, recipientId, conversationId, encryptMessage]);

  return {
    messages,
    sendMessage,
    isConnected,
    isJoined,
    isRegistered,
    error,
  };
}
```

---

## React Hooks

### Signal Hook (`src/hooks/useSignal.ts`)

```typescript
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { SignalClient } from '@/lib/signal/SignalClient';

const API_BASE = process.env.NEXT_PUBLIC_MSG_SERVICE_URL || 'http://localhost:4000';

export function useSignal(token: string) {
  const clientRef = useRef<SignalClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize client
  useEffect(() => {
    if (!token) return;

    const initClient = async () => {
      try {
        const client = new SignalClient(`${API_BASE}/api/signal`, token);
        await client.init();
        clientRef.current = client;
        setIsInitialized(true);

        // Check if already registered
        const registered = await client.isRegistered();
        setIsRegistered(registered);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      }
    };

    initClient();
  }, [token]);

  // Register with Signal Protocol
  const register = useCallback(async () => {
    if (!clientRef.current) {
      throw new Error('Client not initialized');
    }

    try {
      await clientRef.current.register();
      setIsRegistered(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    }
  }, []);

  // Encrypt message
  const encryptMessage = useCallback(
    async (recipientId: string, conversationId: string, plaintext: string) => {
      if (!clientRef.current || !isRegistered) {
        throw new Error('Not registered');
      }

      return clientRef.current.encryptMessage(
        recipientId,
        conversationId,
        plaintext
      );
    },
    [isRegistered]
  );

  // Decrypt message
  const decryptMessage = useCallback(
    async (
      senderId: string,
      conversationId: string,
      ciphertext: string,
      messageType: 1 | 2
    ) => {
      if (!clientRef.current) {
        throw new Error('Client not initialized');
      }

      return clientRef.current.decryptMessage(
        senderId,
        conversationId,
        ciphertext,
        messageType
      );
    },
    []
  );

  // Check pre-key count
  const checkPreKeys = useCallback(async () => {
    if (!clientRef.current) return null;
    return clientRef.current.checkPreKeyCount();
  }, []);

  return {
    signalClient: clientRef.current,
    isInitialized,
    isRegistered,
    error,
    register,
    encryptMessage,
    decryptMessage,
    checkPreKeys,
  };
}
```

---

## Components

### Chat Room (`src/components/chat/ChatRoom.tsx`)

```tsx
'use client';

import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { SignalStatus } from './SignalStatus';

interface ChatRoomProps {
  token: string;
  conversationId: string;
  recipientId: string;
  userId: string;
}

export function ChatRoom({
  token,
  conversationId,
  recipientId,
  userId,
}: ChatRoomProps) {
  const {
    messages,
    sendMessage,
    isConnected,
    isJoined,
    isRegistered,
    error,
  } = useChat({ token, conversationId, recipientId, userId });

  const [sending, setSending] = useState(false);

  const handleSend = async (content: string) => {
    if (!content.trim()) return;

    setSending(true);
    try {
      await sendMessage(content);
    } catch (err) {
      console.error('Failed to send:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Status Bar */}
      <div className="flex items-center gap-4 p-4 border-b">
        <SignalStatus
          isConnected={isConnected}
          isRegistered={isRegistered}
          isJoined={isJoined}
        />
        {error && (
          <span className="text-red-500 text-sm">{error}</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} currentUserId={userId} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <MessageInput
          onSend={handleSend}
          disabled={!isJoined || !isRegistered || sending}
          placeholder={
            !isRegistered
              ? 'Register with Signal Protocol first...'
              : !isJoined
              ? 'Joining room...'
              : 'Type an encrypted message...'
          }
        />
      </div>
    </div>
  );
}
```

### Message List (`src/components/chat/MessageList.tsx`)

```tsx
import type { ChatMessage } from '@/lib/signal/types';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No messages yet. Start a conversation!
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {messages.map((msg) => {
        const isSent = msg.sender_id === currentUserId;

        return (
          <div
            key={msg.id}
            className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                isSent
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="break-words">
                {msg.decryptedContent || '[Encrypted]'}
              </p>
              <div
                className={`text-xs mt-1 flex items-center gap-2 ${
                  isSent ? 'text-blue-200' : 'text-gray-500'
                }`}
              >
                <span>
                  {new Date(msg.inserted_at).toLocaleTimeString()}
                </span>
                <span className="flex items-center gap-1">
                  <LockIcon className="w-3 h-3" />
                  Signal
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}
```

### Message Input (`src/components/chat/MessageInput.tsx`)

```tsx
'use client';

import { useState, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const [content, setContent] = useState('');

  const handleSend = () => {
    if (!content.trim() || disabled) return;
    onSend(content.trim());
    setContent('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !content.trim()}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        Send
      </button>
    </div>
  );
}
```

### Signal Status (`src/components/chat/SignalStatus.tsx`)

```tsx
interface SignalStatusProps {
  isConnected: boolean;
  isRegistered: boolean;
  isJoined: boolean;
}

export function SignalStatus({
  isConnected,
  isRegistered,
  isJoined,
}: SignalStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <StatusBadge
        active={isConnected}
        label={isConnected ? 'Connected' : 'Disconnected'}
      />
      <StatusBadge
        active={isRegistered}
        label={isRegistered ? 'E2EE Active' : 'Not Registered'}
        variant="security"
      />
      {isRegistered && (
        <StatusBadge
          active={isJoined}
          label={isJoined ? 'In Room' : 'Not Joined'}
        />
      )}
    </div>
  );
}

interface StatusBadgeProps {
  active: boolean;
  label: string;
  variant?: 'default' | 'security';
}

function StatusBadge({ active, label, variant = 'default' }: StatusBadgeProps) {
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';

  const colorClasses = active
    ? variant === 'security'
      ? 'bg-green-100 text-green-800'
      : 'bg-blue-100 text-blue-800'
    : 'bg-gray-100 text-gray-600';

  return (
    <span className={`${baseClasses} ${colorClasses}`}>
      {label}
    </span>
  );
}
```

---

## Chat Page (`src/app/chat/[conversationId]/page.tsx`)

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { useSignal } from '@/hooks/useSignal';

export default function ChatPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;

  // Get these from your auth system
  const [token, setToken] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [recipientId, setRecipientId] = useState<string>('');

  const { isInitialized, isRegistered, register, error } = useSignal(token);

  // Handle registration if needed
  const handleRegister = async () => {
    try {
      await register();
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  if (!token) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Chat Setup</h1>
        <p className="text-gray-600 mb-4">
          Enter your authentication details to start chatting.
        </p>
        {/* Add form to collect token, userId, recipientId */}
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p>Initializing Signal Protocol...</p>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">
            Signal Protocol Registration
          </h1>
          <p className="text-gray-600 mb-6">
            To use end-to-end encryption, you need to register your device with
            the Signal Protocol. This generates your encryption keys locally.
          </p>
          {error && (
            <p className="text-red-500 mb-4">{error}</p>
          )}
          <button
            onClick={handleRegister}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Register for E2EE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <ChatRoom
        token={token}
        conversationId={conversationId}
        recipientId={recipientId}
        userId={userId}
      />
    </div>
  );
}
```

---

## Security Considerations

### 1. Key Storage

- Private keys are stored in IndexedDB with `extractable: true` for export
- Consider additional encryption of IndexedDB using a user-derived key
- Clear keys on logout

```typescript
// Clear all Signal data on logout
async function logout() {
  const keyStore = new KeyStore();
  await keyStore.init();
  await keyStore.clearAll();
}
```

### 2. Token Security

- Store JWT tokens securely (httpOnly cookies preferred)
- Implement token refresh
- Don't expose tokens in URLs

### 3. HTTPS/WSS

- Always use HTTPS for API calls
- Always use WSS for WebSocket connections

```typescript
const WS_URL = process.env.NODE_ENV === 'production'
  ? 'wss://your-domain.com/socket'
  : 'ws://localhost:4000/socket';
```

### 4. Identity Verification

- Implement safety number comparison for identity verification
- Alert users when recipient's identity key changes

```typescript
async function getIdentityFingerprint(userId: string) {
  const response = await fetch(`/api/signal/identity/${userId}`);
  const { identity_key } = await response.json();

  // Create fingerprint from identity key
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    SignalCrypto.base64ToArrayBuffer(identity_key)
  );

  // Format as readable fingerprint
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join(' ')
    .toUpperCase();
}
```

### 5. Pre-Key Management

- Monitor pre-key count and replenish when low
- Implement automatic pre-key replenishment

```typescript
// Check pre-keys periodically
useEffect(() => {
  const interval = setInterval(async () => {
    const { needs_replenishment } = await checkPreKeys();
    if (needs_replenishment) {
      await signalClient.uploadOneTimePreKeys(50);
    }
  }, 60000); // Every minute

  return () => clearInterval(interval);
}, []);
```

---

## Testing

### Unit Tests

```typescript
// __tests__/signal/SignalClient.test.ts
import { SignalClient } from '@/lib/signal/SignalClient';

describe('SignalClient', () => {
  let client: SignalClient;

  beforeEach(async () => {
    // Mock IndexedDB
    const { indexedDB } = require('fake-indexeddb');
    global.indexedDB = indexedDB;

    client = new SignalClient('http://localhost:4000/api/signal', 'test-token');
    await client.init();
  });

  test('should initialize', async () => {
    expect(await client.isRegistered()).toBe(false);
  });

  test('should encrypt and decrypt message', async () => {
    // Mock registration
    await client.register();

    const plaintext = 'Hello, World!';
    const encrypted = await client.encryptMessage(
      'recipient-id',
      'conversation-id',
      plaintext
    );

    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.messageType).toBe(1); // First message
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/chat.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatRoom } from '@/components/chat/ChatRoom';

describe('ChatRoom Integration', () => {
  test('should send encrypted message', async () => {
    render(
      <ChatRoom
        token="test-token"
        conversationId="conv-123"
        recipientId="user-456"
        userId="user-123"
      />
    );

    // Wait for registration
    await waitFor(() => {
      expect(screen.getByText('E2EE Active')).toBeInTheDocument();
    });

    // Type and send message
    const input = screen.getByPlaceholderText(/type/i);
    fireEvent.change(input, { target: { value: 'Hello!' } });
    fireEvent.click(screen.getByText('Send'));

    // Verify message appears
    await waitFor(() => {
      expect(screen.getByText('Hello!')).toBeInTheDocument();
    });
  });
});
```

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_MSG_SERVICE_URL=http://localhost:4000
NEXT_PUBLIC_MSG_SERVICE_WS=ws://localhost:4000/socket

# Production
# NEXT_PUBLIC_MSG_SERVICE_URL=https://msg.yourdomain.com
# NEXT_PUBLIC_MSG_SERVICE_WS=wss://msg.yourdomain.com/socket
```

---

## Troubleshooting

### Common Issues

1. **"Not registered" error**
   - Ensure `register()` was called before sending messages
   - Check IndexedDB for stored identity

2. **Decryption fails**
   - Verify both users are registered
   - Check that session was established correctly
   - Ensure message type matches (PreKey vs Signal)

3. **WebSocket connection fails**
   - Verify JWT token is valid
   - Check CORS configuration on server
   - Ensure WebSocket URL is correct

4. **Pre-key exhaustion**
   - Implement automatic pre-key replenishment
   - Monitor `/api/signal/prekeys/count` endpoint

### Debug Mode

```typescript
// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development';

function debugLog(...args: unknown[]) {
  if (DEBUG) {
    console.log('[Signal]', ...args);
  }
}

// Use in SignalClient
async encryptMessage(...) {
  debugLog('Encrypting message for', recipientId);
  // ...
}
```

---

## API Reference

### Signal Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/signal/identity` | POST | Register identity key |
| `/api/signal/identity/:id` | GET | Get user's identity |
| `/api/signal/prekeys/signed` | POST | Upload signed pre-key |
| `/api/signal/prekeys/onetime` | POST | Upload one-time pre-keys |
| `/api/signal/prekeys/count` | GET | Get pre-key count |
| `/api/signal/bundle/:id` | GET | Get pre-key bundle |
| `/api/signal/sessions` | POST | Notify session created |

### WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `new_message` | Send | `{ signal_ciphertext, signal_message_type }` |
| `new_message` | Receive | `{ id, sender_id, signal_ciphertext, signal_message_type, inserted_at }` |
| `room_closed` | Receive | `{ reason }` |

---

## Additional Resources

- [Signal Protocol Specification](https://signal.org/docs/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Phoenix Channels JS Client](https://hexdocs.pm/phoenix/js/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
