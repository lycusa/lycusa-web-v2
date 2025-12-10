"use client";

import { use } from "react";
import { useAuth } from "@/app/components/auth/AuthGuard";
import { useConversation } from "@/app/hooks/useMessaging";
import { ChatContainer } from "@/app/components/messages";
import Link from "next/link";

interface Props {
    params: Promise<{ conversationId: string }>;
}

export default function ChatPage({ params }: Props) {
    const { conversationId } = use(params);
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const {
        conversation,
        messages,
        loading,
        error,
        isClosed,
        closedReason,
        sendMessage,
        sendMedia,
        isConnected,
    } = useConversation(conversationId);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Sign in required</h2>
                    <p className="text-sm text-gray-600 mb-6">Please sign in to view this conversation.</p>
                    <Link href="/signin" className="btn btn-primary w-full justify-center">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Link href="/messages" className="text-gray-500 hover:text-gray-700 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>

                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-semibold text-gray-900 truncate">
                            {conversation ? `Order #${conversation.order_id.slice(0, 8).toUpperCase()}` : 'Loading...'}
                        </h1>
                        {conversation && (
                            <p className="text-xs text-gray-500 truncate">
                                Conversation ID: {conversation.id}
                            </p>
                        )}
                    </div>

                    {conversation && (
                        <Link
                            href={`/orders/${conversation.order_id}`}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                            View Order
                        </Link>
                    )}
                </div>
            </div>

            <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:px-6 lg:px-8">
                <ChatContainer
                    conversationId={conversationId}
                    messages={messages}
                    currentUserId={user.id}
                    isClosed={isClosed}
                    closedReason={closedReason}
                    isConnected={isConnected}
                    onSendMessage={sendMessage}
                    onSendMedia={sendMedia}
                    error={error}
                />
            </main>
        </div>
    );
}
