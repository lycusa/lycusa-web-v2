"use client";

import { useAuth } from "@/app/components/auth/AuthGuard";
import { useConversations } from "@/app/hooks/useMessaging";
import { ConversationList } from "@/app/components/messages";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { HomeIcon, ShoppingBagIcon, MagnifyingGlassIcon, ExclamationCircleIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function MessagesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const { conversations, loading, error } = useConversations();
    const pathname = usePathname();

    // In mobile view, hiding the sidebar if we are inside a conversation
    const isConversationOpen = pathname.includes("/messages/") && pathname !== "/messages";
    const sidebarClass = isConversationOpen ? "hidden md:flex" : "flex";
    const contentClass = isConversationOpen ? "flex" : "hidden md:flex";

    if (authLoading || loading) {
        return (
            <div className="h-screen bg-gradient-to-br from-slate-50 via-tyrian-50 to-zinc-50 flex items-center justify-center relative overflow-hidden">
                {/* Animated background elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-tyrian-400/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-zinc-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
                </div>
                <div className="flex flex-col items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-full border-2 border-tyrian-600 border-t-transparent animate-spin" />
                    <span className="text-sm text-gray-500">Loading messages...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <>{children}</>; // Let the page component handle the redirect/auth message
    }

    return (
        <div className="h-screen bg-gradient-to-br from-slate-50 via-tyrian-50 to-zinc-50 flex overflow-hidden relative">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-tyrian-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-zinc-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-tyrian-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
            </div>

            {/* Sidebar */}
            <div className={`w-full md:w-[380px] lg:w-[420px] flex-shrink-0 flex-col bg-white/90 backdrop-blur-xl border-r border-gray-200/50 z-20 ${sidebarClass}`}>
                {/* Header */}
                <div className="h-16 px-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image
                            src="/logos/tyrian-purple-with-word.svg"
                            alt="Lycusa"
                            width={120}
                            height={36}
                            className="h-8 w-auto group-hover:scale-105 transition-transform"
                            priority
                            unoptimized
                        />
                    </Link>

                    <div className="flex items-center gap-1">
                        <Link href="/orders" className="p-2 text-gray-400 hover:text-tyrian-600 hover:bg-tyrian-50 rounded-lg transition-all" title="View Orders">
                            <ShoppingBagIcon className="w-6 h-6" />
                        </Link>
                        <Link href="/" className="p-2 text-gray-400 hover:text-tyrian-600 hover:bg-tyrian-50 rounded-lg transition-all" title="Go Home">
                            <HomeIcon className="w-6 h-6" />
                        </Link>
                    </div>
                </div>

                {/* Search */}
                <div className="p-3 border-b border-gray-100">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent focus:bg-white focus:border-tyrian-500 focus:ring-4 focus:ring-tyrian-500/10 rounded-xl text-sm transition-all"
                        />
                        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-tyrian-500 transition-colors" />
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto chat-scrollbar relative">
                    {error && (
                        <div className="m-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="px-2 py-2">
                        <ConversationList
                            conversations={conversations}
                            currentUserId={user.id}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-gray-400 bg-white border border-gray-200 py-1.5 rounded-full shadow-sm">
                        <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                        <span>End-to-End Encrypted Environment</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 flex-col h-full relative bg-white/80 backdrop-blur-xl md:flex ${contentClass}`}>
                {children}
            </div>
        </div>
    );
}
