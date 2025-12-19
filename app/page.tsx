"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "./components/auth/AuthGuard";
import LogoutButton from "./components/auth/LogoutButton";
import { useState, useEffect } from "react";
import { getUserProfile } from "./lib/api";
import { AppBackground } from "./components/layout";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const response = await getUserProfile(user.id);
          setHasProfile(response.success && response.data);
        } catch (err: any) {
          setHasProfile(false);
        } finally {
          setProfileLoading(false);
        }
      } else {
        setProfileLoading(false);
      }
    };

    checkProfile();
  }, [isAuthenticated, user]);

  return (
    <AppBackground>
      {/* Header - Glassmorphic */}
      <header className="sticky top-0 z-50 glass-card border-b border-white/20 shadow-lg backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logos/tyrian-purple-with-word.svg"
                alt="Lycusa"
                width={140}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>

            <nav className="flex items-center gap-3">
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-24 h-9 bg-gray-200 animate-pulse rounded-xl"></div>
                  <div className="w-20 h-9 bg-gray-200 animate-pulse rounded-xl"></div>
                </div>
              ) : isAuthenticated ? (
                <>
                  <Link
                    href="/my-products"
                    className="px-4 py-2 text-gray-700 hover:text-tyrian-800 transition-colors text-sm font-medium hover:bg-tyrian-50 rounded-xl"
                  >
                    My Products
                  </Link>
                  <Link
                    href="/orders"
                    className="px-4 py-2 text-gray-700 hover:text-tyrian-800 transition-colors text-sm font-medium hover:bg-tyrian-50 rounded-xl"
                  >
                    Orders
                  </Link>
                  <Link
                    href="/messages"
                    className="px-4 py-2 text-gray-700 hover:text-tyrian-800 transition-colors text-sm font-medium hover:bg-tyrian-50 rounded-xl"
                  >
                    Messages
                  </Link>
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-tyrian-50 to-gray-100 rounded-xl border border-tyrian-200/50">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
                      {user?.email ||
                        `${user?.walletAddress?.slice(0, 6)}...${user?.walletAddress?.slice(-4)}`}
                    </span>
                  </div>
                  <LogoutButton className="px-4 py-2 bg-tyrian-800 text-white rounded-xl hover:bg-tyrian-900 transition-all text-sm font-medium shadow-md hover:shadow-lg" />
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="px-4 py-2 text-gray-700 hover:text-tyrian-800 transition-colors text-sm font-medium hover:bg-tyrian-50 rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-5 py-2 bg-tyrian-800 text-white rounded-xl hover:bg-tyrian-900 transition-all text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - 2025 Design Trends */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-20 md:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[70vh]">
          {/* Left Content - Hero Text */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-6">
              {/* Glassmorphic Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full text-sm font-semibold text-tyrian-800 tracking-wide">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tyrian-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r from-tyrian-600 to-tyrian-800"></span>
                </span>
                PRIVACY-FIRST MARKETPLACE
              </div>

              {/* Large Gradient Heading */}
              <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                Shop Intimate Items
                <br />
                <span className="relative inline-block mt-2">
                  <span className="bg-gradient-to-r from-tyrian-800 via-tyrian-600 to-rose-600 bg-clip-text text-transparent">
                    With Total Privacy
                  </span>
                  {/* Animated underline */}
                  <svg className="absolute -bottom-3 left-0 w-full" height="12" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M2 8C60 4 120 2 180 5C220 7 260 9 298 6"
                      stroke="url(#underline-gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="animate-pulse"
                    />
                    <defs>
                      <linearGradient id="underline-gradient" x1="0" y1="0" x2="300" y2="0">
                        <stop offset="0%" stopColor="#63002B" stopOpacity="0.6" />
                        <stop offset="50%" stopColor="#8a1048" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#e11d48" stopOpacity="0.4" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-xl font-light">
                A secure marketplace for pre-loved items. Anonymous shopping, encrypted messaging, and discreet delivery — all in one trusted platform.
              </p>
            </div>

            {/* CTAs and Trust Indicators */}
            {!loading && !profileLoading && (
              <>
                {isAuthenticated ? (
                  <div className="space-y-6 animate-fade-in-up animation-delay-200">
                    {/* Welcome Card - Glassmorphic */}
                    <div className="inline-flex items-center gap-4 glass-card rounded-2xl p-6 border-green-200/50">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
                        <svg
                          className="w-7 h-7 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-gray-900 font-bold text-lg">
                          Welcome back!
                        </p>
                        <p className="text-gray-600">
                          {user?.email && `Signed in as ${user.email}`}
                          {user?.walletAddress &&
                            `Connected: ${user.walletAddress.slice(0, 10)}...${user.walletAddress.slice(-8)}`}
                        </p>
                      </div>
                    </div>

                    {/* Onboarding Steps */}
                    {!hasProfile ? (
                      <div className="max-w-2xl">
                        <div className="glass-card rounded-3xl p-8">
                          <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              Complete Your Profile
                            </h3>
                            <p className="text-gray-600">
                              Let's get you started! Set up your profile to unlock
                              all features.
                            </p>
                          </div>

                          {/* Progress Steps */}
                          <div className="flex items-center justify-center gap-4 mb-8">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-tyrian-700 to-tyrian-900 text-white flex items-center justify-center font-bold shadow-lg shadow-tyrian-800/30">
                                1
                              </div>
                              <span className="text-sm font-semibold text-gray-900">
                                Profile
                              </span>
                            </div>
                            <div className="w-12 h-0.5 bg-gray-300"></div>
                            <div className="flex items-center gap-2 opacity-50">
                              <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">
                                2
                              </div>
                              <span className="text-sm font-medium text-gray-500">
                                KYC
                              </span>
                            </div>
                          </div>

                          <Link
                            href="/profile/edit"
                            className="block w-full px-8 py-4 bg-gradient-to-r from-tyrian-800 to-tyrian-700 text-white rounded-xl hover:from-tyrian-900 hover:to-tyrian-800 transition-all font-semibold shadow-lg shadow-tyrian-800/30 hover:shadow-xl hover:shadow-tyrian-800/40 hover:-translate-y-1 text-center pulse-glow"
                          >
                            Create Profile
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-4 justify-start flex-wrap">
                        <Link
                          href="/products"
                          className="px-8 py-4 bg-gradient-to-r from-tyrian-800 to-tyrian-700 text-white rounded-xl hover:from-tyrian-900 hover:to-tyrian-800 transition-all font-semibold shadow-lg shadow-tyrian-800/30 hover:shadow-xl hover:-translate-y-1 text-center pulse-glow"
                        >
                          Browse Products
                        </Link>
                        <Link
                          href="/orders"
                          className="px-8 py-4 glass-card text-gray-800 rounded-xl hover:bg-white/40 transition-all font-semibold hover:-translate-y-1 text-center"
                        >
                          My Orders
                        </Link>
                        <Link
                          href="/profile"
                          className="px-8 py-4 border-2 border-tyrian-300 text-tyrian-800 rounded-xl hover:bg-tyrian-50/50 transition-all font-semibold hover:-translate-y-1 text-center"
                        >
                          View Profile
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-8 animate-fade-in-up animation-delay-200">
                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                        href="/signup"
                        className="group px-10 py-5 bg-gradient-to-r from-tyrian-800 to-tyrian-700 text-white rounded-2xl hover:from-tyrian-900 hover:to-tyrian-800 transition-all font-bold text-lg shadow-xl shadow-tyrian-800/30 hover:shadow-2xl hover:shadow-tyrian-800/40 hover:-translate-y-1 flex items-center justify-center gap-3 pulse-glow"
                      >
                        Get Started Free
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                      <Link
                        href="/products"
                        className="px-10 py-5 glass-card text-gray-800 rounded-2xl hover:bg-white/40 transition-all font-bold text-lg hover:-translate-y-1"
                      >
                        Browse Products
                      </Link>
                    </div>

                    <p className="text-gray-600">
                      Already have an account?{" "}
                      <Link
                        href="/signin"
                        className="text-tyrian-800 hover:text-tyrian-900 font-bold underline underline-offset-4 decoration-tyrian-300 hover:decoration-tyrian-500 transition-colors"
                      >
                        Sign In →
                      </Link>
                    </p>

                    {/* Trust Indicators - Glassmorphic */}
                    <div className="flex flex-wrap items-center gap-4 pt-4">
                      <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-full">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">No credit card</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-full">
                        <svg className="w-5 h-5 text-tyrian-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">End-to-end encrypted</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-full">
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">100% anonymous</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Visual Element - Bento Grid */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4 auto-rows-[140px]">
              {/* Card 1 - Privacy (Large - spans 2 rows) */}
              <div className="row-span-2 glass-card rounded-3xl p-6 floating-card hover:scale-[1.02] transition-all duration-500 group cursor-pointer">
                <div className="h-full flex flex-col">
                  <div className="w-14 h-14 bg-gradient-to-br from-tyrian-700 to-tyrian-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-tyrian-800/30 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Anonymous Shopping</h3>
                  <p className="text-gray-600 text-sm leading-relaxed flex-grow">Your identity stays completely private throughout your entire journey on our marketplace.</p>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200/50">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-green-600">Active Protection</span>
                  </div>
                </div>
              </div>

              {/* Card 2 - Messaging */}
              <div className="glass-card rounded-3xl p-5 floating-card animation-delay-200 hover:scale-[1.02] transition-all duration-500 group cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-tyrian-500 to-tyrian-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-tyrian-600/20 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Encrypted Chat</h3>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-tyrian-100/80 rounded-full w-fit">
                      <div className="w-1.5 h-1.5 bg-tyrian-600 rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold text-tyrian-800">Signal Protocol</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 - Delivery */}
              <div className="glass-card rounded-3xl p-5 floating-card animation-delay-400 hover:scale-[1.02] transition-all duration-500 group cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-gray-700/20 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Discreet Packaging</h3>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100/80 rounded-full w-fit">
                      <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs font-semibold text-gray-700">Plain Box</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4 - Wide Card - Secure Transactions */}
              <div className="col-span-2 glass-card-dark rounded-3xl p-6 floating-card animation-delay-300 hover:scale-[1.01] transition-all duration-500 group cursor-pointer bg-gradient-to-br from-tyrian-900/90 to-tyrian-950/90">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg mb-1">Secure Transactions</h3>
                      <p className="text-tyrian-200 text-sm">KYC verified sellers • Escrow protection • Dispute resolution</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-white">Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Lycusa Section - Privacy & Security Focus */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Lycusa?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Built from the ground up with privacy, security, and discretion at our core.
              We understand the importance of anonymity in sensitive purchases.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Privacy & Anonymity */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-tyrian-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-linear-to-br from-tyrian-800 to-tyrian-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-tyrian-800/20">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Complete Privacy
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Your identity remains anonymous throughout the entire shopping experience. No personal data is ever exposed to sellers or buyers.
              </p>
            </div>

            {/* End-to-End Encryption */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-tyrian-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-linear-to-br from-tyrian-600 to-tyrian-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-tyrian-600/20">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Encrypted Messaging
              </h3>
              <p className="text-gray-600 leading-relaxed">
                All communications use Signal Protocol end-to-end encryption. Even we can't read your messages.
              </p>
            </div>

            {/* Discreet Delivery */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gray-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-linear-to-br from-gray-700 to-gray-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-gray-700/20">
                <svg
                  className="w-8 h-8 text-white"
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
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Discreet Delivery
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Plain packaging with no branding or product details. Your deliveries arrive privately without revealing contents.
              </p>
            </div>

            {/* Buyer & Seller Protection */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-tyrian-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-linear-to-br from-tyrian-700 to-tyrian-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-tyrian-700/20">
                <svg
                  className="w-8 h-8 text-white"
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
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Secure Transactions
              </h3>
              <p className="text-gray-600 leading-relaxed">
                KYC verification, secure escrow payments, and dispute resolution protect both buyers and sellers.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-32 relative">
          {/* Decorative background elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-tyrian-100/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gray-100/50 rounded-full blur-3xl"></div>
          </div>

          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-tyrian-50 border border-tyrian-200 rounded-full mb-4 text-sm font-medium text-tyrian-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Simple & Secure
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started is simple. Create an account, browse anonymously, and shop with complete confidence.
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-tyrian-200 via-tyrian-300 to-tyrian-200 -translate-y-1/2 -z-10"></div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              {/* Step 1 */}
              <div className="relative group">
                <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-tyrian-200 h-full flex flex-col">
                  {/* Step number with gradient background */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-tyrian-800 to-tyrian-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-tyrian-800/30">
                      <span className="text-3xl font-bold text-white">1</span>
                    </div>
                    {/* Floating badge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-tyrian-100 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                      <svg className="w-4 h-4 text-tyrian-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                    Sign Up Anonymously
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed grow">
                    Create your account with just an email or Web3 wallet. No personal information required to start browsing.
                  </p>

                  {/* Decorative dot */}
                  <div className="mt-6 flex justify-center gap-1">
                    <div className="w-2 h-2 bg-tyrian-800 rounded-full"></div>
                    <div className="w-2 h-2 bg-tyrian-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-tyrian-200 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group lg:mt-8">
                <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-gray-300 h-full flex flex-col">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-700 to-gray-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-gray-700/30">
                      <span className="text-3xl font-bold text-white">2</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                    Browse & Connect
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed grow">
                    Explore verified listings and message sellers through our encrypted chat. Your conversations stay completely private.
                  </p>

                  <div className="mt-6 flex justify-center gap-1">
                    <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-tyrian-200 h-full flex flex-col">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-tyrian-700 to-tyrian-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-tyrian-700/30">
                      <span className="text-3xl font-bold text-white">3</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-tyrian-100 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                      <svg className="w-4 h-4 text-tyrian-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                    Secure Payment
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed grow">
                    Complete your purchase with our secure escrow system. Payments are protected and released only when you confirm delivery.
                  </p>

                  <div className="mt-6 flex justify-center gap-1">
                    <div className="w-2 h-2 bg-tyrian-700 rounded-full"></div>
                    <div className="w-2 h-2 bg-tyrian-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-tyrian-200 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative group lg:mt-8">
                <div className="bg-gradient-to-br from-tyrian-800 to-tyrian-900 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-tyrian-300 h-full flex flex-col">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto bg-white rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                      <span className="text-3xl font-bold text-tyrian-800">4</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4 text-center">
                    Discreet Delivery
                  </h3>
                  <p className="text-tyrian-100 text-center leading-relaxed grow">
                    Receive your items in plain, unmarked packaging. No external labels or branding reveal the contents or marketplace name.
                  </p>

                  <div className="mt-6 flex justify-center gap-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-tyrian-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-tyrian-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 text-center">
              <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="text-left">
                  <p className="text-gray-900 font-semibold mb-1">Ready to get started?</p>
                  <p className="text-gray-600 text-sm">Join our privacy-first marketplace today.</p>
                </div>
                <Link
                  href="/signup"
                  className="px-8 py-3 bg-tyrian-800 text-white rounded-xl hover:bg-tyrian-900 transition-all font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
                >
                  Join Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Project Phases Timeline Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-tyrian-50 border border-tyrian-200 rounded-full mb-4 text-sm font-medium text-tyrian-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Our Roadmap
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Project Phases
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're building Lycusa in three strategic phases to ensure quality, security, and scalability.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Timeline connector line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-linear-to-b from-tyrian-300 via-tyrian-400 to-gray-300"></div>

            <div className="space-y-12">
              {/* Phase 1 - Current */}
              <div className="relative">
                <div className="md:flex items-center gap-8">
                  {/* Timeline dot */}
                  <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-tyrian-800 rounded-full border-4 border-white shadow-lg z-10"></div>

                  {/* Content */}
                  <div className="md:w-1/2 md:pr-12 md:text-right">
                    <div className="inline-block bg-linear-to-r from-tyrian-800 to-tyrian-600 text-white px-4 py-1 rounded-full text-sm font-bold mb-3">
                      PHASE 1 · CURRENT
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Foundation & Core Features</h3>
                    <p className="text-sm text-gray-500 mb-4">Q1 2025 - Q2 2025</p>
                  </div>
                  <div className="md:w-1/2 md:pl-12">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-tyrian-200">
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>User authentication & KYC verification</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>End-to-end encrypted messaging (Signal Protocol)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Product listings & marketplace infrastructure</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Basic order management & escrow system</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase 2 - Planned */}
              <div className="relative">
                <div className="md:flex items-center gap-8">
                  {/* Timeline dot */}
                  <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gray-400 rounded-full border-4 border-white shadow-lg z-10"></div>

                  {/* Content - Reversed order for alternating layout */}
                  <div className="md:w-1/2 md:pr-12 md:text-right order-1 md:order-none">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start gap-2 md:flex-row-reverse md:text-right">
                          <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit</span>
                        </li>
                        <li className="flex items-start gap-2 md:flex-row-reverse md:text-right">
                          <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span>Sed do eiusmod tempor incididunt ut labore</span>
                        </li>
                        <li className="flex items-start gap-2 md:flex-row-reverse md:text-right">
                          <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span>Ut enim ad minim veniam quis nostrud</span>
                        </li>
                        <li className="flex items-start gap-2 md:flex-row-reverse md:text-right">
                          <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span>Exercitation ullamco laboris nisi</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="md:w-1/2 md:pl-12">
                    <div className="inline-block bg-gray-400 text-white px-4 py-1 rounded-full text-sm font-bold mb-3">
                      PHASE 2 · PLANNED
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Enhanced Features & Scale</h3>
                    <p className="text-sm text-gray-500 mb-4">Q3 2025 - Q4 2025</p>
                  </div>
                </div>
              </div>

              {/* Phase 3 - Future */}
              <div className="relative">
                <div className="md:flex items-center gap-8">
                  {/* Timeline dot */}
                  <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gray-300 rounded-full border-4 border-white shadow-lg z-10"></div>

                  {/* Content */}
                  <div className="md:w-1/2 md:pr-12 md:text-right">
                    <div className="inline-block bg-gray-300 text-gray-700 px-4 py-1 rounded-full text-sm font-bold mb-3">
                      PHASE 3 · FUTURE
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Advanced Platform & Global Expansion</h3>
                    <p className="text-sm text-gray-500 mb-4">2026 & Beyond</p>
                  </div>
                  <div className="md:w-1/2 md:pl-12">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span>Duis aute irure dolor in reprehenderit</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span>Voluptate velit esse cillum dolore</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span>Excepteur sint occaecat cupidatat</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span>Non proident sunt in culpa qui officia</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="mt-32 mb-16">
          <div className="relative overflow-hidden bg-linear-to-br from-tyrian-900 via-tyrian-800 to-tyrian-900 rounded-3xl p-12 md:p-16 shadow-2xl">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-tyrian-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-tyrian-950/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Shop with Complete Privacy?
              </h2>
              <p className="text-xl text-tyrian-100 mb-10 leading-relaxed">
                Join Lycusa today and experience a marketplace built for discretion, security, and your peace of mind.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="px-12 py-5 bg-white text-tyrian-900 rounded-2xl hover:bg-gray-100 transition-all font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/products"
                  className="px-12 py-5 border-2 border-white text-white rounded-2xl hover:bg-white/10 transition-all font-bold text-lg hover:-translate-y-1"
                >
                  Explore Products
                </Link>
              </div>
              <p className="mt-6 text-sm text-tyrian-200">
                No credit card required · Anonymous browsing · Encrypted messaging
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-tyrian-950 text-gray-400 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Image
              src="/logos/white-with-name.svg"
              alt="Lycusa"
              width={120}
              height={35}
              className="h-8 w-auto mx-auto mb-4 opacity-80"
            />
            <p className="text-sm">© 2025 Lycusa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </AppBackground>
  );
}
