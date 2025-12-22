"use client";

import { useState, useEffect } from "react";
import { getUserProfile } from "@/app/lib/api";

export interface UserProfile {
    id: string;
    username: string;
    avatarUrl?: string; // camelCase to match app/lib/types/user.ts
    bio?: string;
    // Add other fields as needed based on API response
}

// Simple in-memory cache to prevent redundant fetches within the same session
// Note: In a real app, use React Query or SWR
const profileCache: Record<string, UserProfile> = {};

// Helper to manually update cache (e.g. after profile edit)
export function updateProfileCache(userId: string, newProfile: UserProfile) {
    // Update memory cache
    profileCache[userId] = newProfile;

    // Update localStorage
    try {
        const cacheKey = `user_profile_${userId}`;
        localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            profile: newProfile
        }));
    } catch (e) {
        console.warn("Failed to update profile cache", e);
    }
}

export function useUserProfile(userId: string | undefined | null) {
    const [profile, setProfile] = useState<UserProfile | null>(() => {
        if (!userId) return null;
        // Check in-memory first
        if (profileCache[userId]) return profileCache[userId];
        return null;
    });

    // Initialize from localStorage if not in memory
    useEffect(() => {
        if (!userId || profile) return; // Already have profile from memory or no user

        const cacheKey = `user_profile_${userId}`;
        const cachedStr = localStorage.getItem(cacheKey);
        if (cachedStr) {
            try {
                const cachedData = JSON.parse(cachedStr);
                // Use cached data immediately regardless of age (Stale-While-Revalidate)
                if (cachedData.profile) {
                    setProfile(cachedData.profile);
                    profileCache[userId] = cachedData.profile;
                }
            } catch (e) {
                // Ignore invalid cache
            }
        }
    }, [userId, profile]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setProfile(null);
            return;
        }

        // Stale-While-Revalidate: fetch in background even if we have data
        let isMounted = true;

        // Only set loading true if we don't have any data yet
        if (!profile) {
            setLoading(true);
        }

        getUserProfile(userId)
            .then((data) => {
                if (isMounted) {
                    // Adapt the response to our interface
                    const user = data.user || data.data || data;

                    if (user && (user.username || user.userId)) {
                        // Update caches
                        profileCache[userId] = user;
                        setProfile(user);
                        setError(null);

                        const cacheKey = `user_profile_${userId}`;
                        try {
                            localStorage.setItem(cacheKey, JSON.stringify({
                                timestamp: Date.now(),
                                profile: user
                            }));
                        } catch (e) {
                            console.warn("Failed to save profile to localStorage", e);
                        }
                    } else {
                        // Fallback/Handle error gracefully
                        console.warn(`Could not find profile for user ${userId}`);
                        if (!profile) setError("User not found");
                    }
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error("Error fetching user profile:", err);
                    if (!profile) setError("Failed to load profile");
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [userId]); // Intentionally removed profile from dependency

    return { profile, loading, error };
}
