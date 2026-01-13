"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppBackground } from "./components/layout";
import EmailCollector from "./components/shared/EmailCollector";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <AppBackground>
      {/* Header - Glass Morphism Design with Safe Areas */}
      <header className="sticky-safe glass-frosted border-b border-white/30 safe-area-top">
        <div className="max-w-7xl mx-auto container-safe py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group touch-target">
              <Image
                src="/logos/tyrian-purple-with-word.svg"
                alt="Lycusa"
                width={140}
                height={40}
                className="h-8 sm:h-10 w-auto"
                priority
                unoptimized
              />
            </Link>

            <nav className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={openModal}
                className="px-4 sm:px-5 py-2.5 sm:py-2.5 min-h-[44px] neumorphic-tyrian text-white rounded-xl active:scale-[0.98] sm:hover:scale-105 transition-all text-sm font-semibold glow-tyrian touch-target"
              >
                Sign In
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - 2025 Creative Design */}
      <main className="max-w-7xl mx-auto container-safe pt-6 pb-12 sm:pt-8 sm:pb-16 md:pt-12 md:pb-20">
        {/* Main Hero Grid - Bento Style */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-4 lg:gap-5">

          {/* Main Content Card - Spans 7 columns */}
          <div className="lg:col-span-7 relative overflow-hidden bg-linear-to-br from-tyrian-900 via-tyrian-800 to-tyrian-950 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 min-h-[320px] sm:min-h-[380px] lg:min-h-[480px] flex flex-col justify-between">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-48 sm:w-80 h-48 sm:h-80 bg-tyrian-600/30 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-48 sm:w-80 h-48 sm:h-80 bg-tyrian-700/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              {/* Grid pattern overlay */}
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-[10px] sm:text-xs font-semibold text-tyrian-100 tracking-wide mb-4 sm:mb-6">
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tyrian-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white"></span>
                </span>
                PRIVACY-FIRST MARKETPLACE
              </div>

              <h1 className="text-fluid-hero font-bold text-white leading-[1.1] tracking-tight mb-4 sm:mb-6">
                Shop Intimate
                <br />
                Items With
                <br />
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-tyrian-200 via-white to-tyrian-200">Total Privacy</span>
                </span>
              </h1>

              <p className="text-fluid-sm sm:text-fluid-base text-tyrian-100/80 leading-relaxed max-w-md">
                A secure marketplace where your identity stays anonymous, messages are encrypted, and packages arrive discreetly.
              </p>
            </div>

{/* CTAs hidden for marketing landing page */}
          </div>

          {/* Right Side - Bento Grid with Glass Effects */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">

            {/* Feature Card 1 - Privacy - Glass Frosted */}
            <div className="group col-span-2 glass-frosted rounded-xl sm:rounded-2xl p-4 sm:p-6 depth-shadow-md sm:hover:depth-shadow-lg transition-all duration-300 sm:hover:-translate-y-1 active:scale-[0.99] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-tyrian-400/10 rounded-full blur-3xl sm:group-hover:bg-tyrian-400/20 transition-all"></div>
              <div className="absolute inset-0 glass-reflection pointer-events-none opacity-30 hidden sm:block"></div>
              <div className="relative z-10 flex items-start gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-14 sm:h-14 neumorphic-tyrian rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 sm:group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-0.5 sm:mb-1">Anonymous Shopping</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-snug">Your identity stays completely private throughout your journey.</p>
                </div>
              </div>
            </div>

            {/* Feature Card 2 - Encrypted - Dark Glass */}
            <div className="group rounded-xl sm:rounded-2xl p-4 sm:p-5 depth-shadow-md sm:hover:depth-shadow-lg transition-all duration-300 sm:hover:-translate-y-1 active:scale-[0.99] relative overflow-hidden min-h-[120px] sm:min-h-[140px]"
              style={{
                background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.95) 0%, rgba(31, 31, 31, 0.98) 100%)',
              }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
              <div className="absolute inset-0 opacity-30" style={{
                background: 'radial-gradient(ellipse at 20% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)',
              }}></div>
              <div className="relative z-10">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 sm:group-hover:scale-110 transition-transform border border-white/20">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-bold text-white text-sm mb-0.5 sm:mb-1">E2E Encrypted</h3>
                <p className="text-[11px] sm:text-xs text-gray-400">Signal Protocol</p>
              </div>
              <div className="absolute bottom-2.5 sm:bottom-3 right-2.5 sm:right-3 flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-[9px] sm:text-[10px] font-medium text-green-300">Active</span>
              </div>
            </div>

            {/* Feature Card 3 - Delivery - Neumorphic */}
            <div className="group neumorphic rounded-xl sm:rounded-2xl p-4 sm:p-5 sm:hover:shadow-2xl transition-all duration-300 sm:hover:-translate-y-1 active:scale-[0.99] relative overflow-hidden min-h-[120px] sm:min-h-[140px]">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/40 to-gray-100/20 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="w-9 h-9 sm:w-10 sm:h-10 neumorphic-inset rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 sm:group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-0.5 sm:mb-1">Discreet Delivery</h3>
                <p className="text-[11px] sm:text-xs text-gray-500">Plain packaging</p>
              </div>
              <div className="absolute bottom-2.5 sm:bottom-3 right-2.5 sm:right-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 neumorphic-button rounded-md sm:rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Feature Card 4 - Escrow / Trust - Glass Light */}
            <div className="group col-span-2 glass-light rounded-xl sm:rounded-2xl p-4 sm:p-5 depth-shadow-md sm:hover:depth-shadow-lg transition-all duration-300 sm:hover:-translate-y-1 active:scale-[0.99] relative overflow-hidden">
              <div className="absolute inset-0 glass-reflection pointer-events-none opacity-30 hidden sm:block"></div>
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-tyrian-700 to-tyrian-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-tyrian-700/25 sm:group-hover:scale-110 transition-transform flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">Secure Escrow</h3>
                    <p className="text-xs sm:text-sm text-gray-600">KYC verified · Buyer protection</p>
                  </div>
                </div>
                <div className="flex -space-x-1.5 sm:-space-x-2 self-end sm:self-auto">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full neumorphic flex items-center justify-center border-2 border-white">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-tyrian-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-tyrian-200 flex items-center justify-center border-2 border-white">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-tyrian-800" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-tyrian-400 flex items-center justify-center border-2 border-white">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
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
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-x-8 sm:gap-y-3 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-tyrian-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-tyrian-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>100% anonymous browsing</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-tyrian-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Signal Protocol encryption</span>
          </div>
        </div>

{/* Authenticated User State hidden for marketing landing page */}

        {/* How It Works Section - Bento Glass Grid */}
        <div className="mt-16 sm:mt-24 md:mt-32 relative">
          {/* Decorative background elements with liquid glass effect */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/4 -left-16 sm:-left-32 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-3xl animate-float-slow"
              style={{ background: 'radial-gradient(circle, rgba(99, 0, 43, 0.08) 0%, transparent 70%)' }} />
            <div className="absolute bottom-1/4 -right-16 sm:-right-32 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full blur-3xl animate-float"
              style={{ background: 'radial-gradient(circle, rgba(214, 146, 174, 0.1) 0%, transparent 70%)', animationDelay: '2s' }} />
          </div>

          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 glass-frosted rounded-full mb-4 sm:mb-6 text-xs sm:text-sm font-semibold text-tyrian-800">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Simple & Secure
            </div>
            <h2 className="text-fluid-4xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
              How It Works
            </h2>
            <p className="text-fluid-sm sm:text-fluid-base text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              Getting started is simple. Create an account, browse anonymously, and shop with complete confidence.
            </p>
          </div>

          {/* Bento Grid for Steps */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 md:gap-5">
            {/* Step 1 - Large Card */}
            <div className="lg:col-span-6 group relative glass-frosted rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 depth-shadow-md sm:hover:depth-shadow-xl transition-all duration-500 sm:hover:-translate-y-2 active:scale-[0.99] overflow-hidden">
              {/* Glass reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-tyrian-50/20 pointer-events-none" />
              <div className="absolute -top-10 -left-10 sm:-top-20 sm:-left-20 w-32 sm:w-48 h-32 sm:h-48 bg-tyrian-400/15 rounded-full blur-3xl sm:group-hover:bg-tyrian-400/25 transition-all duration-700" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 md:w-16 sm:h-14 md:h-16 neumorphic-tyrian rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 sm:group-hover:scale-110 transition-transform duration-300">
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">1</span>
                  </div>
                  <div className="w-8 h-8 sm:w-9 md:w-10 sm:h-9 md:h-10 glass rounded-lg sm:rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-tyrian-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Sign Up Anonymously</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-1">
                  Create your account with just an email or Web3 wallet. No personal information required to start browsing.
                </p>

                <div className="mt-4 sm:mt-6 flex items-center gap-2 sm:gap-3">
                  <div className="flex gap-1 sm:gap-1.5">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-tyrian-800 rounded-full" />
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-tyrian-400 rounded-full" />
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-tyrian-200 rounded-full" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Email or Wallet</span>
                </div>
              </div>
            </div>

            {/* Step 2 - Neumorphic Card */}
            <div className="lg:col-span-6 group relative neumorphic rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 sm:hover:shadow-2xl transition-all duration-500 sm:hover:-translate-y-2 active:scale-[0.99] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-gray-100/30 pointer-events-none" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 md:w-16 sm:h-14 md:h-16 bg-gradient-to-br from-gray-700 to-gray-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-gray-700/30 sm:group-hover:scale-110 transition-transform duration-300">
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">2</span>
                  </div>
                  <div className="w-8 h-8 sm:w-9 md:w-10 sm:h-9 md:h-10 neumorphic-inset rounded-lg sm:rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Browse & Connect</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-1">
                  Explore verified listings and message sellers through our encrypted chat. Your conversations stay completely private.
                </p>

                <div className="mt-4 sm:mt-6 flex items-center gap-2 sm:gap-3">
                  <div className="flex gap-1 sm:gap-1.5">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-700 rounded-full" />
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-400 rounded-full" />
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-200 rounded-full" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-400 font-medium">End-to-end encrypted</span>
                </div>
              </div>
            </div>

            {/* Step 3 - Glass Light Card */}
            <div className="lg:col-span-5 group relative glass-light rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 depth-shadow-md sm:hover:depth-shadow-xl transition-all duration-500 sm:hover:-translate-y-2 active:scale-[0.99] overflow-hidden">
              <div className="absolute inset-0 glass-reflection pointer-events-none opacity-40 hidden sm:block" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 md:w-16 sm:h-14 md:h-16 bg-gradient-to-br from-tyrian-700 to-tyrian-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-tyrian-700/30 sm:group-hover:scale-110 transition-transform duration-300">
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">3</span>
                  </div>
                  <div className="w-8 h-8 sm:w-9 md:w-10 sm:h-9 md:h-10 glass rounded-lg sm:rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-tyrian-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Secure Payment</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-1">
                  Complete your purchase with our secure escrow system. Payments are protected until you confirm delivery.
                </p>

                <div className="mt-4 sm:mt-6 flex items-center gap-2 sm:gap-3">
                  <div className="flex gap-1 sm:gap-1.5">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-tyrian-700 rounded-full" />
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-tyrian-400 rounded-full" />
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-tyrian-200 rounded-full" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Escrow protected</span>
                </div>
              </div>
            </div>

            {/* Step 4 - Dark Glass Card */}
            <div className="lg:col-span-7 group relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 depth-shadow-lg sm:hover:depth-shadow-xl transition-all duration-500 sm:hover:-translate-y-2 active:scale-[0.99]"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 0, 43, 0.95) 0%, rgba(45, 0, 19, 0.98) 100%)',
              }}>
              {/* Liquid glass overlay */}
              <div className="absolute inset-0 opacity-30" style={{
                background: 'radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
              }} />
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }} />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 md:gap-8 h-full">
                <div className="flex-1">
                  <div className="flex items-start gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-14 md:w-16 sm:h-14 md:h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl sm:group-hover:scale-110 transition-transform duration-300">
                      <span className="text-lg sm:text-xl md:text-2xl font-bold text-tyrian-800">4</span>
                    </div>
                    <div className="w-8 h-8 sm:w-9 md:w-10 sm:h-9 md:h-10 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center border border-white/20">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">Discreet Delivery</h3>
                  <p className="text-sm sm:text-base text-tyrian-100/90 leading-relaxed">
                    Receive your items in plain, unmarked packaging. No external labels or branding reveal the contents.
                  </p>

                  <div className="mt-4 sm:mt-6 flex items-center gap-2 sm:gap-3">
                    <div className="flex gap-1 sm:gap-1.5">
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full" />
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-tyrian-300 rounded-full" />
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-tyrian-500 rounded-full" />
                    </div>
                    <span className="text-[10px] sm:text-xs text-tyrian-200 font-medium">Plain packaging</span>
                  </div>
                </div>

                {/* Completion badge */}
                <div className="flex-shrink-0 self-end sm:self-auto">
                  <div className="w-14 h-14 sm:w-16 md:w-20 sm:h-16 md:h-20 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/20 glow-pulse">
                    <svg className="w-7 h-7 sm:w-8 md:w-10 sm:h-8 md:h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA - Full Width Glass Card */}
            <div className="lg:col-span-12 glass-frosted rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 depth-shadow-md">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-11 h-11 sm:w-12 md:w-14 sm:h-12 md:h-14 neumorphic rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 md:w-7 sm:h-6 md:h-7 text-tyrian-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-gray-900 font-bold text-base sm:text-lg">Coming Soon</p>
                    <p className="text-gray-600 text-sm sm:text-base">Our privacy-first marketplace is launching soon.</p>
                  </div>
                </div>
                <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] neumorphic-tyrian text-white rounded-xl sm:rounded-2xl font-semibold whitespace-nowrap active:scale-[0.98] transition-transform">
                  Stay Tuned
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer - Liquid Glass Design */}
      <footer className="relative mt-16 sm:mt-20 md:mt-24 overflow-hidden safe-area-bottom">
        {/* Glass background */}
        <div className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(45, 0, 19, 0.95) 0%, rgba(45, 0, 19, 0.99) 100%)',
          }} />

        {/* Decorative orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 sm:-top-20 left-1/4 w-[150px] sm:w-[300px] h-[150px] sm:h-[300px] rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(99, 0, 43, 0.4) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }} />
          <div className="absolute -bottom-10 sm:-bottom-20 right-1/4 w-[125px] sm:w-[250px] h-[125px] sm:h-[250px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(176, 24, 63, 0.3) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }} />
        </div>

        <div className="relative z-10 py-8 sm:py-10 md:py-12">
          <div className="max-w-7xl mx-auto container-safe">
            <div className="flex flex-col items-center">
              {/* Logo */}
              <div className="mb-4 sm:mb-6">
                <Image
                  src="/logos/white-with-name.svg"
                  alt="Lycusa"
                  width={120}
                  height={35}
                  className="h-7 sm:h-8 w-auto opacity-90"
                  unoptimized
                />
              </div>

              {/* Glass divider */}
              <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-tyrian-400/50 to-transparent mb-4 sm:mb-6" />

              {/* Tagline */}
              <p className="text-tyrian-200/80 text-xs sm:text-sm mb-5 sm:mb-6 text-center max-w-md px-4">
                The privacy-first marketplace for discreet shopping.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[10px] sm:text-xs text-tyrian-100/80">E2E Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[10px] sm:text-xs text-tyrian-100/80">Secure Escrow</span>
                </div>
              </div>

              {/* Copyright */}
              <p className="text-xs sm:text-sm text-tyrian-300/60">
                © 2025 Lycusa. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Email Subscription Modal */}
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
            isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={closeModal}
        />

        {/* Modal */}
        <div
          className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 ${
            isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div
            className={`relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] sm:max-h-[85vh] overflow-y-auto safe-area-bottom transition-transform duration-300 ${
              isModalOpen ? 'translate-y-0' : 'translate-y-full sm:translate-y-0 sm:scale-95'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag handle indicator */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-10 h-10 min-h-[44px] min-w-[44px] rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors flex items-center justify-center group touch-target"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Decorative Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-48 sm:w-80 h-48 sm:h-80 rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, rgba(99, 0, 43, 0.3) 0%, transparent 70%)',
                  filter: 'blur(60px)',
                }}
              />
              <div
                className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-48 sm:w-80 h-48 sm:h-80 rounded-full opacity-15"
                style={{
                  background: 'radial-gradient(circle, rgba(214, 146, 174, 0.3) 0%, transparent 70%)',
                  filter: 'blur(60px)',
                }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 p-5 pt-2 sm:p-8 md:p-12 sm:pt-8 md:pt-12">
              <div className="text-center mb-6 sm:mb-8">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-tyrian-700 to-tyrian-600 mb-4 sm:mb-6 shadow-lg shadow-tyrian-700/30">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                {/* Heading */}
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
                  Get Early Access
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed max-w-lg mx-auto">
                  Be the first to know when Lycusa launches. Get exclusive updates and early access to our privacy-first marketplace.
                </p>
              </div>

              {/* Email Collector */}
              <div className="flex justify-center mb-5 sm:mb-6">
                <EmailCollector
                  source="signin_modal"
                  placeholder="your@email.com"
                  buttonText="Get Early Access"
                  successMessage="You're on the list! We'll notify you when we launch."
                  onSuccess={() => {
                    setTimeout(() => {
                      closeModal();
                    }, 2000);
                  }}
                  onError={(error) => {
                    console.error('Subscription error:', error);
                  }}
                />
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>No spam, ever</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Unsubscribe anytime</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Privacy first</span>
                </div>
              </div>

              {/* Skip Link */}
              <div className="mt-5 sm:mt-6 text-center pb-2 sm:pb-0">
                <button
                  onClick={closeModal}
                  className="text-sm text-gray-500 hover:text-gray-700 active:text-gray-800 transition-colors underline min-h-[44px] px-4"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    </AppBackground>
  );
}
