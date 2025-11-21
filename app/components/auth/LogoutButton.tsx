"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearTokens, getRefreshToken } from "@/app/lib/auth";
import { logout as logoutApi } from "@/app/lib/api";

interface LogoutButtonProps {
  className?: string;
  showConfirmation?: boolean;
  redirectTo?: string;
  callBackendLogout?: boolean;
}

export default function LogoutButton({
  className = "",
  showConfirmation = false,
  redirectTo = "/signin",
  callBackendLogout = false,
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const performLogout = async () => {
    try {
      setIsLoading(true);

      // Call backend logout endpoint to invalidate refresh token if enabled
      if (callBackendLogout) {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            await logoutApi(refreshToken);
          } catch (error) {
            // Continue with logout even if backend call fails
            console.warn("Backend logout failed, continuing with client-side logout:", error);
          }
        }
      }

      // Clear authentication tokens and any auth-related data
      clearTokens();

      // Optional: Clear any other user-specific data from localStorage
      if (typeof window !== "undefined") {
        // Clear any cached user data
        const keysToRemove = Object.keys(localStorage).filter(
          (key) =>
            key.includes("user") ||
            key.includes("profile") ||
            key.includes("lycusa")
        );
        keysToRemove.forEach((key) => {
          if (!key.includes("lycusa_access_token") && !key.includes("lycusa_refresh_token")) {
            localStorage.removeItem(key);
          }
        });
      }

      // Small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Redirect to signin page
      router.push(redirectTo);
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, clear tokens and redirect
      clearTokens();
      router.push(redirectTo);
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleLogout = () => {
    if (showConfirmation) {
      setShowConfirmDialog(true);
    } else {
      performLogout();
    }
  };

  return (
    <>
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={
          className ||
          "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        }
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Logging out...
          </span>
        ) : (
          "Logout"
        )}
      </button>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirm Logout
                </h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to log out? You'll need to sign in
                  again to access your account.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={performLogout}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
