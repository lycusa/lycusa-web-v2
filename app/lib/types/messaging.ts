/**
 * Messaging Service Types
 * E2E Encrypted Chat for buyer-seller communication
 */

// ===== Conversation Types =====

export enum ConversationStatus {
  OPEN = "open",
  CLOSED = "closed",
}

export interface Conversation {
  id: string;
  order_id: string;
  user_one_id: string; // buyer
  user_two_id: string; // seller
  status: ConversationStatus;
  last_message_at: string | null;
  inserted_at: string;
  updated_at: string;
}

// ===== Message Types =====

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
  FILE = "file",
}

export interface Message {
  id: string;
  conversation_id?: string; // Optional - may not be included in WebSocket broadcasts
  sender_id: string;
  // Text message (one of these)
  content?: string; // Plain text (legacy)
  encrypted_content?: string; // E2EE encrypted (base64)
  nonce?: string; // Encryption nonce (base64)
  // Signal Protocol Fields
  signal_ciphertext?: string;
  signal_message_type?: 1 | 2; // 1 = PreKeyMessage, 2 = SignalMessage
  // Media message
  media_key?: string;
  media_type?: MediaType;
  media_size?: number;
  media_filename?: string;
  media_mime_type?: string;
  media_url?: string; // Presigned URL
  // Encrypted media metadata
  encrypted_media_metadata?: string;
  media_metadata_nonce?: string;
  // Timestamps
  inserted_at: string;
}

// Decrypted message for UI display
export interface DecryptedMessage extends Omit<Message, "nonce"> {
  decryptedContent?: string;
  decryptionFailed?: boolean;
}

// ===== Public Key Types =====

export interface UserPublicKey {
  user_id: string;
  public_key: string; // base64 encoded
  inserted_at: string;
  updated_at: string;
}

// ===== Request/Response Types =====

export interface SendMessagePayload {
  encrypted_content?: string;
  nonce?: string;
  signal_ciphertext?: string;
  signal_message_type?: 1 | 2;
}

export interface SendMediaPayload {
  media_key: string;
  media_type: MediaType;
  media_size: number;
  media_filename: string;
  media_mime_type: string;
  // Signal Protocol fields - required for all messages
  signal_ciphertext: string;
  signal_message_type: 1 | 2;
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

export interface PublicKeyResponse {
  user_id: string;
  public_key: string;
}

export interface BatchPublicKeysResponse {
  public_keys: Record<string, string>;
}

// ===== WebSocket Event Types =====

export interface RoomClosedPayload {
  reason: string;
  conversation_id: string;
}

export interface NewMessagePayload extends Message { }

// ===== UI Configuration =====

export const CONVERSATION_STATUS_CONFIG: Record<
  ConversationStatus,
  {
    label: string;
    color: string;
    bgColor: string;
  }
> = {
  [ConversationStatus.OPEN]: {
    label: "Active",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  [ConversationStatus.CLOSED]: {
    label: "Closed",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
};

export const MEDIA_TYPE_CONFIG: Record<
  MediaType,
  {
    label: string;
    icon: string;
    acceptTypes: string;
  }
> = {
  [MediaType.IMAGE]: {
    label: "Image",
    icon: "image",
    acceptTypes: "image/jpeg,image/png,image/gif,image/webp",
  },
  [MediaType.VIDEO]: {
    label: "Video",
    icon: "video",
    acceptTypes: "video/mp4,video/webm,video/quicktime",
  },
  [MediaType.FILE]: {
    label: "File",
    icon: "file",
    acceptTypes: "*/*",
  },
};
