/**
 * Favorites Cache
 * LocalStorage-based persistence for product favorites
 * Implements optimistic updates and subscription pattern for real-time UI sync
 * Scoped per user to prevent favorites leaking between accounts
 */

import { getUserFromToken } from "./auth";

// ===== Configuration =====

const STORAGE_KEY_PREFIX = "lycusa_favorites";
const LEGACY_STORAGE_KEY = "lycusa_favorites"; // For migration

// ===== Types =====

type FavoritesListener = (favorites: Set<string>) => void;

// ===== Cache State =====

let favoritesSet: Set<string> = new Set();
let isInitialized = false;
let currentUserId: string | null = null;
const listeners: Set<FavoritesListener> = new Set();

// ===== User Management =====

/**
 * Get current user ID from JWT token
 * Returns null if user is not authenticated
 */
const getCurrentUserId = (): string | null => {
    const user = getUserFromToken();
    // Use user ID or sub claim from JWT
    return user?.id || user?.sub || null;
};

/**
 * Get storage key for current user
 * Falls back to guest key if user is not authenticated
 */
const getStorageKey = (): string => {
    const userId = getCurrentUserId();
    return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : `${STORAGE_KEY_PREFIX}_guest`;
};

/**
 * Migrate legacy favorites to current user
 * This runs once per user to migrate old non-scoped favorites
 */
const migrateLegacyFavorites = (): void => {
    try {
        const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (!legacyData) return;

        const currentKey = getStorageKey();
        // Only migrate if:
        // 1. Legacy data exists
        // 2. Current user has no favorites yet
        // 3. Current key is different from legacy key (user-scoped)
        if (currentKey !== LEGACY_STORAGE_KEY && !localStorage.getItem(currentKey)) {
            localStorage.setItem(currentKey, legacyData);
            console.log("[FavoritesCache] Migrated legacy favorites to user-scoped storage");
        }

        // Remove legacy key after successful migration
        localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (err) {
        console.warn("[FavoritesCache] Failed to migrate legacy favorites:", err);
    }
};

// ===== Initialization =====

/**
 * Initialize favorites from localStorage
 * Call this early in app lifecycle
 */
const initializeFromStorage = (): void => {
    const userId = getCurrentUserId();

    // If user changed, force re-initialization
    if (isInitialized && currentUserId === userId) return;

    // Update current user
    currentUserId = userId;

    try {
        // Try to migrate legacy favorites first
        migrateLegacyFavorites();

        const storageKey = getStorageKey();
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                favoritesSet = new Set(parsed);
            }
        } else {
            // No favorites for this user yet
            favoritesSet = new Set();
        }
    } catch (err) {
        console.warn("[FavoritesCache] Failed to load from localStorage:", err);
        favoritesSet = new Set();
    }

    isInitialized = true;
};

/**
 * Persist favorites to localStorage
 */
const persistToStorage = (): void => {
    try {
        const arrayData = Array.from(favoritesSet);
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(arrayData));
    } catch (err) {
        console.error("[FavoritesCache] Failed to persist to localStorage:", err);
    }
};

/**
 * Notify all listeners of state change
 */
const notifyListeners = (): void => {
    listeners.forEach((listener) => {
        try {
            listener(new Set(favoritesSet));
        } catch (err) {
            console.error("[FavoritesCache] Listener error:", err);
        }
    });
};

/**
 * Reset cache and reinitialize for current user
 * Called when user logs in/out or switches accounts
 */
const resetCache = (): void => {
    isInitialized = false;
    favoritesSet = new Set();
    initializeFromStorage();
    notifyListeners();
    console.log("[FavoritesCache] Cache reset for user change");
};

// ===== Auth Change Listener =====

/**
 * Listen for auth changes and reset cache when user changes
 * This ensures favorites are switched when user logs in/out
 */
if (typeof window !== "undefined") {
    window.addEventListener("auth-change", () => {
        resetCache();
    });
}

// ===== Core Functions =====

/**
 * Check if a product is in favorites
 */
export const isFavorite = (productId: string): boolean => {
    if (typeof window === "undefined") return false;
    initializeFromStorage();
    return favoritesSet.has(productId);
};

/**
 * Add a product to favorites
 */
export const addFavorite = (productId: string): void => {
    if (typeof window === "undefined") return;
    initializeFromStorage();

    if (!favoritesSet.has(productId)) {
        favoritesSet.add(productId);
        persistToStorage();
        notifyListeners();
        console.log("[FavoritesCache] Added to favorites:", productId);
    }
};

/**
 * Remove a product from favorites
 */
export const removeFavorite = (productId: string): void => {
    if (typeof window === "undefined") return;
    initializeFromStorage();

    if (favoritesSet.has(productId)) {
        favoritesSet.delete(productId);
        persistToStorage();
        notifyListeners();
        console.log("[FavoritesCache] Removed from favorites:", productId);
    }
};

/**
 * Toggle a product's favorite status
 * Returns the new favorite state
 */
export const toggleFavorite = (productId: string): boolean => {
    if (typeof window === "undefined") return false;
    initializeFromStorage();

    if (favoritesSet.has(productId)) {
        favoritesSet.delete(productId);
        persistToStorage();
        notifyListeners();
        console.log("[FavoritesCache] Toggled OFF:", productId);
        return false;
    } else {
        favoritesSet.add(productId);
        persistToStorage();
        notifyListeners();
        console.log("[FavoritesCache] Toggled ON:", productId);
        return true;
    }
};

/**
 * Get all favorite product IDs
 */
export const getAllFavorites = (): Set<string> => {
    if (typeof window === "undefined") return new Set();
    initializeFromStorage();
    return new Set(favoritesSet);
};

/**
 * Get favorites count
 */
export const getFavoritesCount = (): number => {
    if (typeof window === "undefined") return 0;
    initializeFromStorage();
    return favoritesSet.size;
};

/**
 * Clear all favorites
 */
export const clearAllFavorites = (): void => {
    if (typeof window === "undefined") return;
    favoritesSet.clear();
    persistToStorage();
    notifyListeners();
    console.log("[FavoritesCache] Cleared all favorites");
};

// ===== Subscriptions =====

/**
 * Subscribe to favorites changes
 * Returns unsubscribe function
 */
export const subscribeToFavorites = (
    listener: FavoritesListener
): (() => void) => {
    listeners.add(listener);

    // Immediately call with current state
    if (typeof window !== "undefined") {
        initializeFromStorage();
        listener(new Set(favoritesSet));
    }

    return () => {
        listeners.delete(listener);
    };
};

// ===== Debug Utilities =====

/**
 * Get cache status for debugging
 */
export const getFavoritesCacheStatus = (): {
    isInitialized: boolean;
    count: number;
    listenerCount: number;
    favorites: string[];
} => {
    return {
        isInitialized,
        count: favoritesSet.size,
        listenerCount: listeners.size,
        favorites: Array.from(favoritesSet),
    };
};
