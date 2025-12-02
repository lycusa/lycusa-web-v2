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
  // Remove withCredentials since we're using JWT tokens in Authorization header, not cookies
  // withCredentials: true,
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

    // For FormData uploads, remove the default Content-Type header
    // Let the browser/axios set it with the correct multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log("[API Interceptor] Removed Content-Type for FormData upload");
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

// Logout user and invalidate refresh token
export const logout = async (refreshToken: string) => {
  try {
    // Call backend logout endpoint when available
    // This will invalidate the refresh token on the server
    const response = await api.post("/auth/auth/logout", { refreshToken });
    return response.data;
  } catch (error) {
    // If the endpoint doesn't exist yet, just return success
    // The client-side token clearing will still work
    console.warn("Logout endpoint not available yet:", error);
    return { success: true };
  }
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

// Get user by email (returns full user data including kycStatus)
export const getUserByEmail = async (email: string) => {
  const response = await api.get(`/user/users/by-email?email=${encodeURIComponent(email)}`);
  return response.data;
};

// Get user by wallet address (returns full user data including kycStatus)
export const getUserByAddress = async (address: string) => {
  const response = await api.get(`/user/users/by-address?address=${encodeURIComponent(address)}`);
  return response.data;
};

// ===== KYC Service API =====

// Initiate KYC verification for the authenticated user
export const initiateKycVerification = async (userUuid: string) => {
  const response = await api.post("/kyc/kyc/verify", { userUuid });
  return response.data;
};

// Get user KYC status
export const getUserKycStatus = async (userId: string) => {
  const response = await api.get(`/user/users/${userId}/kyc-status`);
  return response.data;
};

// ===== Product Service API =====

import type {
  CreateProductRequest,
  EditProductRequest,
  SearchQuery,
} from "./types/product";

// Create a new product
export const createProduct = async (data: CreateProductRequest) => {
  const response = await api.post("/product/api/v1/products", data);
  return response.data;
};

// Get a single product by ID
export const getProduct = async (productId: string) => {
  const response = await api.get(`/product/api/v1/products/${productId}`);
  return response.data;
};

// Edit an existing product
export const editProduct = async (productId: string, data: EditProductRequest) => {
  const response = await api.put(`/product/api/v1/products/${productId}`, data);
  return response.data;
};

// Delete a single product
export const deleteProduct = async (productId: string) => {
  const response = await api.delete(`/product/api/v1/products/${productId}`);
  return response.data;
};

// Batch delete multiple products
export const deleteProducts = async (productIds: string[]) => {
  const response = await api.delete("/product/api/v1/products", {
    data: { product_ids: productIds },
  });
  return response.data;
};

// Search products with advanced filtering
export const searchProducts = async (query: SearchQuery) => {
  const response = await api.post("/product/api/v1/search/products", query);
  return response.data;
};

// Get search suggestions (autocomplete)
export const getSearchSuggestions = async (query: string, size: number = 5) => {
  const response = await api.get("/product/api/v1/search/suggestions", {
    params: { q: query, size },
  });
  return response.data;
};

// Upload media file
export const uploadMedia = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  // Don't manually set Content-Type - let axios set it automatically with the boundary
  const response = await api.post("/product/api/v1/media", formData);
  return response.data;
};

// Get media information
export const getMediaInfo = async (mediaId: string) => {
  const response = await api.get(`/product/api/v1/media/${mediaId}`);
  return response.data;
};

// Delete a single media file
export const deleteMedia = async (mediaId: string) => {
  const response = await api.delete(`/product/api/v1/media/${mediaId}`);
  return response.data;
};

// Batch retrieve multiple media files
export const getMedias = async (mediaIds: string[]) => {
  const response = await api.post("/product/api/v1/medias/get", {
    media_ids: mediaIds,
  });
  return response.data;
};

// Get task status (for async operations like media upload)
export const getTaskStatus = async (taskId: string) => {
  const response = await api.get(`/product/api/v1/tasks/${taskId}/status`);
  return response.data;
};

export default api;
