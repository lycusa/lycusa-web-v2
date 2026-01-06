"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  createZkpassportSession,
  getZkpassportStatus,
} from "@/app/lib/api";
import type {
  ZkpassportSession,
  ZkpassportStatus,
  ZkpassportSessionStatus,
} from "@/app/lib/types/zkpassport";

interface UseZkpassportVerificationOptions {
  userUuid: string;
  pollInterval?: number;
  onSuccess?: (status: ZkpassportStatus) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: ZkpassportSessionStatus) => void;
}

interface UseZkpassportVerificationResult {
  session: ZkpassportSession | null;
  status: ZkpassportStatus | null;
  isLoading: boolean;
  isPolling: boolean;
  error: Error | null;
  startVerification: () => Promise<void>;
  cancelVerification: () => void;
  resetVerification: () => void;
}

/**
 * Custom hook for managing ZKPassport verification flow
 *
 * Handles:
 * - Session creation
 * - Status polling
 * - Success/error callbacks
 * - Cleanup on unmount
 */
export function useZkpassportVerification({
  userUuid,
  pollInterval = 2000,
  onSuccess,
  onError,
  onStatusChange,
}: UseZkpassportVerificationOptions): UseZkpassportVerificationResult {
  const [session, setSession] = useState<ZkpassportSession | null>(null);
  const [status, setStatus] = useState<ZkpassportStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Cleanup polling on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, []);

  const pollStatus = useCallback(
    async (sessionId: string) => {
      if (!mountedRef.current) return;

      try {
        const currentStatus = await getZkpassportStatus(sessionId);

        if (!mountedRef.current) return;

        setStatus(currentStatus);
        onStatusChange?.(currentStatus.status);

        // Check for terminal states
        if (currentStatus.status === "verified") {
          // Stop polling on success
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          setIsPolling(false);
          onSuccess?.(currentStatus);
        } else if (
          currentStatus.status === "rejected" ||
          currentStatus.status === "expired" ||
          currentStatus.status === "error"
        ) {
          // Stop polling on final states
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          setIsPolling(false);
          onError?.(
            new Error(`Verification ${currentStatus.status}`)
          );
        }
      } catch (err) {
        console.error("Error polling ZKPassport status:", err);
        // Continue polling on transient errors
      }
    },
    [onSuccess, onError, onStatusChange]
  );

  const startVerification = useCallback(async () => {
    if (!userUuid) {
      setError(new Error("User ID is required"));
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatus(null);

    try {
      const newSession = await createZkpassportSession(userUuid);

      if (!mountedRef.current) return;

      setSession({
        sessionId: newSession.sessionId,
        verificationUrl: newSession.verificationUrl,
        expiresAt: newSession.expiresAt,
      });
      setStatus({
        sessionId: newSession.sessionId,
        status: "pending",
      });

      // Start polling
      setIsPolling(true);
      pollingRef.current = setInterval(() => {
        pollStatus(newSession.sessionId);
      }, pollInterval);

      // Initial poll
      await pollStatus(newSession.sessionId);
    } catch (err) {
      if (!mountedRef.current) return;

      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      onError?.(error);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [userUuid, pollInterval, pollStatus, onError]);

  const cancelVerification = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const resetVerification = useCallback(() => {
    cancelVerification();
    setSession(null);
    setStatus(null);
    setError(null);
    setIsLoading(false);
  }, [cancelVerification]);

  return {
    session,
    status,
    isLoading,
    isPolling,
    error,
    startVerification,
    cancelVerification,
    resetVerification,
  };
}
