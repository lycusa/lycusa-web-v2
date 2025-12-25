"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useFavorites } from "@/app/hooks/useFavorites";
import { useProductsBatch } from "@/app/hooks/useProducts";
import BentoProductGrid from "@/app/components/products/BentoProductGrid";
import { clearAllFavorites } from "@/app/lib/favoritesCache";

export default function FavoritesPage() {
    const { favoriteIds, favoritesCount, isReady } = useFavorites();
    const [showClearModal, setShowClearModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    // Use SWR hook for batch product fetching with automatic caching
    // Only fetch when favorites are ready and we have some favorites
    const { products, isLoading, error } = useProductsBatch(isReady ? favoriteIds : []);

    // Show loading while favorites cache is initializing
    const loading = !isReady || isLoading;

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && showClearModal) {
                setShowClearModal(false);
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [showClearModal]);

    const handleClearAll = () => {
        clearAllFavorites();
        setShowClearModal(false);
        showToastMessage("All favorites cleared");
    };

    const showToastMessage = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/products"
                                className="flex items-center gap-2 group"
                            >
                                <svg
                                    className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                                <span className="text-sm font-medium">
                                    Back to Products
                                </span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <svg
                                    className="w-6 h-6 text-rose-500"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                My Favorites
                                {favoritesCount > 0 && (
                                    <span className="ml-2 px-2.5 py-0.5 bg-rose-100 text-rose-600 text-sm font-semibold rounded-full">
                                        {favoritesCount}
                                    </span>
                                )}
                            </h1>
                            {favoritesCount > 0 && (
                                <button
                                    onClick={() => setShowClearModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Info Banner */}
                {!loading && products.length > 0 && (
                    <div className="mb-6 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="shrink-0">
                                <svg
                                    className="w-5 h-5 text-rose-600 mt-0.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-rose-900">
                                    <span className="font-semibold">Quick Tip:</span> Click the heart icon on any product to remove it from your favorites, or use the <span className="font-semibold">Clear All</span> button to start fresh.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-pulse space-y-4 w-full max-w-2xl">
                            <div className="h-48 bg-gray-200 rounded-2xl"></div>
                            <div className="h-48 bg-gray-200 rounded-2xl"></div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md">
                            <svg
                                className="w-12 h-12 text-red-500 mx-auto mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="text-red-600 font-medium">{error}</p>
                        </div>
                    </div>
                ) : products.length === 0 ? (
                    // Empty State
                    <div className="flex flex-col items-center justify-center py-20 px-6">
                        <div className="text-center max-w-md">
                            <div className="mb-6">
                                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-12 h-12 text-rose-400"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={1.5}
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                No favorites yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Start exploring products and tap the heart icon to save
                                your favorites here.
                            </p>
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-tyrian-800 to-brand-600 text-white rounded-xl hover:from-tyrian-900 hover:to-brand-700 transition-all font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                Browse Products
                            </Link>
                        </div>
                    </div>
                ) : (
                    <BentoProductGrid
                        products={products}
                        emptyMessage="No favorites found"
                    />
                )}
            </main>

            {/* Clear All Confirmation Modal */}
            {showClearModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setShowClearModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                                <svg
                                    className="w-6 h-6 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    Clear all favorites?
                                </h3>
                                <p className="text-gray-600 text-sm mb-6">
                                    This will remove all {favoritesCount} {favoritesCount === 1 ? 'item' : 'items'} from your favorites. This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowClearModal(false)}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleClearAll}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <p className="font-medium">{toastMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
