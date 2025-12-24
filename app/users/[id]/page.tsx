"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/auth/AuthGuard";
import {
  getUserProfile,
  checkUserRelationship,
  followUser,
  unfollowUser,
  blockUser,
  unblockUser,
  getUserFollowers,
  getUserFollowing,
  searchProducts,
} from "@/app/lib/api";
import { AppBackground, Header } from "@/app/components/layout";
import type {
  UserProfile,
  RelationshipStatus,
  UserStats,
} from "@/app/lib/types/user";
import ProductsSection from "@/app/components/products/ProductsSection";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    followersCount: 0,
    followingCount: 0,
    productsCount: 0,
  });
  const [relationship, setRelationship] = useState<RelationshipStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (userId && !authLoading) {
      if (isOwnProfile) {
        router.push("/profile");
        return;
      }
      loadUserData();
    }
  }, [userId, user, authLoading, isOwnProfile]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const profileResponse = await getUserProfile(userId);
      if (profileResponse.success && profileResponse.data) {
        setProfile(profileResponse.data);
      } else {
        setError("User profile not found");
        setLoading(false);
        return;
      }

      const promises: Promise<any>[] = [
        getUserFollowers(userId),
        getUserFollowing(userId),
        searchProducts({ query: "*", seller_id: userId, page: 1, size: 1 }),
      ];

      if (isAuthenticated && !isOwnProfile) {
        promises.push(checkUserRelationship(userId));
      }

      const results = await Promise.allSettled(promises);

      const newStats: UserStats = {
        followersCount: 0,
        followingCount: 0,
        productsCount: 0,
      };

      if (
        results[0].status === "fulfilled" &&
        results[0].value.success &&
        results[0].value.data
      ) {
        newStats.followersCount = Array.isArray(results[0].value.data)
          ? results[0].value.data.length
          : 0;
      }

      if (
        results[1].status === "fulfilled" &&
        results[1].value.success &&
        results[1].value.data
      ) {
        newStats.followingCount = Array.isArray(results[1].value.data)
          ? results[1].value.data.length
          : 0;
      }

      if (results[2].status === "fulfilled") {
        const searchResult = results[2].value;
        if (searchResult.total_results) {
          newStats.productsCount = searchResult.total_results;
        }
      }

      if (
        isAuthenticated &&
        !isOwnProfile &&
        results[3]?.status === "fulfilled" &&
        results[3].value.success &&
        results[3].value.data
      ) {
        setRelationship(results[3].value.data);
      }

      setStats(newStats);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }

    try {
      setActionLoading(true);
      const response = await followUser(userId);

      if (response.success) {
        setRelationship((prev) => ({
          ...prev!,
          isFollowing: true,
        }));
        setStats((prev) => ({
          ...prev,
          followersCount: prev.followersCount + 1,
        }));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to follow user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfollow = async () => {
    try {
      setActionLoading(true);
      const response = await unfollowUser(userId);

      if (response.success) {
        setRelationship((prev) => ({
          ...prev!,
          isFollowing: false,
        }));
        setStats((prev) => ({
          ...prev,
          followersCount: Math.max(0, prev.followersCount - 1),
        }));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to unfollow user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async () => {
    try {
      setActionLoading(true);
      const response = await blockUser(userId);

      if (response.success) {
        setRelationship((prev) => ({
          ...prev!,
          isBlocking: true,
          isFollowing: false,
        }));
        setShowBlockConfirm(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to block user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblock = async () => {
    try {
      setActionLoading(true);
      const response = await unblockUser(userId);

      if (response.success) {
        setRelationship((prev) => ({
          ...prev!,
          isBlocking: false,
        }));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to unblock user");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <AppBackground>
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-tyrian-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </AppBackground>
    );
  }

  if (error || !profile) {
    return (
      <AppBackground>
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="glass-frosted rounded-3xl p-8 max-w-md mx-4 text-center border border-white/20">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Profile Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "This user does not exist"}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-tyrian-800 text-white rounded-xl hover:bg-tyrian-900 transition-all font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Home
            </Link>
          </div>
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <Header />

      {/* Block Confirmation Modal */}
      {showBlockConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowBlockConfirm(false)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-tyrian-900/60 via-black/50 to-gray-900/60 backdrop-blur-md" />

          <div
            className="relative glass-frosted rounded-3xl max-w-md w-full overflow-hidden border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-tyrian-800 via-tyrian-700 to-tyrian-600 px-6 py-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="w-20 h-20 rounded-2xl border-4 border-white/30 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden shadow-lg rotate-3">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.username}
                      className="w-full h-full object-cover opacity-70"
                    />
                  ) : (
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-tyrian-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
              </div>

              <h3 className="relative text-xl font-bold text-white mb-1">
                Block {profile.username}?
              </h3>
              <p className="relative text-tyrian-100 text-sm">
                This action can be undone later
              </p>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="w-9 h-9 bg-tyrian-100 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-tyrian-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Hidden from view</p>
                    <p className="text-xs text-gray-500">They won't see your profile or products</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="w-9 h-9 bg-tyrian-100 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-tyrian-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">No messages</p>
                    <p className="text-xs text-gray-500">They can't send you messages anymore</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="w-9 h-9 bg-tyrian-100 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-tyrian-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Unfollowed</p>
                    <p className="text-xs text-gray-500">Removes mutual follows automatically</p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBlockConfirm(false)}
                  className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlock}
                  disabled={actionLoading}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-tyrian-800 to-tyrian-600 text-white rounded-xl hover:from-tyrian-900 hover:to-tyrian-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Blocking...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Block User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 mb-8">

          {/* Main Profile Card - Spans 8 columns */}
          <div className="md:col-span-8 glass-frosted rounded-3xl overflow-hidden border border-white/20 group">
            {/* Cover with Gradient */}
            <div className="h-32 sm:h-40 bg-gradient-to-br from-tyrian-800 via-tyrian-600 to-purple-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
            </div>

            {/* Profile Content */}
            <div className="relative px-6 sm:px-8 pb-6 sm:pb-8">
              {/* Avatar */}
              <div className="absolute -top-16 sm:-top-20 left-6 sm:left-8">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-white bg-gradient-to-br from-gray-100 to-gray-200 shadow-xl flex items-center justify-center overflow-hidden rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-14 h-14 sm:w-16 sm:h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="pt-16 sm:pt-20">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                        {profile.username}
                      </h1>
                      {relationship?.isFollowedBy && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-tyrian-50 border border-tyrian-100 text-tyrian-700 text-xs rounded-full font-medium">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Follows you
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 shrink-0">
                    {isAuthenticated && !isOwnProfile && (
                      <>
                        {relationship?.isBlocking ? (
                          <button
                            onClick={handleUnblock}
                            disabled={actionLoading}
                            className="px-5 py-2.5 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all font-medium disabled:opacity-50 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            {actionLoading ? "..." : "Unblock"}
                          </button>
                        ) : relationship?.isBlockedBy ? (
                          <div className="px-5 py-2.5 bg-gray-100 text-gray-500 rounded-xl font-medium">
                            You've been blocked
                          </div>
                        ) : (
                          <>
                            {relationship?.isFollowing ? (
                              <button
                                onClick={handleUnfollow}
                                disabled={actionLoading}
                                className="px-5 py-2.5 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all font-medium disabled:opacity-50 flex items-center gap-2 group"
                              >
                                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="group-hover:hidden">{actionLoading ? "..." : "Following"}</span>
                                <span className="hidden group-hover:inline text-red-600">Unfollow</span>
                              </button>
                            ) : (
                              <button
                                onClick={handleFollow}
                                disabled={actionLoading}
                                className="px-5 py-2.5 bg-gradient-to-r from-tyrian-800 to-tyrian-600 text-white rounded-xl hover:from-tyrian-900 hover:to-tyrian-700 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                {actionLoading ? "..." : "Follow"}
                              </button>
                            )}

                            <button
                              onClick={() => setShowBlockConfirm(true)}
                              disabled={actionLoading}
                              className="p-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all disabled:opacity-50"
                              title="Block user"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            </button>
                          </>
                        )}
                      </>
                    )}

                    {!isAuthenticated && (
                      <Link
                        href="/signin"
                        className="px-5 py-2.5 bg-gradient-to-r from-tyrian-800 to-tyrian-600 text-white rounded-xl hover:from-tyrian-900 hover:to-tyrian-700 transition-all font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Sign in to Follow
                      </Link>
                    )}
                  </div>
                </div>

                {profile.bio && (
                  <p className="text-gray-600 leading-relaxed max-w-xl mb-6">
                    {profile.bio}
                  </p>
                )}

                {/* Stats Row */}
                <div className="flex items-center gap-6 sm:gap-8">
                  <Link href={`/users/${userId}/followers`} className="group">
                    <div className="text-2xl font-bold text-gray-900 group-hover:text-tyrian-600 transition-colors">
                      {stats.followersCount}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Followers</div>
                  </Link>
                  <div className="w-px h-10 bg-gray-200"></div>
                  <Link href={`/users/${userId}/following`} className="group">
                    <div className="text-2xl font-bold text-gray-900 group-hover:text-tyrian-600 transition-colors">
                      {stats.followingCount}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Following</div>
                  </Link>
                  <div className="w-px h-10 bg-gray-200"></div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.productsCount ?? 0}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Products</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Card - Spans 4 columns */}
          <div className="md:col-span-4 flex flex-col gap-4 sm:gap-6">

            {/* Member Info Card */}
            <div className="glass-frosted rounded-2xl p-5 sm:p-6 border border-white/20">
              <h3 className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-4">About</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Member since</p>
                    <p className="text-gray-900 font-semibold">
                      {new Date(profile.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {profile.bio && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Bio</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{profile.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="glass-frosted rounded-2xl p-5 sm:p-6 border border-white/20">
              <h3 className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-4">Activity</h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-10 h-10 bg-tyrian-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-tyrian-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{stats.productsCount ?? 0}</p>
                  <p className="text-xs text-gray-500">Products</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{stats.followersCount}</p>
                  <p className="text-xs text-gray-500">Followers</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{stats.followingCount}</p>
                  <p className="text-xs text-gray-500">Following</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="glass-frosted rounded-3xl p-6 sm:p-8 border border-white/20">
          <ProductsSection sellerId={userId} isOwnProfile={false} />
        </div>
      </main>
    </AppBackground>
  );
}
