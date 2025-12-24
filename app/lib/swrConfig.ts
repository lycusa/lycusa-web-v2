import type { SWRConfiguration } from "swr";

/**
 * Global SWR configuration for the application.
 * These settings provide optimal caching behavior for product data.
 */
export const swrConfig: SWRConfiguration = {
    // Revalidate data when window regains focus
    revalidateOnFocus: true,

    // Revalidate when network reconnects
    revalidateOnReconnect: true,

    // Dedupe requests within 2 seconds
    dedupingInterval: 2000,

    // Throttle focus revalidation to every 5 seconds
    focusThrottleInterval: 5000,

    // Show stale data while revalidating (SWR default behavior)
    revalidateIfStale: true,

    // Keep previous data when key changes (smoother transitions)
    keepPreviousData: true,

    // Error retry configuration
    errorRetryCount: 3,
    errorRetryInterval: 1000,

    // Global error handler (logs to console)
    onError: (error, key) => {
        console.error(`[SWR] Error fetching ${key}:`, error);
    },
};

/**
 * Cache key generators for consistent key management
 */
export const cacheKeys = {
    product: (id: string) => `/product/${id}`,
    products: (queryHash: string) => `/products/search/${queryHash}`,
    productsBatch: (idsHash: string) => `/products/batch/${idsHash}`,
    userProducts: (sellerId: string) => `/products/seller/${sellerId}`,
};

/**
 * Generate a hash from an object for cache key purposes
 */
export function hashObject(obj: unknown): string {
    return JSON.stringify(obj);
}
