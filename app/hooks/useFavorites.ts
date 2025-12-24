"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    getAllFavorites,
    toggleFavorite as cacheToggle,
    isFavorite as cacheIsFavorite,
    subscribeToFavorites,
    getFavoritesCount,
} from "@/app/lib/favoritesCache";

/**
 * Custom hook for managing product favorites
 * Provides reactive state with optimistic updates
 */
export function useFavorites() {
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [isReady, setIsReady] = useState(false);

    // Subscribe to favorites changes
    useEffect(() => {
        // Initialize from cache
        setFavorites(getAllFavorites());
        setIsReady(true);

        // Subscribe to future changes
        const unsubscribe = subscribeToFavorites((newFavorites) => {
            setFavorites(newFavorites);
        });

        return unsubscribe;
    }, []);

    /**
     * Check if a product is favorited
     */
    const isFavorite = useCallback(
        (productId: string): boolean => {
            return favorites.has(productId);
        },
        [favorites]
    );

    /**
     * Toggle favorite status with optimistic update
     */
    const toggleFavorite = useCallback((productId: string): boolean => {
        // Optimistic update happens via subscription
        return cacheToggle(productId);
    }, []);

    /**
     * Get total favorites count
     */
    const favoritesCount = favorites.size;

    /**
     * Get all favorite IDs as array - memoized to prevent unnecessary re-renders
     */
    const favoriteIds = useMemo(() => Array.from(favorites), [favorites]);

    return {
        favorites,
        favoriteIds,
        favoritesCount,
        isFavorite,
        toggleFavorite,
        isReady,
    };
}

/**
 * Lightweight hook for single product favorite state
 * Use when you only need to check/toggle one product
 */
export function useFavoriteProduct(productId: string) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Initialize
        setIsFavorited(cacheIsFavorite(productId));

        // Subscribe to changes
        const unsubscribe = subscribeToFavorites((favorites) => {
            setIsFavorited(favorites.has(productId));
        });

        return unsubscribe;
    }, [productId]);

    const toggle = useCallback(() => {
        const newState = cacheToggle(productId);

        // Trigger animation on adding to favorites
        if (newState) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 600);
        }

        return newState;
    }, [productId]);

    return {
        isFavorited,
        toggle,
        isAnimating,
    };
}
