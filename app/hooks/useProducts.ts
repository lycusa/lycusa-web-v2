"use client";

import useSWR, { mutate } from "swr";
import { getProduct, searchProducts, getProductsBatch } from "@/app/lib/api";
import { cacheKeys, hashObject } from "@/app/lib/swrConfig";
import type { Product, SearchQuery, SearchResult, SearchResultItem } from "@/app/lib/types/product";

/**
 * Hook for fetching a single product by ID with SWR caching.
 * Provides automatic background revalidation and stale-while-revalidate behavior.
 */
export function useProduct(productId: string | null) {
    const { data, error, isLoading, isValidating, mutate: mutateProduct } = useSWR(
        productId ? cacheKeys.product(productId) : null,
        async () => {
            if (!productId) return null;
            const response = await getProduct(productId);
            if (response.success && response.data) {
                return response.data as Product;
            }
            throw new Error(response.message || "Product not found");
        },
        {
            revalidateOnFocus: true,
            dedupingInterval: 5000,
        }
    );

    return {
        product: data ?? null,
        isLoading,
        isValidating,
        error: error?.message ?? null,
        mutate: mutateProduct,
    };
}

/**
 * Hook for searching products with SWR caching.
 * Automatically caches search results and revalidates in the background.
 */
export function useProducts(query: SearchQuery | null) {
    const queryHash = query ? hashObject(query) : null;

    const { data, error, isLoading, isValidating, mutate: mutateProducts } = useSWR(
        queryHash ? cacheKeys.products(queryHash) : null,
        async () => {
            if (!query) return null;
            const response = await searchProducts(query);
            if (response.success && response.data) {
                return response.data as SearchResult;
            }
            throw new Error(response.message || "Failed to search products");
        },
        {
            revalidateOnFocus: false, // Don't revalidate search on focus (might change results unexpectedly)
            dedupingInterval: 2000,
            keepPreviousData: true, // Keep previous results while loading new ones
        }
    );

    return {
        searchResult: data ?? null,
        products: data?.results ?? [],
        totalResults: data?.total_results ?? 0,
        totalPages: data?.total_pages ?? 0,
        page: data?.page ?? 1,
        isLoading,
        isValidating,
        error: error?.message ?? null,
        mutate: mutateProducts,
    };
}

/**
 * Hook for fetching products by seller ID with SWR caching.
 * Optimized for seller profile pages and my-products views.
 */
export function useSellerProducts(
    sellerId: string | null,
    options?: {
        status?: string;
        page?: number;
        size?: number;
    }
) {
    const query: SearchQuery | null = sellerId ? {
        query: "*",
        seller_id: sellerId,
        page: options?.page ?? 1,
        size: options?.size ?? 100,
        sort_by: "created_at",
        sort_order: "desc",
        ...(options?.status ? { status: options.status as any } : {}),
    } : null;

    const cacheKey = sellerId ? cacheKeys.userProducts(sellerId + hashObject(options ?? {})) : null;

    const { data, error, isLoading, isValidating, mutate: mutateProducts } = useSWR(
        cacheKey,
        async () => {
            if (!query) return null;
            const response = await searchProducts(query);
            if (response.success && response.data) {
                return response.data as SearchResult;
            }
            throw new Error(response.message || "Failed to load seller products");
        },
        {
            revalidateOnFocus: true,
            dedupingInterval: 3000,
        }
    );

    return {
        products: (data?.results ?? []) as SearchResultItem[],
        totalResults: data?.total_results ?? 0,
        isLoading,
        isValidating,
        error: error?.message ?? null,
        mutate: mutateProducts,
    };
}

/**
 * Hook for batch-fetching products by IDs with SWR caching.
 * Optimized for favorites page where multiple product IDs need to be fetched.
 */
export function useProductsBatch(productIds: string[]) {
    // Sort IDs for consistent cache key
    const sortedIds = [...productIds].sort();
    const idsHash = sortedIds.join(",");

    const { data, error, isLoading, isValidating, mutate: mutateProducts } = useSWR(
        productIds.length > 0 ? cacheKeys.productsBatch(idsHash) : null,
        async () => {
            if (productIds.length === 0) return [];
            const response = await getProductsBatch(productIds);
            if (response.success && response.data) {
                return response.data as Product[];
            }
            throw new Error(response.message || "Failed to fetch products");
        },
        {
            revalidateOnFocus: true,
            dedupingInterval: 5000,
        }
    );

    return {
        products: data ?? [],
        isLoading,
        isValidating,
        error: error?.message ?? null,
        mutate: mutateProducts,
    };
}

/**
 * Utility function to invalidate product cache after mutations (create, update, delete).
 * Call this after product operations to ensure fresh data.
 */
export function invalidateProductCache(productId?: string) {
    if (productId) {
        // Invalidate specific product
        mutate(cacheKeys.product(productId));
    }
    // Invalidate all search results (uses matcher function)
    mutate((key: string) => typeof key === "string" && key.startsWith("/products/"), undefined, { revalidate: true });
}
