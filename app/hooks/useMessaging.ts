"use client";

/**
 * Messaging Hooks
 * React hooks for E2E encrypted messaging functionality
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
  const { keyPair, isInitialized: keysReady, error: keysError } = useE2EEKeys();

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
        const recipientPublicKeyBase64 = await getPublicKey(targetUserId);
        if (!recipientPublicKeyBase64) {
          console.warn(
            `[E2EE] No public key found for user ${targetUserId}`
          );
          return null;
        }

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
    [] // No dependencies - uses refs
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
    // Only re-run when conversationId or keysReady changes
    // deriveKey and decryptMessageContent are stable (use refs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, keysReady, currentUserId]);

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
    // decryptMessageContent is stable (no dependencies)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, keysReady, loading]);

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
