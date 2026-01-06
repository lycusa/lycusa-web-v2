"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/auth/AuthGuard";
import { getUserKycStatus } from "@/app/lib/api";
import { AppBackground, Header } from "@/app/components/layout";
import { ZkpassportVerification } from "@/app/components/zkpassport";

export default function KycPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [kycStatus, setKycStatus] = useState<boolean | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [verified, setVerified] = useState(false);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  // Check current KYC status
  useEffect(() => {
    const checkKycStatus = async () => {
      if (!user?.id) return;

      try {
        const response = await getUserKycStatus(user.id);
        setKycStatus(response.data?.kycStatus ?? false);
      } catch (error) {
        console.error("Failed to check KYC status:", error);
        setKycStatus(false);
      } finally {
        setCheckingStatus(false);
      }
    };

    if (user?.id) {
      checkKycStatus();
    }
  }, [user?.id]);

  const handleVerificationSuccess = () => {
    setVerified(true);
    setKycStatus(true);
  };

  const handleVerificationError = (error: Error) => {
    console.error("Verification error:", error);
  };

  // Loading state
  if (authLoading || checkingStatus) {
    return (
      <AppBackground>
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-tyrian-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AppBackground>
    );
  }

  // Already verified
  if (kycStatus && !verified) {
    return (
      <AppBackground>
        <Header />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
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

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Already Verified
            </h1>
            <p className="text-gray-600 mb-8">
              Your identity has been verified. You have full access to all
              platform features.
            </p>

            {/* Feature Access */}
            <div className="bg-green-50 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-green-900 mb-4">
                You can now:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-green-800">
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0"
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
                  List and sell products on the marketplace
                </li>
                <li className="flex items-center gap-3 text-green-800">
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0"
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
                  Purchase items from other sellers
                </li>
                <li className="flex items-center gap-3 text-green-800">
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0"
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
                  Send and receive encrypted messages
                </li>
                <li className="flex items-center gap-3 text-green-800">
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0"
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
                  Access all premium features
                </li>
              </ul>
            </div>

            <Link
              href="/products"
              className="inline-block px-8 py-4 bg-gradient-to-r from-tyrian-800 to-tyrian-600 text-white rounded-xl hover:from-tyrian-900 hover:to-tyrian-700 transition-all font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Browse Products
            </Link>
          </div>
        </main>
      </AppBackground>
    );
  }

  // Just verified - show success
  if (verified) {
    return (
      <AppBackground>
        <Header />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            {/* Celebration Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <svg
                className="w-12 h-12 text-green-600"
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

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Verification Complete!
            </h1>
            <p className="text-gray-600 mb-8">
              Congratulations! Your age has been verified using ZKPassport.
              You now have full access to all platform features.
            </p>

            {/* Privacy Notice */}
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5"
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
                <p className="text-sm text-purple-900 text-left">
                  <strong>Your privacy is protected.</strong> Only the fact that
                  you are 18+ was verified. Your birthdate, ID number, and other
                  personal information were never shared.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="px-8 py-4 bg-gradient-to-r from-tyrian-800 to-tyrian-600 text-white rounded-xl hover:from-tyrian-900 hover:to-tyrian-700 transition-all font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Start Shopping
              </Link>
              <Link
                href="/profile"
                className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                Go to Profile
              </Link>
            </div>
          </div>
        </main>
      </AppBackground>
    );
  }

  // Main verification flow
  return (
    <AppBackground>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Age Verification
            </h1>
            <p className="text-gray-600">
              Verify your age to unlock full access to the marketplace
            </p>
          </div>

          {/* Why Verification Section */}
          <div className="mb-8 p-4 bg-zinc-50 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Why do we need verification?
            </h3>
            <p className="text-sm text-gray-600">
              To ensure a safe and trusted marketplace, we require age
              verification for buying and selling. This helps protect all users
              and comply with regulations.
            </p>
          </div>

          {/* ZKPassport Verification Component */}
          {user?.id && (
            <ZkpassportVerification
              userUuid={user.id}
              onVerified={handleVerificationSuccess}
              onError={handleVerificationError}
            />
          )}

          {/* Back Link */}
          <div className="mt-8 text-center">
            <Link
              href="/profile"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Back to Profile
            </Link>
          </div>
        </div>
      </main>
    </AppBackground>
  );
}
