"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/auth/AuthGuard";
import { useConversation, useE2EEKeys } from "@/app/hooks/useMessaging";
import { useUserProfile } from "@/app/hooks/useUser";
import { ChatContainer, EncryptionIndicator } from "@/app/components/messages";
import Link from "next/link";
import { ArrowLeftIcon, EllipsisHorizontalIcon, ShieldCheckIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

interface PageProps {
    params: Promise<{
        conversationId: string;
    }>;
}

export default function ChatPage({ params }: PageProps) {
    const { conversationId: urlParam } = use(params);
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
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
    } = useConversation(urlParam);

    // Redirect if URL contains order_id instead of conversation_id
    // This ensures the URL always reflects the actual conversation ID
    useEffect(() => {
        if (conversation && conversation.id !== urlParam) {
            // URL has order_id, redirect to proper conversation_id URL
            router.replace(`/messages/${conversation.id}`);
        }
    }, [conversation, urlParam, router]);

    // Use actual conversation ID for components (handles both direct access and order_id access)
    const conversationId = conversation?.id || urlParam;

    const { isInitialized: keysInitialized, error: keysError } = useE2EEKeys();

    const currentUserId = user?.id || "";
    // Determine the other user in the conversation with proper string comparison
    const otherUserId = conversation
        ? (() => {
            const currentIdStr = String(currentUserId);
            const userOneIdStr = String(conversation.user_one_id || '');
            const userTwoIdStr = String(conversation.user_two_id || '');

            if (userOneIdStr === currentIdStr) return conversation.user_two_id;
            if (userTwoIdStr === currentIdStr) return conversation.user_one_id;
            // Fallback if current user doesn't match either
            return conversation.user_two_id;
        })()
        : null;

    const { profile: otherUserProfile, loading: profileLoading } = useUserProfile(otherUserId);

    if (loading || profileLoading) {
        return (
            <div className="h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
                    <span className="text-sm text-gray-500">Loading conversation...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheckIcon className="w-8 h-8 text-brand-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in required</h2>
                    <p className="text-gray-500 mb-8">Please sign in to view this conversation.</p>
                    <Link
                        href="/signin"
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-tyrian-800 text-white font-semibold rounded-xl hover:bg-tyrian-900 transition-colors"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    // Get other user info for header
    const isUserOne = conversation?.user_one_id === user.id;
    // const otherUserId = isUserOne ? conversation?.user_two_id : conversation?.user_one_id;

    // Generate avatar gradient
    const gradientIndex = otherUserId ? otherUserId.charCodeAt(0) % 5 : 0;
    const gradients = [
        'from-brand-500 to-tyrian-600',
        'from-pink-500 to-rose-600',
        'from-cyan-500 to-brand-600',
        'from-emerald-500 to-teal-600',
        'from-amber-500 to-orange-600',
    ];

    const displayName = otherUserProfile?.username || (otherUserId ? `User ${otherUserId.slice(0, 8)}` : "Unknown User");

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            {/* Header */}
            <header className="flex-shrink-0 bg-white border-b border-gray-100 z-30 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
                <div className="h-16 px-4 lg:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 lg:gap-4 overflow-hidden">
                        {/* Back Button (Mobile functional, Desktop decorative/hidden) */}
                        <Link
                            href="/messages"
                            className="md:hidden flex items-center justify-center w-9 h-9 -ml-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-95"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </Link>

                        {/* User Info */}
                        <div className="flex items-center gap-3 min-w-0">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradients[gradientIndex]} flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white`}>
                                    {otherUserProfile?.avatar_url ? (
                                        <img src={otherUserProfile.avatar_url} alt={displayName} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        displayName.slice(0, 2).toUpperCase()
                                    )}
                                </div>
                                {isConnected && !isClosed && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                                )}
                            </div>

                            {/* Name & Status */}
                            <div className="flex flex-col min-w-0 justify-center">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-sm border-b border-transparent font-semibold text-gray-900 truncate hover:border-gray-900 cursor-default transition-borderColor">
                                        {displayName}
                                    </h1>
                                    <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 rounded text-[10px] font-medium text-gray-500 border border-gray-100">
                                        <span>Order</span>
                                        <span className="font-mono">#{conversation?.order_id.slice(0, 6).toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    {isClosed ? (
                                        <span className="text-gray-400 font-medium">Archived</span>
                                    ) : (
                                        <>
                                            <span className={`font-medium ${isConnected ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                {isConnected ? 'Active now' : 'Offline'}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* E2EE Badge (Desktop) */}
                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-medium border border-emerald-100/50">
                            <ShieldCheckIcon className="w-3.5 h-3.5" />
                            <span>Private & Encrypted</span>
                        </div>

                        <EncryptionIndicator isInitialized={keysInitialized} error={keysError} />

                        <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

                        {conversation && (
                            <Link
                                href={`/orders/${conversation.order_id}`}
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            >
                                <span className="hidden sm:inline">Order Details</span>
                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                            </Link>
                        )}

                        <button className="flex items-center justify-center w-9 h-9 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                            <EllipsisHorizontalIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-hidden">
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
                    keysInitialized={keysInitialized}
                    keysError={keysError}
                />
            </main>
        </div>
    );
}
