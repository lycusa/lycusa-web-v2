"use client";

import { useState, useEffect } from "react";
import { getUserProfile } from "@/app/lib/api";

export interface UserProfile {
    id: string;
    username: string;
    avatar_url?: string;
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

        if (profileCache[userId]) {
            setProfile(profileCache[userId]);
            return;
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
