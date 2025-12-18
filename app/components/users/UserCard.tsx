"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/components/auth/AuthGuard";
import { followUser, unfollowUser, checkUserRelationship } from "@/app/lib/api";
import type { RelatedUser, RelationshipStatus } from "@/app/lib/types/user";

interface UserCardProps {
  user: RelatedUser;
  showFollowButton?: boolean;
  initialRelationship?: RelationshipStatus | null;
  onFollowChange?: (userId: string, isFollowing: boolean) => void;
}

export default function UserCard({
  user,
  showFollowButton = true,
  initialRelationship = null,
  onFollowChange,
}: UserCardProps) {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [relationship, setRelationship] = useState<RelationshipStatus | null>(
    initialRelationship
  );
  const [actionLoading, setActionLoading] = useState(false);
  const [checkingRelationship, setCheckingRelationship] = useState(
    showFollowButton && !initialRelationship && isAuthenticated
  );

  const isOwnProfile = currentUser?.id === user.id;

  // Check relationship on mount if not provided
  useState(() => {
    if (showFollowButton && !initialRelationship && isAuthenticated && !isOwnProfile) {
      checkUserRelationship(user.id)
        .then((response) => {
          if (response.success && response.data) {
            setRelationship(response.data);
          }
        })
        .catch(console.error)
        .finally(() => setCheckingRelationship(false));
    } else {
      setCheckingRelationship(false);
    }
  });

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) return;

    try {
      setActionLoading(true);
      const response = await followUser(user.id);

      if (response.success) {
        setRelationship((prev) => ({
          ...prev!,
          isFollowing: true,
        }));
        onFollowChange?.(user.id, true);
      }
    } catch (err: any) {
      console.error("Failed to follow user:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setActionLoading(true);
      const response = await unfollowUser(user.id);

      if (response.success) {
        setRelationship((prev) => ({
          ...prev!,
          isFollowing: false,
        }));
        onFollowChange?.(user.id, false);
      }
    } catch (err: any) {
      console.error("Failed to unfollow user:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const displayName = user.profile?.username || "Anonymous User";
  const displayIdentifier =
    user.email || (user.address ? `${user.address.slice(0, 10)}...${user.address.slice(-8)}` : null);

  return (
    <Link
      href={`/users/${user.id}`}
      className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group"
    >
      {/* Avatar */}
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform shadow-md">
        {user.profile?.avatarUrl ? (
          <img
            src={user.profile.avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg
            className="w-7 h-7 text-gray-500"
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

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-tyrian-800 transition-colors truncate">
            {displayName}
          </h3>
          {relationship?.isFollowedBy && !isOwnProfile && (
            <span className="text-xs px-2 py-0.5 bg-tyrian-100 text-tyrian-700 rounded-full flex-shrink-0">
              Follows you
            </span>
          )}
        </div>
        {user.profile?.bio && (
          <p className="text-sm text-gray-600 truncate">{user.profile.bio}</p>
        )}
        {!user.profile && displayIdentifier && (
          <p className="text-sm text-gray-500 truncate">{displayIdentifier}</p>
        )}
      </div>

      {/* Follow Button */}
      {showFollowButton && isAuthenticated && !isOwnProfile && (
        <div className="flex-shrink-0">
          {checkingRelationship ? (
            <div className="w-24 h-9 bg-gray-200 animate-pulse rounded-lg"></div>
          ) : relationship?.isBlocking ? (
            <span className="px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg">
              Blocked
            </span>
          ) : relationship?.isBlockedBy ? (
            <span className="px-3 py-1.5 text-sm text-gray-500 bg-gray-100 rounded-lg">
              Unavailable
            </span>
          ) : relationship?.isFollowing ? (
            <button
              onClick={handleUnfollow}
              disabled={actionLoading}
              className="px-4 py-1.5 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium disabled:opacity-50 flex items-center gap-1"
            >
              {actionLoading ? (
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Following
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleFollow}
              disabled={actionLoading}
              className="px-4 py-1.5 text-sm bg-tyrian-800 text-white rounded-lg hover:bg-tyrian-900 transition-all font-medium disabled:opacity-50"
            >
              {actionLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Follow"
              )}
            </button>
          )}
        </div>
      )}

      {/* Arrow (when not showing follow button) */}
      {!showFollowButton && (
        <div className="flex-shrink-0 text-gray-400 group-hover:text-tyrian-800 group-hover:translate-x-1 transition-all">
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      )}
    </Link>
  );
}
