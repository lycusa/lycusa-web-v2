"use client";

/**
 * Messaging Hooks
 * React hooks for E2E encrypted messaging functionality
 * Now integrated with Signal Protocol
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  connectSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  sendMessage as socketSendMessage,
  sendMediaMessage as socketSendMediaMessage,
  onMessage,
  onRoomClosed,
  onConnection,
  onDisconnection,
  isConnected as checkIsConnected,
} from "@/app/lib/socket";
import {
  listConversations,
  getConversationMessages,
  getPublicKey,
  uploadPublicKey,
  uploadMessageMedia,
  uploadEncryptedMedia,
} from "@/app/lib/api";
import { useSignal } from "./useSignal";
import { getAccessToken } from "@/app/lib/auth";
import type {
  Conversation,
  Message,
  DecryptedMessage,
  MediaType,
  RoomClosedPayload,
} from "@/app/lib/types/messaging";
import { getUserFromToken } from "@/app/lib/auth";
import {
  exportPublicKey,
  importPublicKey,
  deriveSharedKey,
  encryptMessage,
  decryptMessage,
  encryptFile,
  getKeyFingerprint,
  E2EEKeyPair,
  loadKeyPair,
} from "@/app/lib/crypto";

// ===== useE2EEKeys Hook =====

interface UseE2EEKeysReturn {
  keyPair: E2EEKeyPair | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  regenerateKeys: () => Promise<E2EEKeyPair>;
  clearKeys: () => Promise<void>;
}

/**
 * Hook for E2EE key management
 * Handles key generation, storage, and upload to server
 */
// Removed Legacy useE2EEKeys logic (replaced by signal)

// ===== useConversations Hook =====

interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  refetch: (forceRefresh?: boolean) => Promise<void>;
}

/**
 * Hook for listing user's conversations
 * Uses cache layer to prevent excessive API calls
 */
export const useConversations = (): UseConversationsReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sort conversations helper
  const sortConversations = useCallback((data: Conversation[]): Conversation[] => {
    return [...data].sort((a, b) => {
      const aTime = a.last_message_at
        ? new Date(a.last_message_at).getTime()
        : 0;
      const bTime = b.last_message_at
        ? new Date(b.last_message_at).getTime()
        : 0;
      return bTime - aTime;
    });
  }, []);

  const fetchConversations = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await listConversations(forceRefresh);
      setConversations(sortConversations(data));
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load conversations";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sortConversations]);

  // Initial fetch and subscribe to cache updates
  useEffect(() => {
    fetchConversations();

    // Subscribe to cache updates for real-time reflection
    let unsubscribe: (() => void) | null = null;

    import("@/app/lib/conversationsCache").then(({ subscribeToConversations }) => {
      unsubscribe = subscribeToConversations((data) => {
        setConversations(sortConversations(data));
      });
    });

    return () => {
      unsubscribe?.();
    };
  }, [fetchConversations, sortConversations]);

  return { conversations, loading, error, refetch: fetchConversations };
};

// Use E2EE Keys alias for compatibility - loads legacy crypto keys
// Signal protocol is used for new messages, but we still need this for UI compatibility
export const useE2EEKeys = () => {
  const [keyPair, setKeyPair] = useState<E2EEKeyPair | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initKeys = async () => {
      try {
        // First try to load existing keys
        let keys = await loadKeyPair();

        // If no keys exist, generate new ones
        if (!keys) {
          console.log("[E2EE] No keys found, generating new key pair...");
          const { generateKeyPair, storeKeyPair, exportPublicKey } = await import("@/app/lib/crypto");
          keys = await generateKeyPair();
          await storeKeyPair(keys);
          console.log("[E2EE] New keys generated and stored");

          // Upload public key to server
          try {
            const publicKeyBase64 = await exportPublicKey(keys.publicKey);
            const { uploadPublicKey } = await import("@/app/lib/api");
            await uploadPublicKey(publicKeyBase64);
            console.log("[E2EE] Public key uploaded to server");
          } catch (uploadErr) {
            console.warn("[E2EE] Failed to upload public key:", uploadErr);
            // Don't fail initialization, encryption can still work locally
          }
        }

        setKeyPair(keys);
        setIsInitialized(true);
      } catch (err) {
        console.error("[E2EE] Failed to initialize keys:", err);
        setError(err instanceof Error ? err.message : "Failed to initialize keys");
      } finally {
        setIsLoading(false);
      }
    };
    if (typeof window !== "undefined") {
      initKeys();
    }
  }, []);

  return {
    isInitialized,
    keyPair,
    error,
    regenerateKeys: async () => keyPair!, // Stub
    clearKeys: async () => { }, // Not impl
    isLoading
  };
}

