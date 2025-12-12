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
import { getAccessToken, getUserFromToken } from "@/app/lib/auth";

const MAX_RETRIES = 5;
const INITIAL_BACKOFF_MS = 5000; // 5 seconds

export function SignalAutoRegister() {
    const isProcessingRef = useRef(false);
    const retryCountRef = useRef(0);
    const [status, setStatus] = useState<'idle' | 'checking' | 'registering' | 'done' | 'error' | 'rate_limited'>('idle');

    useEffect(() => {
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

            // Check for authentication token
            const token = getAccessToken();
            if (!token) {
                console.log("[SignalAutoRegister] No auth token available");
                retryCountRef.current++;
                scheduleRetry();
                return;
            }

            // Verify user is actually authenticated
            const user = getUserFromToken();
            if (!user || !user.id) {
                console.log("[SignalAutoRegister] Invalid or expired token - user not authenticated");
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

                // Check if registered on server by trying to fetch our own bundle
                let isServerRegistered = false;
                try {
                    const response = await fetch(`${API_GATEWAY_URL}/messaging/api/signal/bundle/${user.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    isServerRegistered = response.ok;
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

        // Try immediately on mount
        checkAndRegister();

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []); // Empty dependency array - only run once on mount

    // This component renders nothing visible
    return null;
}

export default SignalAutoRegister;
