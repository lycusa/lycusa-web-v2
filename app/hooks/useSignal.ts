'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { SignalClient } from '@/app/lib/signal/SignalClient';

const API_BASE = process.env.NEXT_PUBLIC_MESSAGING_API_URL || 'http://localhost:4001';

export function useSignal(token: string) {
    const clientRef = useRef<SignalClient | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize client and auto-register if needed
    useEffect(() => {
        if (!token) return;

        let mounted = true;

        const initClient = async () => {
            try {
                const client = new SignalClient(`${API_BASE}/api/signal`, token);
                await client.init();

                if (!mounted) return;
                clientRef.current = client;
                setIsInitialized(true);

                // Check if already registered
                const registered = await client.isRegistered();

                if (!mounted) return;

                if (registered) {
                    setIsRegistered(true);
                    console.log('[Signal] User already registered with Signal Protocol');
                } else {
                    // Auto-register for seamless UX
                    console.log('[Signal] User not registered, auto-registering...');
                    try {
                        await client.register();
                        if (mounted) {
                            setIsRegistered(true);
                            console.log('[Signal] Auto-registration successful');
                        }
                    } catch (regErr) {
                        console.error('[Signal] Auto-registration failed:', regErr);
                        if (mounted) {
                            setError(regErr instanceof Error ? regErr.message : 'Auto-registration failed');
                        }
                    }
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err.message : 'Failed to initialize');
                }
            }
        };

        initClient();

        return () => {
            mounted = false;
        };
    }, [token]);

    // Register with Signal Protocol
    const register = useCallback(async () => {
        if (!clientRef.current) {
            throw new Error('Client not initialized');
        }

        try {
            await clientRef.current.register();
            setIsRegistered(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            setError(message);
            throw err;
        }
    }, []);

    // Encrypt message
    const encryptMessage = useCallback(
        async (recipientId: string, conversationId: string, plaintext: string) => {
            if (!clientRef.current || !isRegistered) {
                throw new Error('Not registered');
            }

            return clientRef.current.encryptMessage(
                recipientId,
                conversationId,
                plaintext
            );
        },
        [isRegistered]
    );

    // Decrypt message
    const decryptMessage = useCallback(
        async (
            senderId: string,
            conversationId: string,
            ciphertext: string,
            messageType: 1 | 2
        ) => {
            if (!clientRef.current) {
                throw new Error('Client not initialized');
            }

            return clientRef.current.decryptMessage(
                senderId,
                conversationId,
                ciphertext,
                messageType
            );
        },
        []
    );

    // Check pre-key count
    const checkPreKeys = useCallback(async () => {
        if (!clientRef.current) return null;
        return clientRef.current.checkPreKeyCount();
    }, []);

    return {
        signalClient: clientRef.current,
        isInitialized,
        isRegistered,
        error,
        register,
        encryptMessage,
        decryptMessage,
        checkPreKeys,
    };
}
