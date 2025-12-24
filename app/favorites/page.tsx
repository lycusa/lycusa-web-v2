"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useFavorites } from "@/app/hooks/useFavorites";
import { getProductsBatch } from "@/app/lib/api";
import BentoProductGrid from "@/app/components/products/BentoProductGrid";
import type { Product } from "@/app/lib/types/product";

export default function FavoritesPage() {
    const { favoriteIds, favoritesCount, isReady } = useFavorites();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Track if a fetch is in progress to prevent duplicate requests
    const isFetchingRef = useRef(false);
    // Track the last fetched IDs to prevent unnecessary re-fetches
    const lastFetchedIdsRef = useRef<string>("");

    useEffect(() => {
        const fetchFavoriteProducts = async () => {
            if (!isReady) return;

            // Create a stable string representation for comparison
            const idsKey = favoriteIds.slice().sort().join(",");

            // Skip if already fetching or if IDs haven't changed
            if (isFetchingRef.current || idsKey === lastFetchedIdsRef.current) {
                return;
            }

            if (favoriteIds.length === 0) {
                setProducts([]);
                setLoading(false);
                lastFetchedIdsRef.current = idsKey;
                return;
            }

            try {
                isFetchingRef.current = true;
                setLoading(true);
                // Fetch favorite products using the batch endpoint
                const response = await getProductsBatch(favoriteIds);

                if (response.success && response.data) {
                    setProducts(response.data);
                }
                lastFetchedIdsRef.current = idsKey;
            } catch (err: any) {
                console.error("Error fetching favorite products:", err);
                setError(err.message || "Failed to load favorites");
            } finally {
                setLoading(false);
                isFetchingRef.current = false;
            }
        };

        fetchFavoriteProducts();
    }, [favoriteIds, isReady]);

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
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </div>
    );
}
