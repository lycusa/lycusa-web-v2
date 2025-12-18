"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/auth/AuthGuard";
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
} from "@/app/lib/api";
import { AppBackground, Header } from "@/app/components/layout";
import type { UserProfile } from "@/app/lib/types/user";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/signin");
      return;
    }

    if (user?.id) {
      loadProfile();
    }
  }, [user, authLoading, isAuthenticated]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserProfile(user!.id);

      if (response.success && response.data) {
        setProfile(response.data);
        setFormData({
          username: response.data.username || "",
          bio: response.data.bio || "",
          avatarUrl: response.data.avatarUrl || "",
        });
        setIsNewProfile(false);
      } else {
        setIsNewProfile(true);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setIsNewProfile(true);
      } else {
        setError(err.response?.data?.message || "Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      setError("Username is required");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      let response;
      if (isNewProfile) {
        response = await createUserProfile(formData);
      } else {
        response = await updateUserProfile(formData);
      }

      if (response.success) {
        setSuccess(true);
        // If creating new profile, redirect to KYC, else go to profile
        setTimeout(() => {
          if (isNewProfile) {
            router.push("/kyc");
          } else {
            router.push("/profile");
          }
        }, 1500);
      } else {
        setError(response.message || "Failed to save profile");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (authLoading || loading) {
    return (
      <AppBackground>
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-tyrian-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <Header />

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Profile
          </Link>
        </div>
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isNewProfile ? "Create Your Profile" : "Edit Profile"}
            </h1>
            <p className="text-gray-600 mb-4">
              {isNewProfile
                ? "Set up your profile to get started on Lycusa"
                : "Update your profile information"}
            </p>

            {/* Progress Steps - Only show for new profile */}
            {isNewProfile && (
              <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    Profile
                  </span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-300 max-w-[80px]"></div>
                <div className="flex items-center gap-2 opacity-50">
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <span className="text-sm font-medium text-gray-500">KYC</span>
                </div>
              </div>
            )}
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="text-green-900 font-medium">
                  Profile saved successfully!
                </p>
                <p className="text-green-700 text-sm">
                  {isNewProfile
                    ? "Redirecting to KYC verification..."
                    : "Redirecting to your profile..."}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="text-red-900">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg flex items-center justify-center overflow-hidden">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-16 h-16 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length} characters
              </p>
            </div>

            {/* Avatar URL */}
            <div>
              <label
                htmlFor="avatarUrl"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Avatar URL
              </label>
              <input
                type="url"
                id="avatarUrl"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a URL to your profile picture
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-tyrian-800 to-brand-600 text-white rounded-xl hover:from-tyrian-900 hover:to-brand-700 transition-all font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : isNewProfile ? (
                  "Create Profile"
                ) : (
                  "Save Changes"
                )}
              </button>

              {!isNewProfile && (
                <Link
                  href="/profile"
                  className="px-6 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all font-semibold text-center"
                >
                  Cancel
                </Link>
              )}
            </div>
          </form>
        </div>
      </main>
    </AppBackground>
  );
}
