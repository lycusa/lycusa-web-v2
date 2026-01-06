// ZKPassport Service Types

/**
 * Response from creating a ZKPassport verification session
 */
export interface ZkpassportSession {
  sessionId: string;
  verificationUrl: string;
  expiresAt: string;
}

/**
 * Possible states for a ZKPassport verification session
 */
export type ZkpassportSessionStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "expired"
  | "error";

/**
 * Response from polling ZKPassport verification status
 */
export interface ZkpassportStatus {
  sessionId: string;
  status: ZkpassportSessionStatus;
  userUuid?: string;
  verifiedAt?: string;
  providerId?: string;
}

/**
 * Request to create a ZKPassport verification session
 */
export interface CreateZkpassportSessionRequest {
  userUuid: string;
}

/**
 * API response wrapper for ZKPassport session creation
 */
export interface CreateZkpassportSessionResponse {
  sessionId: string;
  verificationUrl: string;
  expiresAt: string;
}

/**
 * API response wrapper for ZKPassport status polling
 */
export interface GetZkpassportStatusResponse {
  sessionId: string;
  status: ZkpassportSessionStatus;
  userUuid?: string;
  verifiedAt?: string;
  providerId?: string;
}
