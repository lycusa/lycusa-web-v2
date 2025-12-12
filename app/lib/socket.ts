/**
 * Phoenix WebSocket Manager
 * Handles real-time messaging connections using Phoenix Channels
 */

import { Socket, Channel } from "phoenix";
import { getAccessToken } from "./auth";
import type {
  Message,
  SendMessagePayload,
  SendMediaPayload,
  RoomClosedPayload,
} from "./types/messaging";

// WebSocket URL - direct connection to messaging service
// Phoenix Socket automatically appends /websocket to the path
const MESSAGING_WS_URL =
  process.env.NEXT_PUBLIC_MESSAGING_WS_URL || "ws://localhost:4001/socket";

// ===== Types =====

type MessageHandler = (message: Message) => void;
type RoomClosedHandler = (data: RoomClosedPayload) => void;
type ConnectionHandler = () => void;
type ErrorHandler = (error: unknown) => void;

interface SocketState {
  socket: Socket | null;
  activeChannels: Map<string, Channel>;
  messageHandlers: Map<string, Set<MessageHandler>>;
  roomClosedHandlers: Map<string, Set<RoomClosedHandler>>;
  connectionHandlers: Set<ConnectionHandler>;
  disconnectionHandlers: Set<ConnectionHandler>;
  errorHandlers: Set<ErrorHandler>;
}

// ===== Singleton State =====

const state: SocketState = {
  socket: null,
  activeChannels: new Map(),
  messageHandlers: new Map(),
  roomClosedHandlers: new Map(),
  connectionHandlers: new Set(),
  disconnectionHandlers: new Set(),
  errorHandlers: new Set(),
};

// ===== Connection Management =====

/**
 * Connect to the messaging WebSocket
 */
export const connectSocket = (): Socket => {
  if (state.socket?.isConnected()) {
    return state.socket;
  }

  const token = getAccessToken();
  if (!token) {
    throw new Error("No authentication token available");
  }

  // Close existing socket if any
  if (state.socket) {
    state.socket.disconnect();
  }

  state.socket = new Socket(MESSAGING_WS_URL, {
    params: { token },
    reconnectAfterMs: (tries: number) => {
      // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
      return Math.min(1000 * Math.pow(2, tries), 30000);
    },
    heartbeatIntervalMs: 30000,
  });

  state.socket.onOpen(() => {
    console.log(`[WebSocket] connected to ${MESSAGING_WS_URL}`);
    state.connectionHandlers.forEach((handler) => handler());
  });

  state.socket.onError((error) => {
    console.error("[WebSocket] Connection error:", error);
    state.errorHandlers.forEach((handler) => handler(error));
  });

  state.socket.onClose(() => {
    console.log("[WebSocket] Connection closed");
    state.disconnectionHandlers.forEach((handler) => handler());
  });

  state.socket.connect();

  return state.socket;
};

/**
 * Disconnect from the WebSocket and cleanup
 */
export const disconnectSocket = (): void => {
  // Leave all active channels
  state.activeChannels.forEach((channel, conversationId) => {
    channel.leave();
    console.log(`[WebSocket] Left room:${conversationId}`);
  });

  // Clear all state
  state.activeChannels.clear();
  state.messageHandlers.clear();
  state.roomClosedHandlers.clear();

  // Disconnect socket
  state.socket?.disconnect();
  state.socket = null;
};

/**
 * Check if socket is connected
 */
export const isConnected = (): boolean => {
  return state.socket?.isConnected() ?? false;
};

// ===== Room Management =====

/**
 * Wait for socket to be connected
 */
const waitForConnection = (socket: Socket, timeoutMs = 5000): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (socket.isConnected()) {
      resolve();
      return;
    }

    let resolved = false;

    const onOpenRef = socket.onOpen(() => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    });

    // Don't rely solely on onError/onClose as they can fire during retry
    // Just allow a timeout to reject if connection takes too long
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        // Clean up checking logic if possible, but Phoenix API doesn't make it easy to remove single listeners by ref without clearing all
        reject(new Error("Socket connection timeout"));
      }
    }, timeoutMs);
  });
};

/**
 * Join a conversation room
 */
