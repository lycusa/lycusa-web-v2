"use client";

import { useAuth } from "@/app/components/auth/AuthGuard";
import { useConversations, useE2EEKeys } from "@/app/hooks/useMessaging";
import { ConversationList, EncryptionIndicator } from "@/app/components/messages";
import Link from "next/link";

export default function MessagesPage() {
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const { conversations, loading, error, refetch } = useConversations();
    const { isInitialized: keysReady, error: keyError } = useE2EEKeys();

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
                    <p className="text-sm text-gray-600 mb-6">Please sign in to view your messages.</p>
                    <Link href="/signin" className="btn btn-primary w-full justify-center">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                    <EncryptionIndicator isInitialized={keysReady} error={keyError} />
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <ConversationList
                    conversations={conversations}
                    currentUserId={user.id}
                />
            </div>
        </div>
    );
}
