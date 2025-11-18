'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/components/auth/AuthGuard';
import {
  getUserProfile,
  checkUserRelationship,
  followUser,
  unfollowUser,
  blockUser,
} from '@/app/lib/api';

interface UserProfile {
  userId: string;
  username: string;
  bio: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface RelationshipStatus {
  isFollowing: boolean;
  isFollowedBy: boolean;
  isBlocking: boolean;
  isBlockedBy: boolean;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { user, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [relationship, setRelationship] = useState<RelationshipStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId, user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load profile
      const profileResponse = await getUserProfile(userId);
      if (profileResponse.success && profileResponse.data) {
        setProfile(profileResponse.data);
      } else {
        setError('User profile not found');
        return;
      }

      // Load relationship if authenticated and not own profile
      if (isAuthenticated && !isOwnProfile) {
        try {
          const relationshipResponse = await checkUserRelationship(userId);
          if (relationshipResponse.success && relationshipResponse.data) {
            setRelationship(relationshipResponse.data);
          }
        } catch (err) {
          console.error('Failed to load relationship:', err);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    try {
      setActionLoading(true);
      const response = await followUser(userId);

      if (response.success) {
        setRelationship((prev) => ({
          ...prev!,
          isFollowing: true,
        }));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to follow user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfollow = async () => {
    try {
      setActionLoading(true);
      const response = await unfollowUser(userId);

      if (response.success) {
        setRelationship((prev) => ({
          ...prev!,
          isFollowing: false,
        }));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to unfollow user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!confirm('Are you sure you want to block this user?')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await blockUser(userId);

      if (response.success) {
        setRelationship((prev) => ({
          ...prev!,
          isBlocking: true,
          isFollowing: false,
        }));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to block user');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This user does not exist'}</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (isOwnProfile) {
    router.push('/profile');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Lycusa
              </span>
            </Link>

            {isAuthenticated && (
              <Link
                href="/profile"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium hover:bg-gray-100 rounded-lg"
              >
                My Profile
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          {/* Cover */}
          <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

          {/* Profile Info */}
          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="absolute -top-20 left-8">
              <div className="w-40 h-40 rounded-full border-8 border-white bg-gradient-to-br from-gray-200 to-gray-300 shadow-2xl flex items-center justify-center overflow-hidden">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-20 h-20 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Username and Actions */}
            <div className="pt-24">
              <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {profile.username}
                  </h1>
                  {relationship?.isFollowedBy && (
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      Follows you
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                {isAuthenticated && !isOwnProfile && relationship && (
                  <div className="flex gap-3">
                    {!relationship.isBlocking ? (
                      <>
                        {relationship.isFollowing ? (
                          <button
                            onClick={handleUnfollow}
                            disabled={actionLoading}
                            className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-all font-medium disabled:opacity-50"
                          >
                            {actionLoading ? 'Loading...' : 'Following'}
                          </button>
                        ) : (
                          <button
                            onClick={handleFollow}
                            disabled={actionLoading}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50"
                          >
                            {actionLoading ? 'Loading...' : 'Follow'}
                          </button>
                        )}

                        <button
                          onClick={handleBlock}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-white border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all font-medium disabled:opacity-50"
                        >
                          Block
                        </button>
                      </>
                    ) : (
                      <div className="px-6 py-2 bg-red-100 text-red-700 rounded-lg font-medium">
                        Blocked
                      </div>
                    )}
                  </div>
                )}
              </div>

              {profile.bio && (
                <p className="text-gray-700 mb-6 leading-relaxed max-w-2xl">
                  {profile.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex gap-6 pt-6 border-t border-gray-200">
                <Link
                  href={`/users/${userId}/followers`}
                  className="group cursor-pointer"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">0</div>
                    <div className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">Followers</div>
                  </div>
                </Link>

                <Link
                  href={`/users/${userId}/following`}
                  className="group cursor-pointer"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">0</div>
                    <div className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">Following</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">About</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">Member Since</div>
                <div className="text-gray-900 font-medium">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