// ===== useConversation Hook =====

interface UseConversationReturn {
  conversation: Conversation | null;
  messages: DecryptedMessage[];
  loading: boolean;
  error: string | null;
  isClosed: boolean;
  closedReason: string | null;
  isConnected: boolean;
  sendMessage: (content: string) => Promise<void>;
  sendMedia: (file: File, type: MediaType, encrypt?: boolean) => Promise<void>;
  recipientId: string | null;
  keysInitialized: boolean;
  keysError: string | null;
}

/**
 * Hook for a single conversation with real-time messaging
 * Handles WebSocket connection, message encryption/decryption
 * Now supports both legacy ECDH and Signal Protocol messages
 */
export const useConversation = (
  conversationId: string
): UseConversationReturn => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClosed, setIsClosed] = useState(false);
  const [closedReason, setClosedReason] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [recipientId, setRecipientId] = useState<string | null>(null);

  // E2EE keys (legacy)
  const { keyPair, isInitialized: keysReady, error: keysError } = useE2EEKeys();

  // Signal Protocol client
  const token = getAccessToken() || "";
  const { signalClient, isRegistered: signalReady, encryptMessage: signalEncrypt, decryptMessage: signalDecrypt } = useSignal(token);

  // Refs for shared key and recipient
  const sharedKeyRef = useRef<CryptoKey | null>(null);

  // Store keyPair in a ref to avoid re-renders when it changes
  const keyPairRef = useRef(keyPair);
  useEffect(() => {
    keyPairRef.current = keyPair;
  }, [keyPair]);

  // Get current user - memoize to prevent new object on each render
  const currentUser = useMemo(() => getUserFromToken(), []);
  const currentUserId = currentUser?.id;

  // Derive shared key for encryption/decryption
  // Use ref to avoid dependency on keyPair which would cause re-renders
  const deriveKey = useCallback(
    async (targetUserId: string): Promise<CryptoKey | null> => {
      const currentKeyPair = keyPairRef.current;
      if (!currentKeyPair) {
        console.warn("[E2EE] No keypair available");
        return null;
      }

      try {
        // Log our own public key fingerprint for debugging
        const ownPublicKeyBase64 = await exportPublicKey(currentKeyPair.publicKey);
        const ownFingerprint = await getKeyFingerprint(ownPublicKeyBase64);
        console.log(`[E2EE] === Key Exchange Debug ===`);
        console.log(`[E2EE] Current user ID: ${currentUserId}`);
        console.log(`[E2EE] Target user ID: ${targetUserId}`);
        console.log(`[E2EE] LOCAL public key fingerprint: ${ownFingerprint}`);

        // Verify our key is on the server (non-blocking, just for debug)
        try {
          const serverOwnKeyBase64 = await getPublicKey(currentUserId!);
          if (serverOwnKeyBase64) {
            const serverOwnFingerprint = await getKeyFingerprint(serverOwnKeyBase64);
            console.log(`[E2EE] SERVER has our public key fingerprint: ${serverOwnFingerprint}`);
            if (ownFingerprint !== serverOwnFingerprint) {
              console.warn(`[E2EE] ⚠️ KEY MISMATCH! Local key differs from server key!`);
              console.log(`[E2EE] Re-uploading our public key to server...`);
              await uploadPublicKey(ownPublicKeyBase64);
              console.log(`[E2EE] Public key re-uploaded successfully`);
            } else {
              console.log(`[E2EE] ✓ Local and server keys match`);
            }
          } else {
            console.log(`[E2EE] Server doesn't have our public key, uploading...`);
            await uploadPublicKey(ownPublicKeyBase64);
          }
        } catch (selfKeyErr) {
          // Non-critical - just log and continue
          console.warn(`[E2EE] Could not verify own key on server:`, selfKeyErr);
          // Try to upload our key anyway
          try {
            await uploadPublicKey(ownPublicKeyBase64);
            console.log(`[E2EE] Uploaded our public key to server`);
          } catch (uploadErr) {
            console.warn(`[E2EE] Failed to upload public key:`, uploadErr);
          }
        }

        // Fetch recipient's public key - this is critical
        const recipientPublicKeyBase64 = await getPublicKey(targetUserId);
        if (!recipientPublicKeyBase64) {
          console.warn(
            `[E2EE] No public key found for user ${targetUserId}`
          );
          return null;
        }

        const recipientFingerprint = await getKeyFingerprint(recipientPublicKeyBase64);
        console.log(`[E2EE] RECIPIENT (${targetUserId}) public key fingerprint: ${recipientFingerprint}`);

        // Critical debug info for comparing across users
        console.log(`[E2EE] VERIFY: User ${currentUserId?.slice(0, 8)}... has key ${ownFingerprint}`);
        console.log(`[E2EE] VERIFY: User ${targetUserId.slice(0, 8)}... has key ${recipientFingerprint}`);
        console.log(`[E2EE] === End Key Exchange Debug ===`);

        const recipientPublicKey = await importPublicKey(recipientPublicKeyBase64);
        const sharedKey = await deriveSharedKey(
          currentKeyPair.privateKey,
          recipientPublicKey
        );

        sharedKeyRef.current = sharedKey;
        console.log(`[E2EE] Derived shared key with user ${targetUserId}`);

        return sharedKey;
      } catch (err) {
        console.error("[E2EE] Failed to derive shared key:", err);
        return null;
      }
    },
    [currentUserId] // Add currentUserId as dependency
  );

  // Decrypt a message (supports both Signal Protocol and legacy ECDH)
  const decryptMessageContent = useCallback(
    async (
      msg: Message,
      sharedKey: CryptoKey | null,
      targetUserId: string
    ): Promise<DecryptedMessage> => {
      // 1. Try Signal Protocol decryption first (for newer messages)
      if (msg.signal_ciphertext && msg.signal_message_type && signalReady) {
        console.log(`[Signal] Decrypting message ${msg.id} with Signal Protocol`);
        try {
          const decryptedContent = await signalDecrypt(
            msg.sender_id,
            conversationId,
            msg.signal_ciphertext,
            msg.signal_message_type
          );
          return { ...msg, decryptedContent, decryptionFailed: false };
        } catch (err) {
          console.error("[Signal] Failed to decrypt message:", err);
          // Don't return failed yet - try legacy if available
        }
      }

      // 2. Try legacy ECDH decryption (for older messages)
      if (msg.encrypted_content && msg.nonce && sharedKey) {
        console.log(`[E2EE] Decrypting message ${msg.id} with legacy ECDH`);
        console.log(`[E2EE] Message is from: ${msg.sender_id === currentUserId ? 'me' : 'other user'}`);

        try {
          const decryptedContent = await decryptMessage(
            msg.encrypted_content,
            msg.nonce,
            sharedKey
          );
          return { ...msg, decryptedContent, decryptionFailed: false };
        } catch (err) {
          console.error("[E2EE] Failed to decrypt message:", err);
          console.error("[E2EE] Message details:", {
            id: msg.id,
            sender_id: msg.sender_id,
            isFromCurrentUser: msg.sender_id === currentUserId,
            encrypted_content_length: msg.encrypted_content?.length,
            nonce: msg.nonce,
          });
          return { ...msg, decryptionFailed: true };
        }
      }

      // 3. Check if it's an encrypted message we couldn't decrypt
      if ((msg.signal_ciphertext || msg.encrypted_content) && !msg.content) {
        return { ...msg, decryptionFailed: true };
      }

      // 4. Plain text message (legacy) or media-only message
      return {
        ...msg,
        decryptedContent: msg.content,
        decryptionFailed: false,
      };
    },
    [currentUserId, conversationId, signalReady, signalDecrypt]
  );

  // Fetch conversation and messages
  useEffect(() => {
    if (!conversationId || !keysReady || !currentUserId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get conversation from cache first
        const { getCachedConversation } = await import("@/app/lib/conversationsCache");
        let conv = getCachedConversation(conversationId);

        // If not in cache, fetch all conversations (which will populate cache)
        if (!conv) {
          const conversations = await listConversations();
          conv = conversations.find((c) => c.id === conversationId) || null;

          // If still not found, try to find by order_id (URL might contain order ID instead of conversation ID)
          if (!conv) {
            conv = conversations.find((c) => c.order_id === conversationId) || null;
          }
        }

        if (!conv) {
          setError("Conversation not found");
          return;
        }

        setConversation(conv);
        setIsClosed(conv.status === "closed");

        // Determine recipient (the other user in conversation)
        const targetUserId =
          conv.user_one_id === currentUserId
            ? conv.user_two_id
            : conv.user_one_id;
        setRecipientId(targetUserId);

        // Derive shared key with recipient
        const sharedKey = await deriveKey(targetUserId);

        // Fetch messages
        const rawMessages = await getConversationMessages(conversationId);

        // Decrypt messages
        if (sharedKey) {
          const decrypted = await Promise.all(
            rawMessages.map((msg) => decryptMessageContent(msg, sharedKey, targetUserId))
          );
          setMessages(decrypted);
        } else {
          // No shared key - show messages as-is (will show decryption failed for encrypted ones)
          setMessages(
            rawMessages.map((msg) => ({
              ...msg,
              decryptedContent: msg.content,
              decryptionFailed: !!msg.encrypted_content,
            }))
          );
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load conversation";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Only re-run when conversationId or keysReady changes
    // deriveKey and decryptMessageContent are stable (use refs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, keysReady, currentUserId]);

  // Connect to WebSocket room
  useEffect(() => {
    // Wait for conversation to be resolved before joining the room
    if (!conversation || !keysReady || loading) return;

    // Use the resolved conversation ID, not the URL parameter
    const roomId = conversation.id;

    let unsubMessage: (() => void) | null = null;
    let unsubClosed: (() => void) | null = null;
    let unsubConnection: (() => void) | null = null;
    let unsubDisconnection: (() => void) | null = null;

    const connect = async () => {
      try {
        connectSocket();
        await joinRoom(roomId);
        setIsConnected(true);

        // Subscribe to connection status
        unsubConnection = onConnection(() => setIsConnected(true));
        unsubDisconnection = onDisconnection(() => setIsConnected(false));

        // Subscribe to new messages
        unsubMessage = onMessage(roomId, async (msg: Message) => {
          console.log("[WebSocket] New message received:", msg.id);

          const targetUser = recipientId || "";
          const decrypted = await decryptMessageContent(
            msg,
            sharedKeyRef.current,
            targetUser
          );
          setMessages((prev) => [...prev, decrypted]);
        });

        // Subscribe to room closure
        unsubClosed = onRoomClosed(
          roomId,
          (data: RoomClosedPayload) => {
            console.log("[WebSocket] Room closed:", data.reason);
            setIsClosed(true);
            setClosedReason(data.reason);
          }
        );
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to connect to chat";
        console.error("[WebSocket] Connection error:", errorMessage);
        setError(errorMessage);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      unsubMessage?.();
      unsubClosed?.();
      unsubConnection?.();
      unsubDisconnection?.();
      leaveRoom(roomId);
      setIsConnected(false);
    };
    // decryptMessageContent is stable (no dependencies)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation, keysReady, loading]);

  // Send encrypted message (using Signal Protocol)
  const sendMessageHandler = useCallback(
    async (content: string) => {
      if (!signalReady) {
        throw new Error("Signal Protocol not initialized. Please refresh the page.");
      }

      if (!conversation) {
        throw new Error("Conversation not loaded");
      }

      if (!recipientId) {
        throw new Error("Recipient not identified");
      }

      if (isClosed) {
        throw new Error("Conversation is closed");
      }

      // Get the actual conversation ID
      const actualConversationId = conversation.id;

      try {
        // Use Signal Protocol for encryption via the hook
        const encrypted = await signalEncrypt(
          recipientId,
          actualConversationId,
          content
        );

        await socketSendMessage(actualConversationId, {
          signal_ciphertext: encrypted.ciphertext,
          signal_message_type: encrypted.messageType as 1 | 2,
          encrypted_content: "", // Legacy fields empty
          nonce: "",
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);

        // Check if the error is about recipient not being registered
        if (errorMessage.includes("not registered") || errorMessage.includes("User not registered")) {
          throw new Error("The other user hasn't opened this chat yet. Please wait for them to come online, or ask them to open the conversation.");
        }

        throw err;
      }
    },
    [conversation, recipientId, isClosed, signalReady, signalEncrypt]
  );

  // Send media message
  const sendMediaHandler = useCallback(
    async (file: File, type: MediaType, encrypt: boolean = true) => {
      if (!conversation) {
        throw new Error("Conversation not loaded");
      }

      if (isClosed) {
        throw new Error("Conversation is closed");
      }

      const actualConversationId = conversation.id;

      if (encrypt && sharedKeyRef.current) {
        // Encrypt file before upload
        const { encrypted, nonce } = await encryptFile(
          file,
          sharedKeyRef.current
        );

        const response = await uploadEncryptedMedia(
          actualConversationId,
          encrypted,
          type
        );

        // Send media message via WebSocket
        await socketSendMediaMessage(actualConversationId, {
          media_key: response.media_key,
          media_type: type,
          media_size: response.media_size,
          media_filename: file.name,
          media_mime_type: file.type,
        });
      } else {
        // Upload without encryption
        const response = await uploadMessageMedia(actualConversationId, file, type);

        await socketSendMediaMessage(actualConversationId, {
          media_key: response.media_key,
          media_type: type,
          media_size: response.media_size,
          media_filename: response.media_filename,
          media_mime_type: response.media_mime_type,
        });
      }
    },
    [conversation, isClosed]
  );

  return {
    conversation,
    messages,
    loading,
    error,
    isClosed,
    closedReason,
    isConnected,
    sendMessage: sendMessageHandler,
    sendMedia: sendMediaHandler,
    recipientId,
    keysInitialized: keysReady,
    keysError,
  };
};

// ===== useConnectionStatus Hook =====

export enum ConnectionState {
  CONNECTED = "connected",
  CONNECTING = "connecting",
  DISCONNECTED = "disconnected",
  ERROR = "error",
}

interface UseConnectionStatusReturn {
  status: ConnectionState;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
}

/**
 * Hook for managing WebSocket connection state with more detail
 */
export const useConnectionStatus = (): UseConnectionStatusReturn => {
  const [status, setStatus] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial state check
    if (checkIsConnected()) {
      setStatus(ConnectionState.CONNECTED);
    } else {
      // Attempt to connect if not connected
      setStatus(ConnectionState.CONNECTING);
      try {
        connectSocket();
      } catch (e) {
        setStatus(ConnectionState.ERROR);
      }
    }

    // Subscribe to connection changes
    const unsubConnect = onConnection(() => {
      setStatus(ConnectionState.CONNECTED);
      setError(null);
    });

    const unsubDisconnect = onDisconnection(() => {
      setStatus(ConnectionState.DISCONNECTED);
    });

    // We can also subscribe to errors if we export that from socket.ts
    // For now, we'll rely on global handlers or assume disconnection on error

    return () => {
      unsubConnect();
      unsubDisconnect();
    };
  }, []);

  const connect = useCallback(() => {
    setStatus(ConnectionState.CONNECTING);
    setError(null);
    try {
      connectSocket();
    } catch (err: unknown) {
      setStatus(ConnectionState.ERROR);
      setError(err instanceof Error ? err.message : "Failed to connect");
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setStatus(ConnectionState.DISCONNECTED);
  }, []);

  return { status, error, connect, disconnect };
};
