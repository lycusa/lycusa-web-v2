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

export function useUserProfile(userId: string | undefined | null) {
    const [profile, setProfile] = useState<UserProfile | null>(() => {
        if (userId && profileCache[userId]) return profileCache[userId];
        return null;
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setProfile(null);
            return;
        }

        // Check in-memory cache first
        if (profileCache[userId]) {
            setProfile(profileCache[userId]);
            return;
        }

        // Check localStorage cache
        const cacheKey = `user_profile_${userId}`;
        const cachedStr = localStorage.getItem(cacheKey);
        if (cachedStr) {
            try {
                const cachedData = JSON.parse(cachedStr);
                const now = Date.now();
                // Cache valid for 24 hours
                if (now - cachedData.timestamp < 24 * 60 * 60 * 1000 && cachedData.profile) {
                    setProfile(cachedData.profile);
                    profileCache[userId] = cachedData.profile; // Hydrate memory cache
                    return;
                }
            } catch (e) {
                console.warn("Invalid cache data for user", userId);
                localStorage.removeItem(cacheKey);
            }
        }

        let isMounted = true;
        setLoading(true);

        getUserProfile(userId)
            .then((data) => {
                if (isMounted) {
                    // Adapt the response to our interface
                    // API returns { success: true, message: "...", data: { ...user } }
                    const user = data.user || data.data || data;

                    if (user && (user.username || user.userId)) {
                        profileCache[userId] = user;
                        setProfile(user);
                        setError(null);

                        // Save to localStorage
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
                        setError("User not found");
                    }
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error("Error fetching user profile:", err);
                    setError("Failed to load profile");
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
    }, [userId]);

    return { profile, loading, error };
}
