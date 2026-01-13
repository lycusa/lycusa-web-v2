"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppBackground } from "./components/layout";
import EmailCollector from "./components/shared/EmailCollector";
import LanguageSwitcher from "./components/shared/LanguageSwitcher";
import { I18nProvider, useI18n } from "./lib/i18n/i18nContext";

function HomeContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useI18n();

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      // Lock body scroll when modal is open
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Restore body scroll
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    };
  }, [isModalOpen, closeModal]);

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
              <LanguageSwitcher />
              <button
                onClick={openModal}
                className="px-4 sm:px-5 py-2.5 sm:py-2.5 min-h-[44px] neumorphic-tyrian text-white rounded-xl active:scale-[0.98] sm:hover:scale-105 transition-all text-sm font-semibold glow-tyrian touch-target"
              >
                {t('header.signIn')}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - 2025 Creative Design */}
      <main className="max-w-7xl mx-auto container-safe pt-6 pb-12 sm:pt-8 sm:pb-16 md:pt-12 md:pb-20 snap-section-hero">
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
                {t('hero.badge')}
              </div>

              <h1 className="text-fluid-hero font-bold text-white leading-[1.1] tracking-tight mb-4 sm:mb-6">
                {t('hero.title1')}
                <br />
                {t('hero.title2')}
                <br />
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-tyrian-200 via-white to-tyrian-200">{t('hero.title3')}</span>
                </span>
              </h1>

              <p className="text-fluid-sm sm:text-fluid-base text-tyrian-100/80 leading-relaxed max-w-md">
                {t('hero.description')}
              </p>

              {/* Scroll to How It Works button */}
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-6 sm:mt-8 inline-flex items-center gap-2 px-4 py-2 text-tyrian-100/90 hover:text-white transition-colors group"
              >
                <span className="text-sm font-medium">Discover more</span>
                <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>

            {/* CTAs hidden for marketing landing page */}
          </div>

          {/* Right Side - Bento Grid with Glass Effects */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">

            {/* Feature Card 1 - Turn clothes into income - Glass Frosted */}
            <div className="group col-span-2 glass-frosted rounded-xl sm:rounded-2xl p-4 sm:p-6 depth-shadow-md sm:hover:depth-shadow-lg transition-all duration-300 sm:hover:-translate-y-1 active:scale-[0.99] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-tyrian-400/10 rounded-full blur-3xl sm:group-hover:bg-tyrian-400/20 transition-all"></div>
              <div className="absolute inset-0 glass-reflection pointer-events-none opacity-30 hidden sm:block"></div>
              <div className="relative z-10 flex items-start gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-14 sm:h-14 neumorphic-tyrian rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 sm:group-hover:scale-110 transition-transform">
                  {/* Coin/Sparkle icon for income/earnings */}
                  <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-0.5 sm:mb-1">{t('features.anonymousShopping.title')}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-snug">{t('features.anonymousShopping.description')}</p>
                </div>
              </div>
            </div>

            {/* Feature Card 2 - Find items with story/feeling - Dark Glass */}
            <div className="group rounded-xl sm:rounded-2xl p-4 sm:p-5 depth-shadow-md sm:hover:depth-shadow-lg transition-all duration-300 sm:hover:-translate-y-1 active:scale-[0.99] relative overflow-hidden min-h-[120px] sm:min-h-[140px]"
              style={{
                background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.95) 0%, rgba(31, 31, 31, 0.98) 100%)',
              }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
              <div className="absolute inset-0 opacity-30" style={{
                background: 'radial-gradient(ellipse at 20% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)',
              }}></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 sm:group-hover:scale-110 transition-transform border border-white/20">
                  {/* Sparkles/Touch icon for feeling/story */}
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-bold text-white text-sm mb-1 sm:mb-1.5">{t('features.encrypted.title')}</h3>
                <p className="text-[11px] sm:text-xs text-gray-300/80 leading-relaxed line-clamp-3 sm:line-clamp-none">{t('features.encrypted.subtitle')}</p>
              </div>
            </div>

            {/* Feature Card 3 - Private by default - Neumorphic */}
            <div className="group neumorphic rounded-xl sm:rounded-2xl p-4 sm:p-5 sm:hover:shadow-2xl transition-all duration-300 sm:hover:-translate-y-1 active:scale-[0.99] relative overflow-hidden min-h-[120px] sm:min-h-[140px]">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/40 to-gray-100/20 pointer-events-none"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-9 h-9 sm:w-10 sm:h-10 neumorphic-inset rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 sm:group-hover:scale-110 transition-transform">
                  {/* Eye-off icon for privacy */}
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1 sm:mb-1.5">{t('features.delivery.title')}</h3>
                <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed line-clamp-3 sm:line-clamp-none">{t('features.delivery.subtitle')}</p>
              </div>
            </div>

            {/* Feature Card 4 - Built on Trust - Glass Light */}
            <div className="group col-span-2 glass-light rounded-xl sm:rounded-2xl p-4 sm:p-5 depth-shadow-md sm:hover:depth-shadow-lg transition-all duration-300 sm:hover:-translate-y-1 active:scale-[0.99] relative overflow-hidden">
              <div className="absolute inset-0 glass-reflection pointer-events-none opacity-30 hidden sm:block"></div>
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-tyrian-700 to-tyrian-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-tyrian-700/25 sm:group-hover:scale-110 transition-transform flex-shrink-0">
                    {/* Users verification icon */}
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">{t('features.escrow.title')}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{t('features.escrow.subtitle')}</p>
                  </div>
                </div>
                {/* Simplified badge - verification indicator */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-tyrian-50 rounded-full self-end sm:self-auto">
                  <svg className="w-3.5 h-3.5 text-tyrian-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[10px] sm:text-xs font-medium text-tyrian-700">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Authenticated User State hidden for marketing landing page */}

        {/* How It Works Section - Bento Glass Grid */}
        <div id="how-it-works" className="mt-12 sm:mt-16 md:mt-20 relative snap-section-content">
          {/* Decorative background elements with liquid glass effect */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/4 -left-16 sm:-left-32 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-3xl animate-float-slow"
              style={{ background: 'radial-gradient(circle, rgba(99, 0, 43, 0.08) 0%, transparent 70%)' }} />
            <div className="absolute bottom-1/4 -right-16 sm:-right-32 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full blur-3xl animate-float"
              style={{ background: 'radial-gradient(circle, rgba(214, 146, 174, 0.1) 0%, transparent 70%)', animationDelay: '2s' }} />
          </div>

          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h2 className="text-fluid-4xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
              {t('howItWorks.title')}
            </h2>
            <p className="text-fluid-sm sm:text-fluid-base text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              {t('howItWorks.description')}
            </p>
          </div>

          {/* Bento Grid - Full Width & Modern */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
            {/* Card 1 - Join Early - Glass Frosted */}
            <div className="lg:col-span-6 group relative glass-frosted rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 depth-shadow-md sm:hover:depth-shadow-xl transition-all duration-500 sm:hover:-translate-y-1 active:scale-[0.99] overflow-hidden">
              {/* Glass reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-tyrian-50/20 pointer-events-none" />
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-tyrian-400/15 rounded-full blur-3xl sm:group-hover:bg-tyrian-400/25 transition-all duration-700" />

              <div className="relative z-10 flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 neumorphic-tyrian rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 sm:group-hover:scale-110 transition-transform duration-300">
                  {/* User/Join icon */}
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5">{t('howItWorks.step1.title')}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {t('howItWorks.step1.description')}
                  </p>
                  <span className="inline-block mt-2 text-[10px] sm:text-xs text-tyrian-600 font-medium bg-tyrian-50 px-2 py-0.5 rounded-full">{t('howItWorks.step1.hint')}</span>
                </div>
              </div>
            </div>

            {/* Card 2 - List Items - Neumorphic */}
            <div className="lg:col-span-6 group relative neumorphic rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 sm:hover:shadow-2xl transition-all duration-500 sm:hover:-translate-y-1 active:scale-[0.99] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-gray-100/30 pointer-events-none" />

              <div className="relative z-10 flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-700 to-gray-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-gray-700/30 sm:group-hover:scale-110 transition-transform duration-300">
                  {/* Camera/Upload icon */}
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5">{t('howItWorks.step2.title')}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {t('howItWorks.step2.description')}
                  </p>
                  <span className="inline-block mt-2 text-[10px] sm:text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">{t('howItWorks.step2.hint')}</span>
                </div>
              </div>
            </div>

            {/* Card 3 - Browse/Choose - Glass Light */}
            <div className="lg:col-span-5 group relative glass-light rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 depth-shadow-md sm:hover:depth-shadow-xl transition-all duration-500 sm:hover:-translate-y-1 active:scale-[0.99] overflow-hidden">
              <div className="absolute inset-0 glass-reflection pointer-events-none opacity-40 hidden sm:block" />

              <div className="relative z-10 flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-tyrian-700 to-tyrian-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-tyrian-700/30 sm:group-hover:scale-110 transition-transform duration-300">
                  {/* Heart/Like icon for browsing preferences */}
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5">{t('howItWorks.step3.title')}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {t('howItWorks.step3.description')}
                  </p>
                  <span className="inline-block mt-2 text-[10px] sm:text-xs text-tyrian-600 font-medium bg-tyrian-50 px-2 py-0.5 rounded-full">{t('howItWorks.step3.hint')}</span>
                </div>
              </div>
            </div>

            {/* Card 4 - Connection - Dark Glass (No checkmarks) */}
            <div className="lg:col-span-7 group relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 depth-shadow-lg sm:hover:depth-shadow-xl transition-all duration-500 sm:hover:-translate-y-1 active:scale-[0.99]"
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

              <div className="relative z-10 flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20 sm:group-hover:scale-110 transition-transform duration-300">
                  {/* Link/Connection icon */}
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">{t('howItWorks.step4.title')}</h3>
                  <p className="text-sm sm:text-base text-tyrian-100/90 leading-relaxed">
                    {t('howItWorks.step4.description')}
                  </p>
                  <span className="inline-block mt-2 text-[10px] sm:text-xs text-tyrian-200 font-medium bg-white/10 px-2 py-0.5 rounded-full border border-white/10">{t('howItWorks.step4.hint')}</span>
                </div>
              </div>
            </div>

            {/* Bottom CTA - Full Width Glass Card */}
            <div className="lg:col-span-12 glass-frosted rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 depth-shadow-md">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 neumorphic rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-tyrian-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-gray-900 font-bold text-base sm:text-lg">{t('howItWorks.cta.title')}</p>
                    <p className="text-gray-600 text-sm sm:text-base">{t('howItWorks.cta.description')}</p>
                  </div>
                </div>
                <button
                  onClick={openModal}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] neumorphic-tyrian text-white rounded-xl sm:rounded-2xl font-semibold whitespace-nowrap active:scale-[0.98] transition-transform text-base"
                >
                  {t('howItWorks.cta.button')}
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
                {t('footer.tagline')}
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[10px] sm:text-xs text-tyrian-100/80">{t('footer.badges.encrypted')}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[10px] sm:text-xs text-tyrian-100/80">{t('footer.badges.escrow')}</span>
                </div>
              </div>

              {/* Copyright */}
              <p className="text-xs sm:text-sm text-tyrian-300/60">
                {t('footer.copyright')}
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Email Subscription Modal */}
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          onClick={closeModal}
        />

        {/* Modal */}
        <div
          className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
        >
          <div
            className={`relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] sm:max-h-[85vh] overflow-y-auto safe-area-bottom transition-transform duration-300 ${isModalOpen ? 'translate-y-0' : 'translate-y-full sm:translate-y-0 sm:scale-95'
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
                  {t('modal.title')}
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed max-w-lg mx-auto">
                  {t('modal.description')}
                </p>
              </div>

              {/* Email Collector */}
              <div className="flex justify-center mb-5 sm:mb-6">
                <EmailCollector
                  source="signin_modal"
                  placeholder={t('modal.placeholder')}
                  buttonText={t('modal.button')}
                  successMessage={t('modal.successMessage')}
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
                  <span>{t('modal.trust.noSpam')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{t('modal.trust.unsubscribe')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{t('modal.trust.privacy')}</span>
                </div>
              </div>

              {/* Skip Link */}
              <div className="mt-5 sm:mt-6 text-center pb-2 sm:pb-0">
                <button
                  onClick={closeModal}
                  className="text-sm text-gray-500 hover:text-gray-700 active:text-gray-800 transition-colors underline min-h-[44px] px-4"
                >
                  {t('modal.skip')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    </AppBackground>
  );
}

export default function Home() {
  return (
    <I18nProvider>
      <HomeContent />
    </I18nProvider>
  );
}
