"use client";

import { useAuth } from "@/app/components/auth/AuthGuard";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function MessagesPage() {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) {
        return (
            <div className="h-full flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center max-w-md w-full animate-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ChatBubbleLeftRightIcon className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to view messages</h2>
                    <p className="text-gray-500 mb-8">Access your secure conversations by signing in to your account.</p>
                    <Link
                        href="/signin"
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-tyrian-800 text-white font-semibold rounded-xl hover:bg-tyrian-900 transition-colors shadow-lg shadow-tyrian-200"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex items-center justify-center bg-gray-50/50 pattern-grid">
            <div className="text-center max-w-sm px-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-1 ring-gray-100">
                    <div className="relative">
                        <ChatBubbleLeftRightIcon className="w-12 h-12 text-zinc-300" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-tyrian-600 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tyrian-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </div>
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500 leading-relaxed">
                    Choose a conversation from the sidebar to start securely messaging with buyers and sellers.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        🔒 End-to-End Encrypted
                    </span>
                </div>
            </div>
        </div>
    );
}
