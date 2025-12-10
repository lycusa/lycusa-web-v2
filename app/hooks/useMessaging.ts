"use client";

/**
 * Messaging Hooks
 * React hooks for E2E encrypted messaging functionality
 */

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
  clearStoredKeys,
  E2EEKeyPair,
} from "@/app/lib/crypto";
import type {
  Conversation,
  Message,
  DecryptedMessage,
  MediaType,
  RoomClosedPayload,
} from "@/app/lib/types/messaging";
import { getUserFromToken } from "@/app/lib/auth";

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
export const useE2EEKeys = (): UseE2EEKeysReturn => {
  const [keyPair, setKeyPair] = useState<E2EEKeyPair | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize or load keys on mount
  useEffect(() => {
    const initKeys = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to load existing keys from IndexedDB
        let keys = await loadKeyPair();

        if (!keys) {
          console.log("[E2EE] No stored keys found, generating new keypair");
          // Generate new keys
          keys = await generateKeyPair();
          await storeKeyPair(keys);

          // Upload public key to server
          const publicKeyBase64 = await exportPublicKey(keys.publicKey);
          await uploadPublicKey(publicKeyBase64);
          console.log("[E2EE] New keypair generated and uploaded");
        } else {
          console.log("[E2EE] Loaded existing keypair from storage");
        }

        setKeyPair(keys);
        setIsInitialized(true);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initialize E2EE keys";
        console.error("[E2EE] Initialization failed:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    // Only run in browser
    if (typeof window !== "undefined") {
      initKeys();
    }
  }, []);

  // Regenerate keys (e.g., for security reset)
  const regenerateKeys = useCallback(async (): Promise<E2EEKeyPair> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("[E2EE] Regenerating keypair");
      const keys = await generateKeyPair();
      await storeKeyPair(keys);

      const publicKeyBase64 = await exportPublicKey(keys.publicKey);
      await uploadPublicKey(publicKeyBase64);

      setKeyPair(keys);
      console.log("[E2EE] New keypair regenerated and uploaded");
      return keys;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to regenerate keys";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear keys (for logout)
  const clearKeys = useCallback(async (): Promise<void> => {
    await clearStoredKeys();
    setKeyPair(null);
    setIsInitialized(false);
    console.log("[E2EE] Keys cleared");
  }, []);

  return {
    keyPair,
    isInitialized,
    isLoading,
    error,
    regenerateKeys,
    clearKeys,
  };
};

// ===== useConversations Hook =====

interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for listing user's conversations
 */
export const useConversations = (): UseConversationsReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listConversations();
      // Sort by last_message_at (most recent first)
      const sorted = data.sort((a, b) => {
        const aTime = a.last_message_at
          ? new Date(a.last_message_at).getTime()
          : 0;
        const bTime = b.last_message_at
          ? new Date(b.last_message_at).getTime()
          : 0;
        return bTime - aTime;
      });
      setConversations(sorted);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load conversations";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, loading, error, refetch: fetchConversations };
};

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
}

