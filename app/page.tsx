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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
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

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-tyrian-50 border border-tyrian-200 rounded-full mb-6 text-sm font-medium text-tyrian-800">
            <span className="w-2 h-2 bg-tyrian-800 rounded-full animate-pulse"></span>
            Privacy-focused marketplace
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Discreet Shopping
            <br />
            <span className="bg-gradient-to-r from-tyrian-800 via-tyrian-600 to-gray-500 bg-clip-text text-transparent">
              Your Privacy Matters
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Buy and sell pre-loved intimate items with complete privacy and discretion.
            A trusted marketplace where your identity is protected.
          </p>

          {!loading && !profileLoading && (
            <>
              {isAuthenticated ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-lg">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
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
                      <p className="text-green-900 font-semibold mb-1">
                        Welcome back!
                      </p>
                      <p className="text-green-700 text-sm">
                        {user?.email && `Signed in as ${user.email}`}
                        {user?.walletAddress &&
                          `Connected: ${user.walletAddress.slice(0, 10)}...${user.walletAddress.slice(-8)}`}
                      </p>
                    </div>
                  </div>

                  {/* Onboarding Steps */}
                  {!hasProfile ? (
                    <div className="max-w-2xl mx-auto">
                      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
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
                            <div className="w-10 h-10 rounded-full bg-tyrian-800 text-white flex items-center justify-center font-bold">
                              1
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              Profile
                            </span>
                          </div>
                          <div className="w-12 h-0.5 bg-gray-300"></div>
                          <div className="flex items-center gap-2 opacity-50">
                            <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">
                              2
                            </div>
                            <span className="text-sm font-medium text-gray-500">
                              KYC
                            </span>
                          </div>
                        </div>

                        <Link
                          href="/profile/edit"
                          className="block w-full px-8 py-4 bg-tyrian-800 text-white rounded-xl hover:bg-tyrian-900 transition-all font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 text-center"
                        >
                          Create Profile
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                      <Link
                        href="/products"
                        className="px-8 py-4 bg-tyrian-800 text-white rounded-xl hover:bg-tyrian-900 transition-all font-semibold shadow-lg shadow-tyrian-800/30 hover:shadow-xl hover:shadow-tyrian-800/40 hover:-translate-y-1 text-center"
                      >
                        Browse Products
                      </Link>
                      <Link
                        href="/orders"
                        className="px-8 py-4 bg-zinc-800 text-white rounded-xl hover:bg-zinc-900 transition-all font-semibold shadow-lg shadow-zinc-800/30 hover:shadow-xl hover:shadow-zinc-800/40 hover:-translate-y-1 text-center"
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/profile"
                        className="px-8 py-4 border-2 border-tyrian-800 text-tyrian-800 rounded-xl hover:bg-tyrian-50 transition-all font-semibold hover:-translate-y-1 text-center"
                      >
                        View Profile
                      </Link>
                      <Link
                        href="/kyc"
                        className="px-8 py-4 border-2 border-tyrian-600 text-tyrian-700 rounded-xl hover:bg-tyrian-50 transition-all font-semibold hover:-translate-y-1 text-center"
                      >
                        KYC Verification
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/signup"
                      className="px-10 py-4 bg-tyrian-800 text-white rounded-xl hover:bg-tyrian-900 transition-all font-semibold text-lg shadow-lg shadow-tyrian-800/30 hover:shadow-xl hover:shadow-tyrian-800/40 hover:-translate-y-1"
                    >
                      Get Started Free
                    </Link>
                  </div>
                  <div className="text-center">
                    <Link
                      href="/signin"
                      className="text-gray-600 hover:text-tyrian-800 font-medium underline"
                    >
                      Already have an account? Sign In
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Lycusa?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The most trusted platform for buying and selling pre-loved fashion
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-tyrian-200 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-tyrian-100 to-tyrian-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-tyrian-800">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Easy Shopping
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Browse thousands of curated pre-loved items from verified sellers
              </p>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gray-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-gray-700">
                <svg
                  className="w-7 h-7"
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
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Secure Payments
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Multiple authentication options including email OTP and Web3 wallet
              </p>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-zinc-100 to-zinc-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-zinc-600">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Sustainable Impact
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Reduce fashion waste and give quality clothing a second life
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
              Simple Process
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum at eros.
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
                    Create Account
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed flex-grow">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.
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
                    Browse Items
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed flex-grow">
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.
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
                    Make Purchase
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed flex-grow">
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.
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
                    Receive Discreetly
                  </h3>
                  <p className="text-tyrian-100 text-center leading-relaxed flex-grow">
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt.
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
                  <p className="text-gray-600 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing.</p>
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
