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

export function SignalAutoRegister() {
    const hasAttemptedRef = useRef(false);
    const [status, setStatus] = useState<'idle' | 'checking' | 'registering' | 'done' | 'error'>('idle');

    useEffect(() => {
        // Poll for token availability (user might not be logged in immediately)
        const checkAndRegister = async () => {
            const token = getAccessToken();

            if (!token) {
                // No token yet, keep polling
                return false;
            }

            if (hasAttemptedRef.current) {
                return true;
            }

            hasAttemptedRef.current = true;
            setStatus('checking');

            try {
                console.log("[SignalAutoRegister] Token found, initializing Signal client...");

                const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:4000';
                const { SignalClient } = await import("@/app/lib/signal/SignalClient");

                const client = new SignalClient(`${API_GATEWAY_URL}/messaging/api/signal`, token);
                await client.init();
                console.log("[SignalAutoRegister] Signal client initialized");

                // Check if already registered locally
                const isLocallyRegistered = await client.isRegistered();
                console.log("[SignalAutoRegister] Local registration status:", isLocallyRegistered);

                // ALSO check if registered on server by trying to fetch our own bundle
                let isServerRegistered = false;
                const user = getUserFromToken();
                if (user?.id) {
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
                return true;
            } catch (err) {
                console.error("[SignalAutoRegister] ❌ Registration failed:", err);
                setStatus('error');
                // Reset so we can retry
                hasAttemptedRef.current = false;
                return false;
            }
        };

        // Try immediately
        checkAndRegister();

        // Also set up an interval to retry if token wasn't available or registration failed
        const interval = setInterval(async () => {
            const success = await checkAndRegister();
            if (success) {
                clearInterval(interval);
            }
        }, 3000); // Check every 3 seconds

        return () => {
            clearInterval(interval);
        };
    }, []);

    // This component renders nothing visible
    return null;
}

export default SignalAutoRegister;
