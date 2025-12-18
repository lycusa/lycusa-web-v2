// User Service Types

// User Entity
export interface User {
  id: string;
  email?: string;
  address?: string;
  role: "user" | "admin";
  createdAt: string;
  kycStatus?: boolean;
}

// User Profile Entity
export interface UserProfile {
  userId: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// User with Profile (combined for convenience)
export interface UserWithProfile extends User {
  profile?: UserProfile;
}

// Relationship Status
export interface RelationshipStatus {
  isFollowing: boolean;
  isFollowedBy: boolean;
  isBlocking: boolean;
  isBlockedBy: boolean;
}

// User Relationship Entity
export interface UserRelationship {
  id: string;
  followerId: string;
  followingId: string;
  type: "FOLLOW" | "BLOCK";
  createdAt: string;
}

// Follower/Following User with Profile
export interface RelatedUser {
  id: string;
  email?: string;
  address?: string;
  profile?: UserProfile;
}

// Create Profile Request
export interface CreateUserProfileRequest {
  username: string;
  bio?: string;
  avatarUrl?: string;
}

// Update Profile Request
export interface UpdateUserProfileRequest {
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface GetUserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export interface GetUserResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface FollowUserResponse {
  success: boolean;
  message: string;
  relationship?: UserRelationship;
}

export interface UnfollowUserResponse {
  success: boolean;
  message: string;
}

export interface BlockUserResponse {
  success: boolean;
  message: string;
  relationship?: UserRelationship;
}

export interface CheckRelationshipResponse {
  success: boolean;
  message: string;
  data: RelationshipStatus;
}

export interface GetFollowersResponse {
  success: boolean;
  message: string;
  data: RelatedUser[];
}

export interface GetFollowingResponse {
  success: boolean;
  message: string;
  data: RelatedUser[];
}

export interface GetKycStatusResponse {
  success: boolean;
  message: string;
  data: {
    kycStatus: boolean;
  };
}

// User Stats (for profile display)
export interface UserStats {
  followersCount: number;
  followingCount: number;
  productsCount?: number;
  ratingsCount?: number;
  averageRating?: number;
}

// Profile form data
export interface ProfileFormData {
  username: string;
  bio: string;
  avatarUrl: string;
}
