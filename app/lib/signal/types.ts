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
  usedSignedPreKeyId: number;
  usedOneTimePreKeyId?: number;
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
