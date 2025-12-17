"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/components/auth/AuthGuard";
import LogoutButton from "@/app/components/auth/LogoutButton";

interface HeaderProps {
    showNav?: boolean;
    className?: string;
}

/**
 * Header provides a consistent header with the brand logo across all pages.
 * Shows navigation items and auth state.
 */
export default function Header({ showNav = true, className = "" }: HeaderProps) {
    const { user, loading, isAuthenticated } = useAuth();

    return (
        <header className={`sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    {/* Brand Logo - Always consistent */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image
                            src="/logos/tyrian-purple-with-word.svg"
                            alt="Lycusa"
                            width={140}
                            height={40}
                            className="h-10 w-auto group-hover:scale-105 transition-transform"
                            priority
                        />
                    </Link>

                    {showNav && (
                        <nav className="flex items-center gap-3">
                            <Link
                                href="/products"
                                className="px-4 py-2 text-gray-700 hover:text-tyrian-800 transition-colors text-sm font-medium hover:bg-tyrian-50 rounded-xl"
                            >
                                Browse
                            </Link>
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-9 bg-gray-200 animate-pulse rounded-xl"></div>
                                    <div className="w-20 h-9 bg-gray-200 animate-pulse rounded-xl"></div>
                                </div>
                            ) : isAuthenticated ? (
                                <>
                                    <Link
                                        href="/my-products"
                                        className="px-4 py-2 text-gray-700 hover:text-tyrian-800 transition-colors text-sm font-medium hover:bg-tyrian-50 rounded-xl"
                                    >
                                        My Products
                                    </Link>
                                    <Link
                                        href="/orders"
                                        className="px-4 py-2 text-gray-700 hover:text-tyrian-800 transition-colors text-sm font-medium hover:bg-tyrian-50 rounded-xl"
                                    >
                                        Orders
                                    </Link>
                                    <Link
                                        href="/messages"
                                        className="px-4 py-2 text-gray-700 hover:text-tyrian-800 transition-colors text-sm font-medium hover:bg-tyrian-50 rounded-xl"
                                    >
                                        Messages
                                    </Link>
                                    <Link
                                        href="/products/new"
                                        className="px-4 py-2 bg-tyrian-800 text-white rounded-xl hover:bg-tyrian-900 transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                                    >
                                        Sell Product
                                    </Link>
                                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-tyrian-50 to-gray-100 rounded-xl border border-tyrian-200/50">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
                                            {user?.email ||
                                                `${user?.walletAddress?.slice(0, 6)}...${user?.walletAddress?.slice(-4)}`}
                                        </span>
                                    </div>
                                    <LogoutButton className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all text-sm font-medium" />
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/signin"
                                        className="px-4 py-2 text-gray-700 hover:text-tyrian-800 transition-colors text-sm font-medium hover:bg-tyrian-50 rounded-xl"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="px-5 py-2 bg-tyrian-800 text-white rounded-xl hover:bg-tyrian-900 transition-all text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </nav>
                    )}
                </div>
            </div>
        </header>
    );
}
