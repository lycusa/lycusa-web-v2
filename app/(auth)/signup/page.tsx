"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import EmailAuth from "@/app/components/auth/EmailAuth";
import WalletAuth from "@/app/components/auth/WalletAuth";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<"email" | "wallet">("email");

  const handleAuthSuccess = () => {
    // Redirect to home page after successful registration
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  const handleAuthError = (error: string) => {
    console.error("Registration error:", error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-tyrian-50 to-slate-50 px-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-tyrian-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-400/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-tyrian-400/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <Image
              src="/logos/tyrian-purple-with-word.svg"
              alt="Lycusa"
              width={160}
              height={48}
              className="h-12 w-auto mx-auto group-hover:scale-105 transition-transform"
              priority
            />
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-900/10 border border-white/20 p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Create Account
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Join Lycusa marketplace today
            </p>
          </div>

          {/* Auth Method Toggle */}
          <div className="relative mb-8">
            <div className="flex gap-2 bg-gray-100/80 p-1.5 rounded-xl backdrop-blur-sm">
              <button
                onClick={() => setAuthMethod("email")}
                className={`relative flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  authMethod === "email"
                    ? "bg-white text-tyrian-800 shadow-md"
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
                    ? "bg-white text-brand-500 shadow-md"
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

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-semibold text-tyrian-800 hover:text-tyrian-900 transition-colors underline-offset-2 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { icon: "🔒", text: "Secure" },
            { icon: "⚡", text: "Fast" },
            { icon: "🌍", text: "Global" },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center border border-white/40 hover:bg-white/80 transition-all"
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs font-medium text-gray-700">
                {item.text}
              </div>
            </div>
          ))}
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
