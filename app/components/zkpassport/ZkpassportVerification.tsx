"use client";

import { useState } from "react";
import { useZkpassportVerification } from "@/app/hooks/useZkpassportVerification";
import ZkpassportQRCode from "./ZkpassportQRCode";
import ZkpassportStatusBadge from "./ZkpassportStatusBadge";

interface ZkpassportVerificationProps {
  userUuid: string;
  onVerified?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Main ZKPassport verification component
 * Orchestrates the complete verification flow:
 * 1. Initial state with start button
 * 2. QR code display with status polling
 * 3. Success/failure states with appropriate actions
 */
export default function ZkpassportVerification({
  userUuid,
  onVerified,
  onError,
}: ZkpassportVerificationProps) {
  const [hasStarted, setHasStarted] = useState(false);

  const {
    session,
    status,
    isLoading,
    isPolling,
    error,
    startVerification,
    resetVerification,
  } = useZkpassportVerification({
    userUuid,
    pollInterval: 2000,
    onSuccess: (status) => {
      onVerified?.();
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  const handleStart = async () => {
    setHasStarted(true);
    await startVerification();
  };

  const handleRetry = () => {
    resetVerification();
    setHasStarted(false);
  };

  // Initial state - show start button
  if (!hasStarted) {
    return (
      <div className="text-center">
        {/* ZKPassport Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Privacy-First Age Verification
        </h2>

        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Verify your age using ZKPassport's zero-knowledge proof technology.
          Your personal data never leaves your phone.
        </p>

        {/* Benefits */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left max-w-md mx-auto">
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-green-600"
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
              <span>
                <strong>Privacy Protected</strong> - Only proves you're 18+,
                nothing more
              </span>
            </li>
            <li className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-green-600"
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
              <span>
                <strong>Secure</strong> - Zero-knowledge cryptographic proof
              </span>
            </li>
            <li className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-green-600"
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
              <span>
                <strong>Fast</strong> - Complete verification in seconds
              </span>
            </li>
          </ul>
        </div>

        {/* Requirements */}
        <div className="text-sm text-gray-500 mb-6">
          <p>
            You'll need the{" "}
            <a
              href="https://zkpassport.id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ZKPassport app
            </a>{" "}
            on your phone
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={isLoading}
          className="w-full max-w-md px-8 py-4 bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-xl hover:from-purple-800 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating session...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              Start Verification
            </span>
          )}
        </button>
      </div>
    );
  }

  // Error state
  if (error && !session) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Unable to Start Verification
        </h3>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <button
          onClick={handleRetry}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Loading state
  if (isLoading || !session) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Creating verification session...</p>
      </div>
    );
  }

  // Verification in progress
  return (
    <div className="space-y-6">
      {/* Status Badge */}
      {status && (
        <ZkpassportStatusBadge status={status.status} isPolling={isPolling} />
      )}

      {/* QR Code (only show when pending) */}
      {status?.status === "pending" && (
        <div className="flex justify-center">
          <ZkpassportQRCode session={session} status={status} />
        </div>
      )}

      {/* Success state */}
      {status?.status === "verified" && (
        <div className="text-center py-4">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Age Verified Successfully!
          </h3>
          <p className="text-gray-600">
            You now have full access to all platform features.
          </p>
        </div>
      )}

      {/* Failure states with retry */}
      {(status?.status === "rejected" ||
        status?.status === "expired" ||
        status?.status === "error") && (
        <div className="text-center py-4">
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-gradient-to-r from-tyrian-800 to-tyrian-600 text-white rounded-xl hover:from-tyrian-900 hover:to-tyrian-700 transition-all font-semibold"
          >
            Try Again
          </button>
        </div>
      )}

      {/* App download links */}
      {status?.status === "pending" && (
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-3">
            Don't have the ZKPassport app?
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://apps.apple.com/app/zkpassport"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              App Store
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=app.zkpassport.zkpassport"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              Google Play
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
