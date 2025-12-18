"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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

interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  media_ids?: string[];
  thumbnail_url?: string;
  status: string;
}

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (userId && !authLoading) {
      // Redirect to own profile page if viewing own profile
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

      // Load profile first
      const profileResponse = await getUserProfile(userId);
      if (profileResponse.success && profileResponse.data) {
        setProfile(profileResponse.data);
      } else {
        setError("User profile not found");
        setLoading(false);
        return;
      }

      // Load stats and relationship in parallel
      const promises: Promise<any>[] = [
        getUserFollowers(userId),
        getUserFollowing(userId),
        searchProducts({ query: "", seller_id: userId, page: 1, size: 6 }),
      ];

      // Only check relationship if authenticated
      if (isAuthenticated && !isOwnProfile) {
        promises.push(checkUserRelationship(userId));
      }

      const results = await Promise.allSettled(promises);

      const newStats: UserStats = {
        followersCount: 0,
        followingCount: 0,
        productsCount: 0,
      };

      // Parse followers
      if (
        results[0].status === "fulfilled" &&
        results[0].value.success &&
        results[0].value.data
      ) {
        newStats.followersCount = Array.isArray(results[0].value.data)
          ? results[0].value.data.length
          : 0;
      }

      // Parse following
      if (
        results[1].status === "fulfilled" &&
        results[1].value.success &&
        results[1].value.data
      ) {
        newStats.followingCount = Array.isArray(results[1].value.data)
          ? results[1].value.data.length
          : 0;
      }

      // Parse products
      if (results[2].status === "fulfilled") {
        const productsData = results[2].value;
        if (productsData.total) {
          newStats.productsCount = productsData.total;
        }
        if (productsData.products && Array.isArray(productsData.products)) {
          setProducts(productsData.products.slice(0, 6));
        }
      }

      // Parse relationship
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
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
              className="inline-block px-6 py-2 bg-tyrian-800 text-white rounded-lg hover:bg-tyrian-900 transition-colors"
            >
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
          {/* Backdrop */}
          <div className="absolute inset-0 bg-gradient-to-br from-tyrian-900/60 via-black/50 to-gray-900/60 backdrop-blur-md" />

          {/* Modal */}
          <div
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-tyrian-800 via-tyrian-700 to-tyrian-600 px-6 py-8 text-center">
              {/* User Avatar with block overlay */}
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="w-20 h-20 rounded-full border-4 border-white/30 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden shadow-lg">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.username}
                      className="w-full h-full object-cover opacity-70"
                    />
                  ) : (
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  )}
                </div>
                {/* Block icon overlay */}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                  <svg
                    className="w-5 h-5 text-tyrian-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">
                Block {profile.username}?
              </h3>
              <p className="text-tyrian-100 text-sm">
                This action can be undone later in settings
              </p>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-tyrian-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-tyrian-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Hidden from view</p>
                    <p className="text-xs text-gray-500">They won't see your profile or products</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-tyrian-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-tyrian-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">No messages</p>
                    <p className="text-xs text-gray-500">They can't send you messages anymore</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-tyrian-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-tyrian-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
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
                  className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold hover:shadow-md"
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          {/* Cover */}
          <div className="h-48 bg-gradient-to-r from-tyrian-800 via-tyrian-600 to-purple-600"></div>

          {/* Profile Info */}
          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="absolute -top-20 left-8">
              <div className="w-40 h-40 rounded-full border-8 border-white bg-gradient-to-br from-gray-200 to-gray-300 shadow-2xl flex items-center justify-center overflow-hidden">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-20 h-20 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Username and Actions */}
            <div className="pt-24">
              <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {profile.username}
                  </h1>
                  {relationship?.isFollowedBy && (
                    <span className="inline-block px-3 py-1 bg-tyrian-50 text-tyrian-700 text-sm rounded-full font-medium">
                      Follows you
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                {isAuthenticated && !isOwnProfile && (
                  <div className="flex gap-3">
                    {relationship?.isBlocking ? (
                      <button
                        onClick={handleUnblock}
                        disabled={actionLoading}
                        className="px-6 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all font-medium disabled:opacity-50 flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                          />
                        </svg>
                        {actionLoading ? "Unblocking..." : "Unblock"}
                      </button>
                    ) : relationship?.isBlockedBy ? (
                      <div className="px-6 py-2 bg-gray-100 text-gray-500 rounded-xl font-medium">
                        You've been blocked
                      </div>
                    ) : (
                      <>
                        {relationship?.isFollowing ? (
                          <button
                            onClick={handleUnfollow}
                            disabled={actionLoading}
                            className="px-6 py-2 bg-gray-200 text-gray-900 rounded-xl hover:bg-gray-300 transition-all font-medium disabled:opacity-50 flex items-center gap-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {actionLoading ? "..." : "Following"}
                          </button>
                        ) : (
                          <button
                            onClick={handleFollow}
                            disabled={actionLoading}
                            className="px-6 py-2 bg-gradient-to-r from-tyrian-800 to-tyrian-600 text-white rounded-xl hover:from-tyrian-900 hover:to-tyrian-700 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50"
                          >
                            {actionLoading ? "..." : "Follow"}
                          </button>
                        )}

                        <button
                          onClick={() => setShowBlockConfirm(true)}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-white border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all font-medium disabled:opacity-50"
                          title="Block user"
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
                              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                )}

                {!isAuthenticated && (
                  <Link
                    href="/signin"
                    className="px-6 py-2 bg-gradient-to-r from-tyrian-800 to-tyrian-600 text-white rounded-xl hover:from-tyrian-900 hover:to-tyrian-700 transition-all font-medium shadow-md hover:shadow-lg"
                  >
                    Sign in to Follow
                  </Link>
                )}
              </div>

              {profile.bio && (
                <p className="text-gray-700 mb-6 leading-relaxed max-w-2xl">
                  {profile.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex gap-8 pt-6 border-t border-gray-200">
                <Link
                  href={`/users/${userId}/followers`}
                  className="group cursor-pointer text-center"
                >
                  <div className="text-2xl font-bold text-gray-900 group-hover:text-tyrian-600 transition-colors">
                    {stats.followersCount}
                  </div>
                  <div className="text-sm text-gray-600 group-hover:text-tyrian-600 transition-colors">
                    Followers
                  </div>
                </Link>

                <Link
                  href={`/users/${userId}/following`}
                  className="group cursor-pointer text-center"
                >
                  <div className="text-2xl font-bold text-gray-900 group-hover:text-tyrian-600 transition-colors">
                    {stats.followingCount}
                  </div>
                  <div className="text-sm text-gray-600 group-hover:text-tyrian-600 transition-colors">
                    Following
                  </div>
                </Link>

                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.productsCount ?? 0}
                  </div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        {products.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Products</h2>
              {(stats.productsCount ?? 0) > 6 && (
                <Link
                  href={`/products?seller=${userId}`}
                  className="text-tyrian-600 hover:text-tyrian-700 text-sm font-medium flex items-center gap-1"
                >
                  View all {stats.productsCount ?? 0}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group"
                >
                  <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square mb-2 relative">
                    {product.thumbnail_url ? (
                      <img
                        src={product.thumbnail_url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    {product.status !== "active" && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {product.status === "sold" ? "Sold" : "Unavailable"}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 truncate group-hover:text-tyrian-600 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-tyrian-600 font-semibold">
                    {product.currency} {product.price.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* About Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">About</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">Member Since</div>
                <div className="text-gray-900 font-medium">
                  {new Date(profile.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            {profile.bio && (
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">Bio</div>
                  <div className="text-gray-900">{profile.bio}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </AppBackground>
  );
}
