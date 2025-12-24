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
import ProductsSection from "@/app/components/products/ProductsSection";

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

    try {
      const [followersRes, followingRes, productsRes, kycRes] =
        await Promise.allSettled([
          getUserFollowers(user!.id),
          getUserFollowing(user!.id),
          searchProducts({ query: "*", seller_id: user!.id, page: 1, size: 1 }),
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
          <div className="glass-frosted rounded-3xl p-8 md:p-12 text-center border border-white/20">
            <div className="w-24 h-24 bg-gradient-to-br from-tyrian-100 to-tyrian-200 rounded-2xl flex items-center justify-center mx-auto mb-8 rotate-3 hover:rotate-0 transition-transform duration-500">
              <svg
                className="w-12 h-12 text-tyrian-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Create Your Profile
            </h1>
            <p className="text-gray-600 mb-10 text-lg max-w-md mx-auto">
              Set up your profile to start selling and connecting with others.
            </p>

            <Link
              href="/profile/edit"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-tyrian-800 to-tyrian-600 text-white rounded-2xl hover:from-tyrian-900 hover:to-tyrian-700 transition-all font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 group"
            >
              <span>Get Started</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadAllData}
              className="px-6 py-3 bg-tyrian-800 text-white rounded-xl hover:bg-tyrian-900 transition-all font-medium"
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 mb-8">

          {/* Main Profile Card - Spans 8 columns */}
          <div className="md:col-span-8 glass-frosted rounded-3xl overflow-hidden border border-white/20 group">
            {/* Cover with Gradient */}
            <div className="h-32 sm:h-40 bg-gradient-to-br from-tyrian-800 via-tyrian-600 to-tyrian-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Link
                  href="/settings"
                  className="p-2.5 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-all border border-white/10"
                  title="Settings"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
                <Link
                  href="/profile/edit"
                  className="px-4 py-2.5 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-all font-medium text-sm flex items-center gap-2 border border-white/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
              </div>
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
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1">
                      {profile.username}
                    </h1>
                    <p className="text-gray-500 text-sm">
                      {user?.email || `${user?.walletAddress?.slice(0, 8)}...${user?.walletAddress?.slice(-6)}`}
                    </p>
                  </div>

                  {/* KYC Badge */}
                  <div className="flex-shrink-0">
                    {kycLoading ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100/80 rounded-full">
                        <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-gray-500">Checking...</span>
                      </div>
                    ) : kycStatus ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/50 rounded-full">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-xs font-semibold text-emerald-700">Verified</span>
                      </div>
                    ) : (
                      <Link
                        href="/kyc"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200/50 rounded-full hover:bg-amber-100 transition-colors group"
                      >
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-xs font-semibold text-amber-700">Verify KYC</span>
                        <svg className="w-3 h-3 text-amber-600 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
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
                  <Link href={`/users/${user?.id}/followers`} className="group">
                    <div className="text-2xl font-bold text-gray-900 group-hover:text-tyrian-600 transition-colors">
                      {stats.followersCount}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Followers</div>
                  </Link>
                  <div className="w-px h-10 bg-gray-200"></div>
                  <Link href={`/users/${user?.id}/following`} className="group">
                    <div className="text-2xl font-bold text-gray-900 group-hover:text-tyrian-600 transition-colors">
                      {stats.followingCount}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Following</div>
                  </Link>
                  <div className="w-px h-10 bg-gray-200"></div>
                  <Link href="/my-products" className="group">
                    <div className="text-2xl font-bold text-gray-900 group-hover:text-tyrian-600 transition-colors">
                      {stats.productsCount}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Products</div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Stack - Spans 4 columns */}
          <div className="md:col-span-4 flex flex-col gap-4 sm:gap-6">

            {/* My Products Card */}
            <Link
              href="/my-products"
              className="glass-frosted rounded-2xl p-5 sm:p-6 border border-white/20 hover:border-tyrian-200/50 transition-all group hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-tyrian-100 to-tyrian-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-tyrian-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-tyrian-700 transition-colors">My Products</h3>
                  <p className="text-sm text-gray-500 truncate">Manage listings</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-tyrian-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Orders Card */}
            <Link
              href="/orders"
              className="glass-frosted rounded-2xl p-5 sm:p-6 border border-white/20 hover:border-purple-200/50 transition-all group hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Orders</h3>
                  <p className="text-sm text-gray-500 truncate">Track purchases</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Messages Card */}
            <Link
              href="/messages"
              className="glass-frosted rounded-2xl p-5 sm:p-6 border border-white/20 hover:border-blue-200/50 transition-all group hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Messages</h3>
                  <p className="text-sm text-gray-500 truncate">Chat with users</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* Profile Details Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">

          {/* Username */}
          <div className="glass-frosted rounded-2xl p-5 border border-white/20 group hover:border-gray-200/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Username</span>
            </div>
            <p className="text-gray-900 font-semibold truncate">{profile.username}</p>
          </div>

          {/* Member Since */}
          <div className="glass-frosted rounded-2xl p-5 border border-white/20 group hover:border-purple-200/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Member Since</span>
            </div>
            <p className="text-gray-900 font-semibold">
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          {/* KYC Status */}
          <div className="glass-frosted rounded-2xl p-5 border border-white/20 group hover:border-emerald-200/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">KYC Status</span>
            </div>
            {kycLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-500 text-sm">Loading...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {kycStatus ? (
                  <>
                    <span className="text-gray-900 font-semibold">Verified</span>
                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </>
                ) : (
                  <Link href="/kyc" className="text-tyrian-600 hover:text-tyrian-700 font-semibold text-sm flex items-center gap-1">
                    <span>Verify Now</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="glass-frosted rounded-2xl p-5 border border-white/20 group hover:border-blue-200/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                {user?.email ? (
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                {user?.email ? "Email" : "Wallet"}
              </span>
            </div>
            <p className="text-gray-900 font-semibold truncate text-sm">
              {user?.email || `${user?.walletAddress?.slice(0, 6)}...${user?.walletAddress?.slice(-4)}`}
            </p>
          </div>
        </div>

        {/* Products Section */}
        {user?.id && (
          <div className="glass-frosted rounded-3xl p-6 sm:p-8 border border-white/20">
            <ProductsSection sellerId={user.id} isOwnProfile={true} />
          </div>
        )}
      </main>
    </AppBackground>
  );
}
