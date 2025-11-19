"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EmailAuth from "@/app/components/auth/EmailAuth";
import WalletAuth from "@/app/components/auth/WalletAuth";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<"email" | "wallet">("email");

  const handleAuthSuccess = () => {
    // Redirect to home page after successful authentication
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  const handleAuthError = (error: string) => {
    console.error("Authentication error:", error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all group-hover:scale-105">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Lycusa
            </span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-900/10 border border-white/20 p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Sign in to continue to your account
            </p>
          </div>

          {/* Auth Method Toggle */}
          <div className="relative mb-8">
            <div className="flex gap-2 bg-gray-100/80 p-1.5 rounded-xl backdrop-blur-sm">
              <button
                onClick={() => setAuthMethod("email")}
                className={`relative flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  authMethod === "email"
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Email
                </span>
              </button>
              <button
                onClick={() => setAuthMethod("wallet")}
                className={`relative flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  authMethod === "wallet"
                    ? "bg-white text-purple-600 shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM12 17.5l-5-5h3v-5h4v5h3l-5 5z" />
                  </svg>
                  Wallet
                </span>
              </button>
            </div>
          </div>

          {/* Auth Component */}
          <div className="mb-8">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {authMethod === "email" ? (
                <EmailAuth
                  onSuccess={handleAuthSuccess}
                  onError={handleAuthError}
                />
              ) : (
                <WalletAuth
                  onSuccess={handleAuthSuccess}
                  onError={handleAuthError}
                />
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-500 font-medium">
                Or
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors underline-offset-2 hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-xs text-gray-500 px-4">
            By continuing, you agree to our{" "}
            <a href="#" className="text-gray-700 hover:text-gray-900 underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-gray-700 hover:text-gray-900 underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
