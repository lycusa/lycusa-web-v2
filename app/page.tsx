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
      {/* Header - Glass Morphism Design */}
      <header className="sticky top-0 z-50 glass-frosted border-b border-white/30">
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
                  <div className="w-24 h-9 glass animate-pulse rounded-xl"></div>
                  <div className="w-20 h-9 glass animate-pulse rounded-xl"></div>
                </div>
              ) : isAuthenticated ? (
                <>
                  <Link
                    href="/my-products"
                    className="px-4 py-2 text-gray-700 hover:text-tyrian-800 transition-all text-sm font-medium glass-hover rounded-xl"
                  >
                    My Products
                  </Link>
                  <Link
                    href="/orders"
                    className="px-4 py-2 text-gray-700 hover:text-tyrian-800 transition-all text-sm font-medium glass-hover rounded-xl"
                  >
                    Orders
                  </Link>
                  <Link
                    href="/messages"
                    className="px-4 py-2 text-gray-700 hover:text-tyrian-800 transition-all text-sm font-medium glass-hover rounded-xl"
                  >
                    Messages
                  </Link>
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 glass rounded-xl border border-white/40">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
                      {user?.email ||
                        `${user?.walletAddress?.slice(0, 6)}...${user?.walletAddress?.slice(-4)}`}
                    </span>
                  </div>
                  <LogoutButton className="px-4 py-2 neumorphic-tyrian text-white rounded-xl hover:scale-105 transition-all text-sm font-medium" />
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="px-4 py-2 text-gray-700 hover:text-tyrian-800 transition-all text-sm font-medium glass-hover rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-5 py-2.5 neumorphic-tyrian text-white rounded-xl hover:scale-105 transition-all text-sm font-semibold glow-tyrian"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - 2025 Creative Design */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 md:pt-12 md:pb-20">
        {/* Main Hero Grid - Bento Style */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">

          {/* Main Content Card - Spans 7 columns */}
          <div className="lg:col-span-7 relative overflow-hidden bg-linear-to-br from-tyrian-900 via-tyrian-800 to-tyrian-950 rounded-3xl p-8 md:p-10 lg:p-12 min-h-[400px] lg:min-h-[480px] flex flex-col justify-between">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-tyrian-600/30 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-tyrian-700/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              {/* Grid pattern overlay */}
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-semibold text-tyrian-100 tracking-wide mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tyrian-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                PRIVACY-FIRST MARKETPLACE
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
                Shop Intimate
                <br />
                Items With
                <br />
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-tyrian-200 via-white to-tyrian-200">Total Privacy</span>
                </span>
              </h1>

              <p className="text-base md:text-lg text-tyrian-100/80 leading-relaxed max-w-md">
                A secure marketplace where your identity stays anonymous, messages are encrypted, and packages arrive discreetly.
              </p>
            </div>

            {/* CTAs */}
            <div className="relative z-10 mt-8">
              {!loading && !profileLoading && !isAuthenticated && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/signup"
                    className="group px-6 py-3.5 bg-white text-tyrian-900 rounded-xl hover:bg-tyrian-50 transition-all font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    Get Started Free
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/products"
                    className="px-6 py-3.5 border border-white/30 text-white rounded-xl hover:bg-white/10 transition-all font-semibold backdrop-blur-sm hover:-translate-y-0.5"
                  >
                    Browse Products
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Bento Grid with Glass Effects */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4 lg:gap-5">

            {/* Feature Card 1 - Privacy - Glass Frosted */}
            <div className="group col-span-2 glass-frosted rounded-2xl p-6 depth-shadow-md hover:depth-shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-tyrian-400/10 rounded-full blur-3xl group-hover:bg-tyrian-400/20 transition-all"></div>
              <div className="absolute inset-0 glass-reflection pointer-events-none opacity-30"></div>
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-14 h-14 neumorphic-tyrian rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Anonymous Shopping</h3>
                  <p className="text-sm text-gray-600">Your identity stays completely private throughout your journey.</p>
                </div>
              </div>
            </div>

            {/* Feature Card 2 - Encrypted - Dark Glass */}
            <div className="group rounded-2xl p-5 depth-shadow-md hover:depth-shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.95) 0%, rgba(31, 31, 31, 0.98) 100%)',
              }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
              <div className="absolute inset-0 opacity-30" style={{
                background: 'radial-gradient(ellipse at 20% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)',
              }}></div>
              <div className="relative z-10">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-white/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-bold text-white text-sm mb-1">E2E Encrypted</h3>
                <p className="text-xs text-gray-400">Signal Protocol</p>
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-medium text-green-300">Active</span>
              </div>
            </div>

            {/* Feature Card 3 - Delivery - Neumorphic */}
            <div className="group neumorphic rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/40 to-gray-100/20 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 neumorphic-inset rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">Discreet Delivery</h3>
                <p className="text-xs text-gray-500">Plain packaging</p>
              </div>
              <div className="absolute bottom-3 right-3">
                <div className="w-6 h-6 neumorphic-button rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Feature Card 4 - Escrow / Trust - Glass Light */}
            <div className="group col-span-2 glass-light rounded-2xl p-5 depth-shadow-md hover:depth-shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-0 glass-reflection pointer-events-none opacity-30"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-tyrian-700 to-tyrian-600 rounded-xl flex items-center justify-center shadow-lg shadow-tyrian-700/25 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Secure Escrow</h3>
                    <p className="text-sm text-gray-600">KYC verified · Buyer protection</p>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full neumorphic flex items-center justify-center border-2 border-white">
                    <svg className="w-4 h-4 text-tyrian-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-tyrian-200 flex items-center justify-center border-2 border-white">
                    <svg className="w-4 h-4 text-tyrian-800" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-tyrian-400 flex items-center justify-center border-2 border-white">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Bar - Below Hero */}
        {!loading && !profileLoading && !isAuthenticated && (
          <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-3 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-tyrian-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-tyrian-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>100% anonymous browsing</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-tyrian-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Signal Protocol encryption</span>
            </div>
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link href="/signin" className="text-tyrian-800 hover:text-tyrian-900 font-semibold">
                Sign In →
              </Link>
            </p>
          </div>
        )}

        {/* Authenticated User State */}
        {!loading && !profileLoading && isAuthenticated && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-tyrian-600 to-tyrian-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Welcome back!</p>
                    <p className="text-sm text-gray-600">
                      {user?.email && `${user.email}`}
                      {user?.walletAddress && `${user.walletAddress.slice(0, 10)}...${user.walletAddress.slice(-6)}`}
                    </p>
                  </div>
                </div>

                {!hasProfile ? (
                  <Link
                    href="/profile/edit"
                    className="px-6 py-3 bg-tyrian-800 text-white rounded-xl hover:bg-tyrian-900 transition-all font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-center"
                  >
                    Complete Profile →
                  </Link>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <Link href="/products" className="px-5 py-2.5 bg-tyrian-800 text-white rounded-xl hover:bg-tyrian-900 transition-all font-medium shadow-md hover:shadow-lg text-sm">
                      Browse Products
                    </Link>
                    <Link href="/orders" className="px-5 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-all font-medium shadow-md hover:shadow-lg text-sm">
                      My Orders
                    </Link>
                    <Link href="/profile" className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm">
                      Profile
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Why Lycusa Section - Glass Bento Grid */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 glass-frosted rounded-full mb-6 text-sm font-semibold text-tyrian-800">
              <div className="w-2 h-2 bg-tyrian-600 rounded-full animate-pulse" />
              Built for Privacy
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Lycusa?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Built from the ground up with privacy, security, and discretion at our core.
              We understand the importance of anonymity in sensitive purchases.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
            {/* Privacy Card - Large */}
            <div className="lg:col-span-7 group relative glass-frosted rounded-3xl p-8 md:p-10 depth-shadow-lg hover:depth-shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              {/* Glass Reflection Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-tyrian-100/20 pointer-events-none" />
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-tyrian-400/10 rounded-full blur-3xl group-hover:bg-tyrian-400/20 transition-all duration-700" />

              <div className="relative z-10">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 neumorphic-tyrian rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Complete Privacy</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Your identity remains anonymous throughout the entire shopping experience. No personal data is ever exposed to sellers or buyers.
                    </p>
                  </div>
                </div>

                {/* Feature Tags */}
                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="px-4 py-2 glass rounded-xl text-sm font-medium text-gray-700">Zero-knowledge proofs</span>
                  <span className="px-4 py-2 glass rounded-xl text-sm font-medium text-gray-700">Pseudonymous profiles</span>
                  <span className="px-4 py-2 glass rounded-xl text-sm font-medium text-gray-700">No data selling</span>
                </div>
              </div>
            </div>

            {/* Encryption Card - Tall */}
            <div className="lg:col-span-5 group relative overflow-hidden rounded-3xl p-8 depth-shadow-lg hover:depth-shadow-xl transition-all duration-500 hover:-translate-y-2"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 0, 43, 0.95) 0%, rgba(74, 0, 32, 0.98) 100%)',
              }}>
              {/* Liquid Glass Overlay */}
              <div className="absolute inset-0 opacity-20" style={{
                background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
              }} />
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }} />

              <div className="relative z-10 h-full flex flex-col">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/20">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">Encrypted Messaging</h3>
                <p className="text-tyrian-100/90 leading-relaxed flex-1">
                  All communications use Signal Protocol end-to-end encryption. Even we can't read your messages.
                </p>

                {/* Signal Badge */}
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 w-fit">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-white">Signal Protocol Active</span>
                </div>
              </div>
            </div>

            {/* Delivery Card - Neumorphic */}
            <div className="lg:col-span-5 group relative neumorphic rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-gray-100/30 pointer-events-none" />

              <div className="relative z-10">
                <div className="w-14 h-14 neumorphic-inset rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">Discreet Delivery</h3>
                <p className="text-gray-600 leading-relaxed">
                  Plain packaging with no branding or product details. Your deliveries arrive privately without revealing contents.
                </p>

                {/* Package Icon Animation */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 neumorphic-button rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">Plain packaging guaranteed</span>
                </div>
              </div>
            </div>

            {/* Secure Transactions Card */}
            <div className="lg:col-span-7 group relative glass-light rounded-3xl p-8 depth-shadow-md hover:depth-shadow-lg transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              {/* Dynamic glass reflection */}
              <div className="absolute inset-0 glass-reflection pointer-events-none opacity-50" />
              <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-tyrian-400/10 rounded-full blur-3xl" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-tyrian-700 to-tyrian-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-tyrian-700/30 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Transactions</h3>
                    <p className="text-gray-600 leading-relaxed">
                      KYC verification, secure escrow payments, and dispute resolution protect both buyers and sellers.
                    </p>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full neumorphic flex items-center justify-center border-2 border-white">
                      <svg className="w-5 h-5 text-tyrian-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-tyrian-100 flex items-center justify-center border-2 border-white">
                      <svg className="w-5 h-5 text-tyrian-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-tyrian-200 flex items-center justify-center border-2 border-white">
                      <svg className="w-5 h-5 text-tyrian-800" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">KYC Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section - Bento Glass Grid */}
        <div className="mt-32 relative">
          {/* Decorative background elements with liquid glass effect */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full blur-3xl animate-float-slow"
              style={{ background: 'radial-gradient(circle, rgba(99, 0, 43, 0.08) 0%, transparent 70%)' }} />
            <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full blur-3xl animate-float"
              style={{ background: 'radial-gradient(circle, rgba(214, 146, 174, 0.1) 0%, transparent 70%)', animationDelay: '2s' }} />
          </div>

          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 glass-frosted rounded-full mb-6 text-sm font-semibold text-tyrian-800">
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

          {/* Bento Grid for Steps */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
            {/* Step 1 - Large Card */}
            <div className="lg:col-span-6 group relative glass-frosted rounded-3xl p-8 depth-shadow-md hover:depth-shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              {/* Glass reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-tyrian-50/20 pointer-events-none" />
              <div className="absolute -top-20 -left-20 w-48 h-48 bg-tyrian-400/15 rounded-full blur-3xl group-hover:bg-tyrian-400/25 transition-all duration-700" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-16 h-16 neumorphic-tyrian rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-tyrian-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">Sign Up Anonymously</h3>
                <p className="text-gray-600 leading-relaxed flex-1">
                  Create your account with just an email or Web3 wallet. No personal information required to start browsing.
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-tyrian-800 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-tyrian-400 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-tyrian-200 rounded-full" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Email or Wallet</span>
                </div>
              </div>
            </div>

            {/* Step 2 - Neumorphic Card */}
            <div className="lg:col-span-6 group relative neumorphic rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-gray-100/30 pointer-events-none" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-gray-700/30 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <div className="w-10 h-10 neumorphic-inset rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">Browse & Connect</h3>
                <p className="text-gray-600 leading-relaxed flex-1">
                  Explore verified listings and message sellers through our encrypted chat. Your conversations stay completely private.
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-gray-700 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-gray-400 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-gray-200 rounded-full" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">End-to-end encrypted</span>
                </div>
              </div>
            </div>

            {/* Step 3 - Glass Light Card */}
            <div className="lg:col-span-5 group relative glass-light rounded-3xl p-8 depth-shadow-md hover:depth-shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 glass-reflection pointer-events-none opacity-40" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tyrian-700 to-tyrian-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-tyrian-700/30 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-tyrian-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">Secure Payment</h3>
                <p className="text-gray-600 leading-relaxed flex-1">
                  Complete your purchase with our secure escrow system. Payments are protected until you confirm delivery.
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-tyrian-700 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-tyrian-400 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-tyrian-200 rounded-full" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Escrow protected</span>
                </div>
              </div>
            </div>

            {/* Step 4 - Dark Glass Card */}
            <div className="lg:col-span-7 group relative overflow-hidden rounded-3xl p-8 depth-shadow-lg hover:depth-shadow-xl transition-all duration-500 hover:-translate-y-2"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 0, 43, 0.95) 0%, rgba(45, 0, 19, 0.98) 100%)',
              }}>
              {/* Liquid glass overlay */}
              <div className="absolute inset-0 opacity-30" style={{
                background: 'radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
              }} />
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }} />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8 h-full">
                <div className="flex-1">
                  <div className="flex items-start gap-5 mb-6">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl font-bold text-tyrian-800">4</span>
                    </div>
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3">Discreet Delivery</h3>
                  <p className="text-tyrian-100/90 leading-relaxed">
                    Receive your items in plain, unmarked packaging. No external labels or branding reveal the contents.
                  </p>

                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                      <div className="w-2.5 h-2.5 bg-tyrian-300 rounded-full" />
                      <div className="w-2.5 h-2.5 bg-tyrian-500 rounded-full" />
                    </div>
                    <span className="text-xs text-tyrian-200 font-medium">Plain packaging</span>
                  </div>
                </div>

                {/* Completion badge */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 glow-pulse">
                    <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA - Full Width Glass Card */}
            <div className="lg:col-span-12 glass-frosted rounded-3xl p-8 depth-shadow-md">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 neumorphic rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-tyrian-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-gray-900 font-bold text-lg">Ready to get started?</p>
                    <p className="text-gray-600">Join our privacy-first marketplace today.</p>
                  </div>
                </div>
                <Link
                  href="/signup"
                  className="px-8 py-4 neumorphic-tyrian text-white rounded-2xl hover:scale-105 transition-all font-semibold whitespace-nowrap glow-tyrian"
                >
                  Join Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Project Phases Timeline Section - Glass Bento Grid */}
        <div className="mt-32 relative">
          {/* Background orbs */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl animate-float"
              style={{ background: 'radial-gradient(circle, rgba(99, 0, 43, 0.06) 0%, transparent 70%)' }} />
          </div>

          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 glass-frosted rounded-full mb-6 text-sm font-semibold text-tyrian-800">
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

          {/* Bento Grid Layout for Phases */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Phase 1 - Current - Large Card */}
            <div className="lg:col-span-7 group relative overflow-hidden rounded-3xl depth-shadow-lg hover:depth-shadow-xl transition-all duration-500 hover:-translate-y-2"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 0, 43, 0.95) 0%, rgba(74, 0, 32, 0.98) 100%)',
              }}>
              {/* Liquid glass effects */}
              <div className="absolute inset-0 opacity-25" style={{
                background: 'radial-gradient(ellipse at 20% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
              }} />
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }} />

              <div className="relative z-10 p-8 md:p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl font-bold text-tyrian-800">1</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-white">CURRENT</span>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">Foundation & Core Features</h3>
                <p className="text-tyrian-200 text-sm mb-6">Q1 2025 - Q2 2025</p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white/90 text-sm">User authentication & KYC verification</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white/90 text-sm">End-to-end encrypted messaging (Signal Protocol)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white/90 text-sm">Product listings & marketplace infrastructure</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white/90 text-sm">Basic order management & escrow system</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 2 - Planned - Neumorphic Card */}
            <div className="lg:col-span-5 group relative neumorphic rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-gray-100/30 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-500 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-600/30 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl font-bold text-white">2</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 neumorphic-inset rounded-full">
                    <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-bold text-gray-600">PLANNED</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">Enhanced Features & Scale</h3>
                <p className="text-gray-500 text-sm mb-6">Q3 2025 - Q4 2025</p>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 p-2.5 glass rounded-lg">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600 text-sm">Lorem ipsum dolor sit amet</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 glass rounded-lg">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600 text-sm">Sed do eiusmod tempor</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 glass rounded-lg">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600 text-sm">Ut enim ad minim veniam</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 glass rounded-lg">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600 text-sm">Exercitation ullamco laboris</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 3 - Future - Glass Light Card */}
            <div className="lg:col-span-12 group relative glass-frosted rounded-3xl p-8 depth-shadow-md hover:depth-shadow-lg transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 glass-reflection pointer-events-none opacity-30" />
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-gray-300/20 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 neumorphic rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="text-xl font-bold text-gray-600">3</span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full">
                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-bold text-gray-500">FUTURE</span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Advanced Platform & Global Expansion</h3>
                    <p className="text-gray-500 text-sm mb-6">2026 & Beyond</p>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 neumorphic-inset rounded-xl">
                      <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-500 text-sm">Duis aute irure dolor</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 neumorphic-inset rounded-xl">
                      <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-500 text-sm">Voluptate velit esse</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 neumorphic-inset rounded-xl">
                      <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-500 text-sm">Excepteur sint occaecat</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 neumorphic-inset rounded-xl">
                      <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-500 text-sm">Non proident sunt</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA Section - Liquid Glass Design */}
        <div className="mt-32 mb-16">
          <div className="relative overflow-hidden rounded-3xl depth-shadow-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 0, 43, 0.95) 0%, rgba(74, 0, 32, 0.98) 50%, rgba(45, 0, 19, 0.99) 100%)',
            }}>
            {/* Liquid glass background effects */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Primary light orb */}
              <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full animate-float-slow"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(176, 24, 63, 0.1) 40%, transparent 70%)',
                  filter: 'blur(40px)',
                }} />
              {/* Secondary orb */}
              <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full animate-float"
                style={{
                  background: 'radial-gradient(circle, rgba(214, 146, 174, 0.12) 0%, transparent 60%)',
                  filter: 'blur(60px)',
                  animationDelay: '2s',
                }} />
              {/* Grid pattern */}
              <div className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }} />
              {/* Top light reflection */}
              <div className="absolute top-0 left-1/4 right-1/4 h-32 opacity-20"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)',
                  filter: 'blur(20px)',
                }} />
            </div>

            <div className="relative z-10 p-12 md:p-16">
              <div className="max-w-4xl mx-auto">
                {/* Glass card container */}
                <div className="text-center">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full mb-8 border border-white/20">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-semibold text-white">Start Your Private Journey</span>
                  </div>

                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                    Ready to Shop with
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-tyrian-200 via-white to-tyrian-200">Complete Privacy?</span>
                  </h2>
                  <p className="text-xl text-tyrian-100/90 mb-10 leading-relaxed max-w-2xl mx-auto">
                    Join Lycusa today and experience a marketplace built for discretion, security, and your peace of mind.
                  </p>

                  {/* CTA Buttons with neumorphic styling */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                    <Link
                      href="/signup"
                      className="group relative px-10 py-5 bg-white text-tyrian-900 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(99, 0, 43, 0.1), transparent)',
                          animation: 'shimmer 2s infinite',
                        }} />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Create Free Account
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </Link>
                    <Link
                      href="/products"
                      className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                    >
                      Explore Products
                    </Link>
                  </div>

                  {/* Trust indicators with glass styling */}
                  <div className="flex flex-wrap items-center justify-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-tyrian-100">No credit card required</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-tyrian-100">Anonymous browsing</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-tyrian-100">Encrypted messaging</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer - Liquid Glass Design */}
      <footer className="relative mt-24 overflow-hidden">
        {/* Glass background */}
        <div className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(45, 0, 19, 0.95) 0%, rgba(45, 0, 19, 0.99) 100%)',
          }} />

        {/* Decorative orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 left-1/4 w-[300px] h-[300px] rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(99, 0, 43, 0.4) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }} />
          <div className="absolute -bottom-20 right-1/4 w-[250px] h-[250px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(176, 24, 63, 0.3) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }} />
        </div>

        <div className="relative z-10 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center">
              {/* Logo */}
              <div className="mb-6">
                <Image
                  src="/logos/white-with-name.svg"
                  alt="Lycusa"
                  width={120}
                  height={35}
                  className="h-8 w-auto opacity-90"
                />
              </div>

              {/* Glass divider */}
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-tyrian-400/50 to-transparent mb-6" />

              {/* Tagline */}
              <p className="text-tyrian-200/80 text-sm mb-6 text-center max-w-md">
                The privacy-first marketplace for discreet shopping.
              </p>

              {/* Trust badges */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-tyrian-100/80">E2E Encrypted</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-tyrian-100/80">Secure Escrow</span>
                </div>
              </div>

              {/* Copyright */}
              <p className="text-sm text-tyrian-300/60">
                © 2025 Lycusa. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </AppBackground>
  );
}
