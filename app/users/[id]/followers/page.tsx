"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getUserFollowers, getUserProfile } from "@/app/lib/api";
import { useAuth } from "@/app/components/auth/AuthGuard";
import { AppBackground, Header } from "@/app/components/layout";
import { UserCard } from "@/app/components/users";
import type { UserProfile, RelatedUser } from "@/app/lib/types/user";

export default function FollowersPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { user: currentUser, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [followers, setFollowers] = useState<RelatedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user profile and followers in parallel
      const [profileResponse, followersResponse] = await Promise.all([
        getUserProfile(userId),
        getUserFollowers(userId),
      ]);

      if (profileResponse.success && profileResponse.data) {
        setProfile(profileResponse.data);
      }

      if (followersResponse.success && followersResponse.data) {
        setFollowers(followersResponse.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load followers");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppBackground>
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-tyrian-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading followers...</p>
          </div>
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href={isOwnProfile ? "/profile" : `/users/${userId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to {isOwnProfile ? "Profile" : profile?.username || "Profile"}
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              {profile?.avatarUrl && (
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Followers</h1>
                {profile && (
                  <p className="text-gray-600">
                    {isOwnProfile
                      ? "People who follow you"
                      : `People who follow ${profile.username}`}
                  </p>
                )}
              </div>
            </div>

            {/* Count Badge */}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-tyrian-50 rounded-lg">
              <svg
                className="w-5 h-5 text-tyrian-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="text-tyrian-700 font-semibold">
                {followers.length} {followers.length === 1 ? "follower" : "followers"}
              </span>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 mb-6">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <p className="text-red-900 font-medium">Error loading followers</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Followers List */}
          {followers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No followers yet
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {isOwnProfile
                  ? "Share your profile to start gaining followers. List great products and engage with the community!"
                  : "This user doesn't have any followers yet."}
              </p>
              {isOwnProfile && (
                <Link
                  href="/products/new"
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-tyrian-800 text-white rounded-xl hover:bg-tyrian-900 transition-all font-medium"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  List Your First Product
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {followers.map((follower) => (
                <UserCard
                  key={follower.id}
                  user={follower}
                  showFollowButton={isAuthenticated}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Navigation */}
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href={`/users/${userId}/following`}
            className="text-gray-600 hover:text-tyrian-600 transition-colors text-sm font-medium"
          >
            View Following
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href={isOwnProfile ? "/profile" : `/users/${userId}`}
            className="text-gray-600 hover:text-tyrian-600 transition-colors text-sm font-medium"
          >
            View Profile
          </Link>
        </div>
      </main>
    </AppBackground>
  );
}
