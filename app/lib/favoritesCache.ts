/**
 * Favorites Cache
 * LocalStorage-based persistence for product favorites
 * Implements optimistic updates and subscription pattern for real-time UI sync
 */

// ===== Configuration =====

const STORAGE_KEY = "lycusa_favorites";

// ===== Types =====

type FavoritesListener = (favorites: Set<string>) => void;

// ===== Cache State =====

let favoritesSet: Set<string> = new Set();
let isInitialized = false;
const listeners: Set<FavoritesListener> = new Set();

// ===== Initialization =====

/**
 * Initialize favorites from localStorage
 * Call this early in app lifecycle
 */
const initializeFromStorage = (): void => {
    if (isInitialized) return;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                favoritesSet = new Set(parsed);
            }
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arrayData));
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
