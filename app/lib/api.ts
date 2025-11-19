import axios from "axios";
import { getAccessToken, isTokenExpired, clearTokens } from "./auth";

// API Gateway URL - all requests go through the gateway
const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_GATEWAY_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});

// Add request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    console.log("[API Interceptor] Token:", token ? "exists" : "null");
    console.log(
      "[API Interceptor] Token expired:",
      token ? isTokenExpired(token) : "N/A"
    );
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[API Interceptor] Authorization header set");
    } else {
      console.log("[API Interceptor] No authorization header set");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear tokens and redirect to signin
      console.error("Unauthorized request");
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);

// Request OTP for email authentication
export const requestOtp = async (email: string) => {
  const response = await api.post("/auth/auth/request-otp", { email });
  return response.data;
};

// Verify OTP and get tokens
export const verifyOtp = async (email: string, otp: string) => {
  const response = await api.post("/auth/auth/verify-otp", { email, otp });
  return response.data;
};

// Get wallet challenge (SIWE message)
export const getWalletChallenge = async (
  walletAddress: string,
  domain: string,
  uri: string
) => {
  const response = await api.post("/auth/auth/wallet/challenge", {
    walletAddress,
    domain,
    uri,
  });
  return response.data;
};

// Verify wallet signature and get tokens
export const verifyWalletSignature = async (
  message: string,
  signature: string,
  walletAddress: string
) => {
  const response = await api.post("/auth/auth/wallet/verify", {
    message,
    signature,
    walletAddress,
  });
  return response.data;
};

// Refresh access token using refresh token
export const refreshAccessToken = async (refreshToken: string) => {
  const response = await api.post("/auth/auth/refresh-token", { refreshToken });
  return response.data;
};

// ===== User Service API =====

// Get user profile by user ID
export const getUserProfile = async (userId: string) => {
  const response = await api.get(`/user/users/${userId}/profile`);
  return response.data;
};

// Create user profile (authenticated)
export const createUserProfile = async (data: {
  username: string;
  bio?: string;
  avatarUrl?: string;
}) => {
  const response = await api.post("/user/profile", data);
  return response.data;
};

// Update user profile (authenticated)
export const updateUserProfile = async (data: {
  username?: string;
  bio?: string;
  avatarUrl?: string;
}) => {
  const response = await api.put("/user/profile", data);
  return response.data;
};

// Follow a user
export const followUser = async (targetUserId: string) => {
  const response = await api.post(`/user/users/${targetUserId}/follow`);
  return response.data;
};

// Unfollow a user
export const unfollowUser = async (targetUserId: string) => {
  const response = await api.delete(`/user/users/${targetUserId}/follow`);
  return response.data;
};

// Block a user
export const blockUser = async (targetUserId: string) => {
  const response = await api.post(`/user/users/${targetUserId}/block`);
  return response.data;
};

// Check relationship with a user
export const checkUserRelationship = async (targetUserId: string) => {
  const response = await api.get(`/user/users/${targetUserId}/relationship`);
  return response.data;
};

// Get user's followers
export const getUserFollowers = async (userId: string) => {
  const response = await api.get(`/user/users/${userId}/followers`);
  return response.data;
};

// Get users that a user is following
export const getUserFollowing = async (userId: string) => {
  const response = await api.get(`/user/users/${userId}/following`);
  return response.data;
};

// ===== KYC Service API =====

// Initiate KYC verification for the authenticated user
export const initiateKycVerification = async (userUuid: string) => {
  const response = await api.post("/kyc/kyc/verify", { userUuid });
  return response.data;
};

export default api;