export const joinRoom = (conversationId: string): Promise<Channel> => {
  return new Promise(async (resolve, reject) => {
    // Ensure socket is initialized
    if (!state.socket) {
      try {
        connectSocket();
      } catch (error) {
        reject(error);
        return;
      }
    }

    if (!state.socket) {
      reject(new Error("Failed to initialize socket"));
      return;
    }

    // Check if already joined
    const existing = state.activeChannels.get(conversationId);
    if (existing) {
      resolve(existing);
      return;
    }

    try {
      // Wait for connection before attempting to join
      await waitForConnection(state.socket);
    } catch (err) {
      console.warn("[WebSocket] Failed to wait for connection, attempting join anyway:", err);
      // We proceed anyway because Phoenix client queues joins, but this warning helps debug
    }

    const token = getAccessToken();
    const channel = state.socket.channel(`room:${conversationId}`, { token });

    channel
      .join()
      .receive("ok", () => {
        console.log(`[WebSocket] Joined room:${conversationId}`);
        state.activeChannels.set(conversationId, channel);
        setupChannelHandlers(conversationId, channel);
        resolve(channel);
      })
      .receive("error", (err) => {
        console.error(`[WebSocket] Failed to join room:${conversationId}`, err);
        reject(new Error(err?.reason || "Failed to join room"));
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
  const channel = state.activeChannels.get(conversationId);
  if (channel) {
    channel.leave();
    state.activeChannels.delete(conversationId);
    state.messageHandlers.delete(conversationId);
    state.roomClosedHandlers.delete(conversationId);
    console.log(`[WebSocket] Left room:${conversationId}`);
  }
};

/**
 * Check if currently in a room
 */
export const isInRoom = (conversationId: string): boolean => {
  return state.activeChannels.has(conversationId);
};

/**
 * Setup event handlers for a channel
 */
const setupChannelHandlers = (
  conversationId: string,
  channel: Channel
): void => {
  // Handle incoming messages
  channel.on("new_message", (payload: Message) => {
    console.log(`[WebSocket] Received message in room:${conversationId}`, payload);
    const handlers = state.messageHandlers.get(conversationId);
    handlers?.forEach((handler) => handler(payload));
  });

  // Handle room closure (order completed/cancelled)
  channel.on("room_closed", (payload: RoomClosedPayload) => {
    console.log(`[WebSocket] Room closed:${conversationId}`, payload);
    const handlers = state.roomClosedHandlers.get(conversationId);
    handlers?.forEach((handler) => handler(payload));
  });
};

// ===== Message Sending =====

/**
 * Send an encrypted text message
 */
export const sendMessage = (
  conversationId: string,
  payload: SendMessagePayload
): Promise<Message> => {
  return new Promise((resolve, reject) => {
    const channel = state.activeChannels.get(conversationId);
    if (!channel) {
      reject(new Error("Not connected to room"));
      return;
    }

    channel
      .push("new_message", payload)
      .receive("ok", (response: Message) => {
        console.log(`[WebSocket] Message sent in room:${conversationId}`);
        resolve(response);
      })
      .receive("error", (err) => {
        console.error(`[WebSocket] Failed to send message:`, err);
        reject(new Error(err?.reason || "Failed to send message"));
      })
      .receive("timeout", () => {
        console.error(`[WebSocket] Message send timeout`);
        reject(new Error("Message send timeout"));
      });
  });
};

/**
 * Send a media message (after uploading the file)
 */
export const sendMediaMessage = (
  conversationId: string,
  payload: SendMediaPayload
): Promise<Message> => {
  return new Promise((resolve, reject) => {
    const channel = state.activeChannels.get(conversationId);
    if (!channel) {
      reject(new Error("Not connected to room"));
      return;
    }

    channel
      .push("new_message", payload)
      .receive("ok", (response: Message) => {
        console.log(`[WebSocket] Media message sent in room:${conversationId}`);
        resolve(response);
      })
      .receive("error", (err) => {
        console.error(`[WebSocket] Failed to send media message:`, err);
        reject(new Error(err?.reason || "Failed to send media message"));
      })
      .receive("timeout", () => {
        console.error(`[WebSocket] Media message send timeout`);
        reject(new Error("Media message send timeout"));
      });
  });
};

// ===== Event Subscriptions =====

/**
 * Subscribe to new messages in a room
 * Returns unsubscribe function
 */
export const onMessage = (
  conversationId: string,
  handler: MessageHandler
): (() => void) => {
  if (!state.messageHandlers.has(conversationId)) {
    state.messageHandlers.set(conversationId, new Set());
  }
  state.messageHandlers.get(conversationId)!.add(handler);

  // Return unsubscribe function
  return () => {
    state.messageHandlers.get(conversationId)?.delete(handler);
  };
};

/**
 * Subscribe to room closed events
 * Returns unsubscribe function
 */
export const onRoomClosed = (
  conversationId: string,
  handler: RoomClosedHandler
): (() => void) => {
  if (!state.roomClosedHandlers.has(conversationId)) {
    state.roomClosedHandlers.set(conversationId, new Set());
  }
  state.roomClosedHandlers.get(conversationId)!.add(handler);

  // Return unsubscribe function
  return () => {
    state.roomClosedHandlers.get(conversationId)?.delete(handler);
  };
};

/**
 * Subscribe to connection events
 * Returns unsubscribe function
 */
export const onConnection = (handler: ConnectionHandler): (() => void) => {
  state.connectionHandlers.add(handler);
  return () => {
    state.connectionHandlers.delete(handler);
  };
};

/**
 * Subscribe to disconnection events
 * Returns unsubscribe function
 */
export const onDisconnection = (handler: ConnectionHandler): (() => void) => {
  state.disconnectionHandlers.add(handler);
  return () => {
    state.disconnectionHandlers.delete(handler);
  };
};

/**
 * Subscribe to error events
 * Returns unsubscribe function
 */
export const onError = (handler: ErrorHandler): (() => void) => {
  state.errorHandlers.add(handler);
  return () => {
    state.errorHandlers.delete(handler);
  };
};

// ===== Utilities =====

/**
 * Get the current socket instance (for advanced use)
 */
export const getSocket = (): Socket | null => {
  return state.socket;
};

/**
 * Get all active channels
 */
export const getActiveChannels = (): Map<string, Channel> => {
  return new Map(state.activeChannels);
};
