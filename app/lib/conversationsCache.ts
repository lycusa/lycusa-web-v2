/**
 * Conversations Cache
 * Implements TTL caching, request deduplication, and stale-while-revalidate patterns
 * to prevent rate limiting on /messaging/api/conversations endpoint
 */

import type { Conversation } from "@/app/lib/types/messaging";

// ===== Configuration =====

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const STALE_TTL_MS = 30 * 1000; // 30 seconds - return cached data within this window without background refresh
const MIN_REFETCH_INTERVAL_MS = 10 * 1000; // Minimum 10 seconds between refetches

// ===== Types =====

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

type CacheListener = (conversations: Conversation[]) => void;

// ===== Cache State =====

let conversationsCache: CacheEntry<Conversation[]> | null = null;
let pendingRequest: Promise<Conversation[]> | null = null;
let lastFetchTime = 0;
const listeners: Set<CacheListener> = new Set();

// ===== Core Cache Functions =====

/**
 * Check if cache data is still valid (not expired)
 */
const isCacheValid = (): boolean => {
    if (!conversationsCache) return false;
    return Date.now() < conversationsCache.expiresAt;
};

/**
 * Check if cache is stale but usable (for stale-while-revalidate)
 */
const isCacheStale = (): boolean => {
    if (!conversationsCache) return true;
    const age = Date.now() - conversationsCache.timestamp;
    return age > STALE_TTL_MS;
};

/**
 * Check if we should skip refetch due to rate limiting protection
 */
const shouldSkipRefetch = (): boolean => {
    const timeSinceLastFetch = Date.now() - lastFetchTime;
    return timeSinceLastFetch < MIN_REFETCH_INTERVAL_MS;
};

/**
 * Update cache with new data
 */
const updateCache = (data: Conversation[]): void => {
    conversationsCache = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_TTL_MS,
    };
    lastFetchTime = Date.now();

    // Notify all listeners
    listeners.forEach((listener) => {
        try {
            listener(data);
        } catch (err) {
            console.error("[ConversationsCache] Listener error:", err);
        }
    });
};

/**
 * Get cached conversations if available
 */
export const getCachedConversations = (): Conversation[] | null => {
    if (!conversationsCache) return null;
    return conversationsCache.data;
};

/**
 * Get a single conversation from cache by ID
 */
export const getCachedConversation = (
    conversationId: string
): Conversation | null => {
    const cached = getCachedConversations();
    if (!cached) return null;
    return cached.find((c) => c.id === conversationId) || null;
};

/**
 * Get a conversation by order ID from cache
 */
export const getCachedConversationByOrderId = (
    orderId: string
): Conversation | null => {
    const cached = getCachedConversations();
    if (!cached) return null;
    return cached.find((c) => c.order_id === orderId) || null;
};

/**
 * Fetch conversations with caching and deduplication
 * @param fetchFn - The actual API fetch function
 * @param forceRefresh - Force a fresh fetch ignoring cache
 */
export const fetchConversationsWithCache = async (
    fetchFn: () => Promise<Conversation[]>,
    forceRefresh = false
): Promise<Conversation[]> => {
    // Return valid cached data if not forcing refresh
    if (!forceRefresh && isCacheValid() && !isCacheStale()) {
        console.log("[ConversationsCache] Returning fresh cached data");
        return conversationsCache!.data;
    }

    // If we have cached data and shouldn't refetch yet, return stale data
    if (conversationsCache && shouldSkipRefetch() && !forceRefresh) {
        console.log("[ConversationsCache] Returning stale data (rate limit protection)");
        return conversationsCache.data;
    }

    // Request deduplication - reuse pending request if one exists
    if (pendingRequest) {
        console.log("[ConversationsCache] Reusing pending request");
        return pendingRequest;
    }

    // If we have stale but valid data, return it and refresh in background
    if (conversationsCache && !forceRefresh) {
        console.log("[ConversationsCache] Stale-while-revalidate: returning stale data");

        // Background refresh (fire and forget)
        pendingRequest = fetchFn()
            .then((data) => {
                updateCache(data);
                console.log("[ConversationsCache] Background refresh completed");
                return data;
            })
            .catch((err) => {
                console.error("[ConversationsCache] Background refresh failed:", err);
                return conversationsCache!.data;
            })
            .finally(() => {
                pendingRequest = null;
            });

        return conversationsCache.data;
    }

    // No cached data - must wait for fetch
    console.log("[ConversationsCache] Fetching fresh data");
    pendingRequest = fetchFn()
        .then((data) => {
            updateCache(data);
            return data;
        })
        .finally(() => {
            pendingRequest = null;
        });

    return pendingRequest;
};

// ===== Cache Management =====

/**
 * Invalidate the cache (e.g., after creating a new conversation)
 */
export const invalidateConversationsCache = (): void => {
    conversationsCache = null;
    console.log("[ConversationsCache] Cache invalidated");
};

/**
 * Add a conversation to the cache (optimistic update)
 */
export const addConversationToCache = (conversation: Conversation): void => {
    if (!conversationsCache) return;

    const exists = conversationsCache.data.some((c) => c.id === conversation.id);
    if (!exists) {
        updateCache([conversation, ...conversationsCache.data]);
        console.log("[ConversationsCache] Added new conversation to cache");
    }
};

/**
 * Update a conversation in the cache
 */
export const updateConversationInCache = (
    conversationId: string,
    updates: Partial<Conversation>
): void => {
    if (!conversationsCache) return;

    const updated = conversationsCache.data.map((c) =>
        c.id === conversationId ? { ...c, ...updates } : c
    );
    updateCache(updated);
};

// ===== Subscriptions =====

/**
 * Subscribe to cache updates
 * Returns unsubscribe function
 */
export const subscribeToConversations = (
    listener: CacheListener
): (() => void) => {
    listeners.add(listener);

    // Immediately call with current cache if available
    if (conversationsCache) {
        listener(conversationsCache.data);
    }

    return () => {
        listeners.delete(listener);
    };
};

// ===== Cache Status =====

/**
 * Get cache status for debugging
 */
export const getCacheStatus = (): {
    hasCachedData: boolean;
    isValid: boolean;
    isStale: boolean;
    age: number | null;
    listenerCount: number;
} => {
    const age = conversationsCache
        ? Date.now() - conversationsCache.timestamp
        : null;

    return {
        hasCachedData: !!conversationsCache,
        isValid: isCacheValid(),
        isStale: isCacheStale(),
        age,
        listenerCount: listeners.size,
    };
};
