"use client";

/**
 * SignalAutoRegister Component
 *
 * This component automatically registers the current user with Signal Protocol
 * as soon as they authenticate. This ensures both parties in a conversation
 * have their Signal keys registered before attempting to send messages.
 *
 * Place this component in the main layout or auth wrapper to ensure
 * registration happens as early as possible.
 */

import { useEffect, useRef, useState } from "react";
import { getAccessToken } from "@/app/lib/auth";
import { useAuth } from "@/app/components/auth/AuthGuard";

const MAX_RETRIES = 5;
const INITIAL_BACKOFF_MS = 5000; // 5 seconds

export function SignalAutoRegister() {
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const isProcessingRef = useRef(false);
    const retryCountRef = useRef(0);
    const [status, setStatus] = useState<'idle' | 'checking' | 'registering' | 'done' | 'error' | 'rate_limited'>('idle');

    useEffect(() => {
        // Don't attempt registration if not authenticated or still loading auth
        if (authLoading || !isAuthenticated || !user) {
            console.log("[SignalAutoRegister] Waiting for authentication...", { authLoading, isAuthenticated, hasUser: !!user });
            return;
        }

        let timeoutId: NodeJS.Timeout | null = null;

        const scheduleRetry = () => {
            if (retryCountRef.current >= MAX_RETRIES) {
                console.log("[SignalAutoRegister] Max retries reached, stopping");
                setStatus('error');
                return;
            }

            // Exponential backoff: 5s, 10s, 20s, 40s, 60s (capped)
            const backoffMs = Math.min(
                INITIAL_BACKOFF_MS * Math.pow(2, retryCountRef.current),
                60000 // Cap at 60 seconds
            );
            console.log(`[SignalAutoRegister] Scheduling retry in ${backoffMs / 1000}s (attempt ${retryCountRef.current + 1}/${MAX_RETRIES})`);

            timeoutId = setTimeout(() => {
                checkAndRegister();
            }, backoffMs);
        };

        const checkAndRegister = async () => {
            // Prevent concurrent execution
            if (isProcessingRef.current) {
                console.log("[SignalAutoRegister] Already processing, skipping");
                return;
            }

            // Don't retry if we've already successfully registered
            if (retryCountRef.current === -1) {
                console.log("[SignalAutoRegister] Already successfully registered, skipping");
                return;
            }

            // Verify user is still authenticated (double check)
            if (!isAuthenticated || !user || !user.id) {
                console.log("[SignalAutoRegister] User not authenticated, skipping");
                return;
            }

            // Get authentication token
            const token = getAccessToken();
            if (!token) {
                console.log("[SignalAutoRegister] No auth token available, retrying...");
                retryCountRef.current++;
                scheduleRetry();
                return;
            }

            isProcessingRef.current = true;
            setStatus('checking');

            try {
                console.log(`[SignalAutoRegister] User ${user.id} authenticated, initializing Signal client...`);

                const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:4000';
                const { SignalClient } = await import("@/app/lib/signal/SignalClient");

                const client = new SignalClient(`${API_GATEWAY_URL}/messaging/api/signal`, token);
                await client.init();
                console.log("[SignalAutoRegister] Signal client initialized");

                // Check if already registered locally
                const isLocallyRegistered = await client.isRegistered();
                console.log("[SignalAutoRegister] Local registration status:", isLocallyRegistered);

                // Check if registered on server by checking prekey count
                // Note: Cannot fetch own bundle - server rejects with "Cannot request your own pre-key bundle"
                let isServerRegistered = false;
                try {
                    const response = await fetch(`${API_GATEWAY_URL}/messaging/api/signal/prekeys/count`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        // If we have prekeys on server, we're registered
                        isServerRegistered = data.count > 0 || data.has_signed_prekey === true;
                    }
                    console.log("[SignalAutoRegister] Server registration status:", isServerRegistered);
                } catch (e) {
                    console.log("[SignalAutoRegister] Server check failed:", e);
                    isServerRegistered = false;
                }

                if (!isLocallyRegistered || !isServerRegistered) {
                    setStatus('registering');
                    console.log("[SignalAutoRegister] Registering with Signal Protocol server...");
                    console.log("[SignalAutoRegister] Local registered:", isLocallyRegistered, "Server registered:", isServerRegistered);

                    // If local keys exist but server doesn't have them, we need to clear and re-register
                    if (isLocallyRegistered && !isServerRegistered) {
                        console.log("[SignalAutoRegister] Local keys exist but server doesn't have them. Re-registering...");
                    }

                    await client.register();
                    console.log("[SignalAutoRegister] ✅ Successfully registered with Signal Protocol");
                } else {
                    console.log("[SignalAutoRegister] ✅ Already registered with Signal Protocol (local + server)");
                }

                setStatus('done');
                retryCountRef.current = -1; // Mark as successfully completed, no more retries
            } catch (err: any) {
                console.error("[SignalAutoRegister] ❌ Registration failed:", err);

                // Check for rate limiting
                const errorMessage = err?.message || '';
                if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('too many requests') || errorMessage.toLowerCase().includes('rate limit')) {
                    setStatus('rate_limited');
                    console.log("[SignalAutoRegister] ⚠️ Rate limited - waiting 60 seconds before retry");
                    retryCountRef.current++;
                    // Use longer backoff for rate limits
                    timeoutId = setTimeout(checkAndRegister, 60000);
                } else if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.toLowerCase().includes('unauthorized')) {
                    // Authentication error - stop retrying
                    console.error("[SignalAutoRegister] ❌ Authentication error - stopping retries");
                    setStatus('error');
                    retryCountRef.current = MAX_RETRIES; // Stop retrying
                } else {
                    // Server errors or other issues - use exponential backoff
                    setStatus('error');
                    retryCountRef.current++;
                    scheduleRetry();
                }
            } finally {
                isProcessingRef.current = false;
            }
        };

        // Try immediately once authenticated
        checkAndRegister();

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [authLoading, isAuthenticated, user]); // Run when authentication state changes

    // This component renders nothing visible
    return null;
}

export default SignalAutoRegister;
