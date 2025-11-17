'use client';

import Link from 'next/link';
import { useAuth } from './components/auth/AuthGuard';
import LogoutButton from './components/auth/LogoutButton';

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Lycusa</h1>
            <nav className="flex items-center gap-4">
              {loading ? (
                <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
              ) : isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">
                    {user?.email || user?.walletAddress?.slice(0, 6) + '...' + user?.walletAddress?.slice(-4)}
                  </span>
                  <LogoutButton className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm" />
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Lycusa
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your marketplace for second-hand clothing. Buy and sell pre-loved fashion with ease.
          </p>

          {!loading && (
            <>
              {isAuthenticated ? (
                <div className="space-y-6">
                  <div className="inline-block bg-green-50 border border-green-200 rounded-lg p-6">
                    <p className="text-green-800 font-medium mb-2">You're signed in!</p>
                    <p className="text-green-600 text-sm">
                      {user?.email && `Email: ${user.email}`}
                      {user?.walletAddress && `Wallet: ${user.walletAddress}`}
                    </p>
                    {user?.role && (
                      <p className="text-green-600 text-sm mt-1">Role: {user.role}</p>
                    )}
                  </div>
                  <div className="flex gap-4 justify-center">
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      Browse Items
                    </button>
                    <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                      Sell an Item
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/signup"
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/signin"
                    className="px-8 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors font-medium text-lg"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Shopping</h3>
            <p className="text-gray-600">Browse through thousands of pre-loved clothing items</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payments</h3>
            <p className="text-gray-600">Pay with email authentication or crypto wallet</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sustainable</h3>
            <p className="text-gray-600">Give clothes a second life and reduce waste</p>
          </div>
        </div>
      </main>
    </div>
  );
}
