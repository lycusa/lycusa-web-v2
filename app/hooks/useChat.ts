'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSignal } from './useSignal';
import {
    joinRoom,
    leaveRoom,
    onMessage,
    sendMessage as socketSendMessage,
    isConnected as socketIsConnected
} from '@/app/lib/socket';
import { Message, SendMessagePayload } from '@/app/lib/types/messaging';

interface UseChatOptions {
    token: string;
    conversationId: string;
    recipientId: string;
    userId: string;
}

export function useChat({
    token,
    conversationId,
    recipientId,
    userId
}: UseChatOptions) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isJoined, setIsJoined] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        signalClient,
        isRegistered,
        isInitialized,
        encryptMessage,
        decryptMessage
    } = useSignal(token);

    // Join channel
    useEffect(() => {
        if (!token || !conversationId || !isRegistered) return;

        let mounted = true;

        const connectAndJoin = async () => {
            try {
                await joinRoom(conversationId);
                if (mounted) {
                    setIsJoined(true);
                    setError(null);
                }
            } catch (err) {
                if (mounted) {
                    console.error("Failed to join room:", err);
                    setError(err instanceof Error ? err.message : 'Failed to join room');
                }
            }
        };

        connectAndJoin();

        return () => {
            mounted = false;
            leaveRoom(conversationId);
            setIsJoined(false);
        };
    }, [token, conversationId, isRegistered]); // Re-join if registered status changes? Maybe just wait for register.

    // Handle incoming messages
    useEffect(() => {
        if (!isJoined) return;

        const unsubscribe = onMessage(conversationId, async (msg: Message) => {
            // If message is from us, we already have it in state? 
            // Socket usually echoes back.
            // If it has signal content, we should decrypt it (if it's from others) or just show plaintext if we sent it?
            // But with Signal, we might not be able to decrypt our own messages if we don't save the plaintext or session keys for self?
            // Usually you save your own message in plaintext locally.
            // But here, if we receive it from socket, it's encrypted.
            // Can we decrypt our own message?
            // Signal Protocol: Sender encrypts for Recipient. Sender cannot decrypt unless they encrypted for themselves too (not standard 1-to-1).
            // So we MUST ignore echo of own encrypted message and rely on local optimistic add, OR 
            // if the backend sends back the message with plaintext (unlikely for E2EE).

            // Strategy: Decrypt ONLY if sender != userId.

            if (msg.sender_id === userId) {
                // We might handle this if we rely on server ack to confirm.
                // For now, let's treat it as "needs decryption" only if it's someone else.
                return;
            }

            if (msg.signal_ciphertext && msg.signal_message_type) {
                try {
                    const decrypted = await decryptMessage(
                        msg.sender_id,
                        conversationId,
                        msg.signal_ciphertext,
                        msg.signal_message_type
                    );

                    setMessages(prev => {
                        // Avoid duplicates
                        if (prev.some(m => m.id === msg.id)) return prev;
                        return [...prev, { ...msg, content: decrypted }]; // Use content field for display
                    });
                } catch (err) {
                    console.error('Decryption failed:', err);
                    setMessages(prev => {
                        if (prev.some(m => m.id === msg.id)) return prev;
                        return [...prev, { ...msg, content: '[Decryption Failed]' }];
                    });
                }
            } else if (msg.content) {
                // Legacy plaintext or system message
                setMessages(prev => {
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
            }
        });

        return () => {
            unsubscribe();
        };
    }, [isJoined, conversationId, userId, decryptMessage]);

    // Send message
    const sendMessage = useCallback(async (content: string) => {
        if (!isJoined || !isRegistered) {
            throw new Error('Not ready to send messages');
        }

        // Encrypt
        const encrypted = await encryptMessage(recipientId, conversationId, content);

        const payload: SendMessagePayload = {
            signal_ciphertext: encrypted.ciphertext,
            signal_message_type: encrypted.messageType as 1 | 2,
            encrypted_content: "", // Legacy fields empty
            nonce: ""
        };

        // Optimistic UI update
        const tempId = `temp-${Date.now()}`;
        const optimisticMsg: Message = {
            id: tempId,
            sender_id: userId,
            content: content,
            inserted_at: new Date().toISOString(),
            conversation_id: conversationId
        };

        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const response = await socketSendMessage(conversationId, payload);
            // Replace optimistic message with real one
            setMessages(prev => prev.map(m => m.id === tempId ? { ...response, content } : m));
            return response;
        } catch (e) {
            // Remove optimistic message on failure
            setMessages(prev => prev.filter(m => m.id !== tempId));
            throw e;
        }
    }, [isJoined, isRegistered, recipientId, conversationId, encryptMessage, userId]);

    return {
        messages,
        sendMessage,
        isConnected: socketIsConnected(),
        isJoined,
        isRegistered,
        isInitialized, // Added this
        error,
    };
}