/**
 * Hook for a single conversation with real-time messaging
 * Handles WebSocket connection, message encryption/decryption
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

  // E2EE keys
  const { keyPair, isInitialized: keysReady } = useE2EEKeys();

  // Refs for shared key and recipient
  const sharedKeyRef = useRef<CryptoKey | null>(null);

  // Get current user
  const currentUser = getUserFromToken();

  // Derive shared key for encryption/decryption
  const deriveKey = useCallback(
    async (targetUserId: string): Promise<CryptoKey | null> => {
      if (!keyPair) {
        console.warn("[E2EE] No keypair available");
        return null;
      }

      try {
        const recipientPublicKeyBase64 = await getPublicKey(targetUserId);
        if (!recipientPublicKeyBase64) {
          console.warn(
            `[E2EE] No public key found for user ${targetUserId}`
          );
          return null;
        }

        const recipientPublicKey = await importPublicKey(recipientPublicKeyBase64);
        const sharedKey = await deriveSharedKey(
          keyPair.privateKey,
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
    [keyPair]
  );

  // Decrypt a message
  const decryptMessageContent = useCallback(
    async (
      msg: Message,
      sharedKey: CryptoKey
    ): Promise<DecryptedMessage> => {
      // Check if message has encrypted content
      if (msg.encrypted_content && msg.nonce) {
        try {
          const decryptedContent = await decryptMessage(
            msg.encrypted_content,
            msg.nonce,
            sharedKey
          );
          return { ...msg, decryptedContent, decryptionFailed: false };
        } catch (err) {
          console.error("[E2EE] Failed to decrypt message:", err);
          return { ...msg, decryptionFailed: true };
        }
      }

      // Plain text message (legacy) or media-only message
      return {
        ...msg,
        decryptedContent: msg.content,
        decryptionFailed: false,
      };
    },
    []
  );

  // Fetch conversation and messages
  useEffect(() => {
    if (!conversationId || !keysReady || !currentUser) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all conversations to find this one
        const conversations = await listConversations();
        const conv = conversations.find((c) => c.id === conversationId);

        if (!conv) {
          setError("Conversation not found");
          return;
        }

        setConversation(conv);
        setIsClosed(conv.status === "closed");

        // Determine recipient (the other user in conversation)
        const targetUserId =
          conv.user_one_id === currentUser.id
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
            rawMessages.map((msg) => decryptMessageContent(msg, sharedKey))
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
  }, [
    conversationId,
    keysReady,
    currentUser,
    deriveKey,
    decryptMessageContent,
  ]);

  // Connect to WebSocket room
  useEffect(() => {
    if (!conversationId || !keysReady || loading) return;

    let unsubMessage: (() => void) | null = null;
    let unsubClosed: (() => void) | null = null;
    let unsubConnection: (() => void) | null = null;
    let unsubDisconnection: (() => void) | null = null;

    const connect = async () => {
      try {
        connectSocket();
        await joinRoom(conversationId);
        setIsConnected(true);

        // Subscribe to connection status
        unsubConnection = onConnection(() => setIsConnected(true));
        unsubDisconnection = onDisconnection(() => setIsConnected(false));

        // Subscribe to new messages
        unsubMessage = onMessage(conversationId, async (msg: Message) => {
          console.log("[WebSocket] New message received:", msg.id);

          if (sharedKeyRef.current) {
            const decrypted = await decryptMessageContent(
              msg,
              sharedKeyRef.current
            );
            setMessages((prev) => [...prev, decrypted]);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                ...msg,
                decryptedContent: msg.content,
                decryptionFailed: !!msg.encrypted_content,
              },
            ]);
          }
        });

        // Subscribe to room closure
        unsubClosed = onRoomClosed(
          conversationId,
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
      leaveRoom(conversationId);
      setIsConnected(false);
    };
  }, [conversationId, keysReady, loading, decryptMessageContent]);

  // Send encrypted message
  const sendMessageHandler = useCallback(
    async (content: string) => {
      if (!sharedKeyRef.current) {
        throw new Error("Encryption not initialized");
      }

      if (isClosed) {
        throw new Error("Conversation is closed");
      }

      const { encrypted, nonce } = await encryptMessage(
        content,
        sharedKeyRef.current
      );

      await socketSendMessage(conversationId, {
        encrypted_content: encrypted,
        nonce: nonce,
      });
    },
    [conversationId, isClosed]
  );

  // Send media message
  const sendMediaHandler = useCallback(
    async (file: File, type: MediaType, encrypt: boolean = true) => {
      if (isClosed) {
        throw new Error("Conversation is closed");
      }

      if (encrypt && sharedKeyRef.current) {
        // Encrypt file before upload
        const { encrypted, nonce } = await encryptFile(
          file,
          sharedKeyRef.current
        );

        const response = await uploadEncryptedMedia(
          conversationId,
          encrypted,
          type
        );

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
        const response = await uploadMessageMedia(conversationId, file, type);

        await socketSendMediaMessage(conversationId, {
          media_key: response.media_key,
          media_type: type,
          media_size: response.media_size,
          media_filename: response.media_filename,
          media_mime_type: response.media_mime_type,
        });
      }
    },
    [conversationId, isClosed]
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
  };
};

// ===== useSocketConnection Hook =====

interface UseSocketConnectionReturn {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

/**
 * Hook for managing WebSocket connection state
 */
export const useSocketConnection = (): UseSocketConnectionReturn => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initial state
    setIsConnected(checkIsConnected());

    // Subscribe to connection changes
    const unsubConnect = onConnection(() => setIsConnected(true));
    const unsubDisconnect = onDisconnection(() => setIsConnected(false));

    return () => {
      unsubConnect();
      unsubDisconnect();
    };
  }, []);

  const connect = useCallback(() => {
    connectSocket();
  }, []);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setIsConnected(false);
  }, []);

  return { isConnected, connect, disconnect };
};
