"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/auth/AuthGuard";
import {
  getUserProfile,
  getUserKycStatus,
  getUserByEmail,
  getUserByAddress,
  getUserFollowers,
  getUserFollowing,
  searchProducts,
} from "@/app/lib/api";
import { AppBackground, Header } from "@/app/components/layout";
import type { UserProfile, UserStats } from "@/app/lib/types/user";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    followersCount: 0,
    followingCount: 0,
    productsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [kycStatus, setKycStatus] = useState<boolean | null>(null);
  const [kycLoading, setKycLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/signin");
      return;
    }

    if (user?.id) {
      loadAllData();
    }
  }, [user, authLoading, isAuthenticated]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load profile
      const profileResponse = await getUserProfile(user!.id);
      if (profileResponse.success && profileResponse.data) {
        setProfile(profileResponse.data);
      } else {
        setShowCreateProfile(true);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setShowCreateProfile(true);
        setLoading(false);
        return;
      }
      setError(err.response?.data?.message || "Failed to load profile");
      setLoading(false);
      return;
    }

    // Load stats in parallel
    try {
      const [followersRes, followingRes, productsRes, kycRes] =
        await Promise.allSettled([
          getUserFollowers(user!.id),
          getUserFollowing(user!.id),
          searchProducts({ query: "", seller_id: user!.id, page: 1, size: 1 }),
          loadKycStatus(),
        ]);

      const newStats: UserStats = {
        followersCount: 0,
        followingCount: 0,
        productsCount: 0,
      };

      if (
        followersRes.status === "fulfilled" &&
        followersRes.value.success &&
        followersRes.value.data
      ) {
        newStats.followersCount = Array.isArray(followersRes.value.data)
          ? followersRes.value.data.length
          : 0;
      }

      if (
        followingRes.status === "fulfilled" &&
        followingRes.value.success &&
        followingRes.value.data
      ) {
        newStats.followingCount = Array.isArray(followingRes.value.data)
          ? followingRes.value.data.length
          : 0;
      }

      if (productsRes.status === "fulfilled" && productsRes.value.total) {
        newStats.productsCount = productsRes.value.total;
      }

      setStats(newStats);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }

    setLoading(false);
  };

  const loadKycStatus = async () => {
    try {
      setKycLoading(true);

      // Try to get full user data which includes kycStatus
      let userData = null;
      if (user!.email) {
        const response = await getUserByEmail(user!.email);
        if (response.success && response.data) {
          userData = response.data;
        }
      } else if (user!.walletAddress) {
        const response = await getUserByAddress(user!.walletAddress);
        if (response.success && response.data) {
          userData = response.data;
        }
      }

      const kycStatusValue = userData?.kycStatus ?? userData?.kyc_status;

      if (
        userData &&
        kycStatusValue !== undefined &&
        kycStatusValue !== null
      ) {
        const booleanStatus =
          kycStatusValue === "true" || kycStatusValue === true;
        setKycStatus(booleanStatus);
      } else {
        const response = await getUserKycStatus(user!.id);
        if (response.success && response.data) {
          setKycStatus(response.data.kycStatus);
        }
      }
    } catch (err) {
      console.error("Failed to load KYC status:", err);
      setKycStatus(false);
    } finally {
      setKycLoading(false);
    }
  };

  if (authLoading || loading) {
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

  if (showCreateProfile) {
    return (
      <AppBackground>
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-tyrian-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-tyrian-600"
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
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Create Your Profile
            </h1>
            <p className="text-gray-600 mb-8">
              You haven't set up your profile yet. Let's get started!
            </p>

            <Link
              href="/profile/edit"
              className="inline-block px-8 py-4 bg-gradient-to-r from-tyrian-800 to-tyrian-600 text-white rounded-xl hover:from-tyrian-900 hover:to-tyrian-700 transition-all font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Create Profile
            </Link>
          </div>
        </div>
      </AppBackground>
    );
  }

  if (error) {
    return (
      <AppBackground>
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 max-w-md mx-4 text-center">
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadAllData}
              className="px-6 py-2 bg-tyrian-800 text-white rounded-xl hover:bg-tyrian-900 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </AppBackground>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <AppBackground>
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          {/* Cover */}
          <div className="h-48 bg-gradient-to-r from-tyrian-800 via-tyrian-600 to-neutral-600 relative">
            {/* Edit Profile Button - positioned on cover */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Link
                href="/settings"
                className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-all font-medium text-sm flex items-center gap-2"
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Settings
              </Link>
              <Link
                href="/profile/edit"
                className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-all font-medium text-sm flex items-center gap-2"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Profile
              </Link>
            </div>
          </div>

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

            {/* Username and Bio */}
            <div className="pt-24">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {profile.username}
                  </h1>
                  <p className="text-gray-600">
                    {user?.email ||
                      `${user?.walletAddress?.slice(0, 10)}...${user?.walletAddress?.slice(-8)}`}
                  </p>
                </div>
              </div>

              {profile.bio && (
                <p className="text-gray-700 mb-6 leading-relaxed max-w-2xl">
                  {profile.bio}
                </p>
              )}

              {/* KYC Status Badge */}
              <div className="mb-6">
                {kycLoading ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-600">
                      Loading KYC status...
                    </span>
                  </div>
                ) : kycStatus ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-green-700">
                      KYC Verified
                    </span>
                  </div>
                ) : (
                  <Link
                    href="/kyc"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors group"
                  >
                    <svg
                      className="w-5 h-5 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-yellow-700">
                      KYC Not Verified
                    </span>
                    <span className="text-sm text-yellow-600 group-hover:text-yellow-700">
                      - Click to verify
                    </span>
                  </Link>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-6 border-t border-gray-200">
                <Link
                  href={`/users/${user?.id}/followers`}
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
                  href={`/users/${user?.id}/following`}
                  className="group cursor-pointer text-center"
                >
                  <div className="text-2xl font-bold text-gray-900 group-hover:text-tyrian-600 transition-colors">
                    {stats.followingCount}
                  </div>
                  <div className="text-sm text-gray-600 group-hover:text-tyrian-600 transition-colors">
                    Following
                  </div>
                </Link>

                <Link
                  href="/my-products"
                  className="group cursor-pointer text-center"
                >
                  <div className="text-2xl font-bold text-gray-900 group-hover:text-tyrian-600 transition-colors">
                    {stats.productsCount}
                  </div>
                  <div className="text-sm text-gray-600 group-hover:text-tyrian-600 transition-colors">
                    Products
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/my-products"
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-tyrian-100 rounded-xl flex items-center justify-center group-hover:bg-tyrian-200 transition-colors">
                <svg
                  className="w-6 h-6 text-tyrian-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">My Products</h3>
                <p className="text-sm text-gray-600">
                  Manage your listings
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/orders"
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Orders</h3>
                <p className="text-sm text-gray-600">View your orders</p>
              </div>
            </div>
          </Link>

          <Link
            href="/messages"
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Messages</h3>
                <p className="text-sm text-gray-600">Chat with users</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Profile Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Profile Details
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-zinc-600"
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
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">Username</div>
                <div className="text-gray-900 font-medium">
                  {profile.username}
                </div>
              </div>
            </div>

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

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">KYC Status</div>
                {kycLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Loading...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {kycStatus ? (
                      <>
                        <span className="text-gray-900 font-medium">
                          Verified
                        </span>
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-900 font-medium">
                          Not Verified
                        </span>
                        <Link
                          href="/kyc"
                          className="text-tyrian-600 hover:text-tyrian-700 text-sm underline"
                        >
                          Verify Now
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {user?.email && (
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">Email</div>
                  <div className="text-gray-900 font-medium">{user.email}</div>
                </div>
              </div>
            )}

            {user?.walletAddress && (
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">
                    Wallet Address
                  </div>
                  <div className="text-gray-900 font-medium font-mono text-sm">
                    {user.walletAddress}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </AppBackground>
  );
}
