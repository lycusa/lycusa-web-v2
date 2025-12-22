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
  try {
    const response = await api.get(`/user/users/${userId}/profile`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { success: false };
    }
    throw error;
  }
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
  const response = await api.post(`/user/users/${targetUserId}/follow`, {});
  return response.data;
};

// Unfollow a user
export const unfollowUser = async (targetUserId: string) => {
  const response = await api.delete(`/user/users/${targetUserId}/follow`);
  return response.data;
};

// Block a user
export const blockUser = async (targetUserId: string) => {
  const response = await api.post(`/user/users/${targetUserId}/block`, {});
  return response.data;
};

// Unblock a user
export const unblockUser = async (targetUserId: string) => {
  const response = await api.delete(`/user/users/${targetUserId}/block`);
  return response.data;
};

// Get blocked users
export const getBlockedUsers = async () => {
  const response = await api.get(`/user/users/get-blocked-users`);
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

import type {
  PlaceOrderRequest,
  CancelOrderRequest,
  UpdateStatusRequest,
  CompleteOrderRequest,
  ListOrdersQuery,
} from "./types/order";

import type {
  Conversation,
  Message,
  MediaType,
  UploadMediaResponse,
} from "./types/messaging";

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

// Upload avatar image
export const uploadAvatar = async (file: File): Promise<{ task_id: string; status_url: string; avatar_id: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  // Don't manually set Content-Type - let axios set it automatically with the boundary
  const response = await api.post("/product/api/v1/avatar", formData);
  return response.data.data;
};

// Get Celery task status (for avatar upload)
export const getCeleryTaskStatus = async (taskId: string) => {
  const response = await api.get(`/product/api/v1/celery/tasks/${taskId}/status`);
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

// ===== Order Service API =====

// Place a new order
export const placeOrder = async (data: PlaceOrderRequest) => {
  const response = await api.post("/order/api/v1/orders", data);
  return response.data;
};

// Get order details by ID
export const getOrder = async (orderId: string) => {
  const response = await api.get(`/order/api/v1/orders/${orderId}`);
  return response.data;
};

// List user's orders (as buyer or seller)
export const listOrders = async (query?: ListOrdersQuery) => {
  const params = new URLSearchParams();
  if (query?.status) params.append("status", query.status);
  if (query?.limit) params.append("limit", query.limit.toString());
  if (query?.offset) params.append("offset", query.offset.toString());

  const queryString = params.toString();
  const url = queryString ? `/order/api/v1/orders?${queryString}` : "/order/api/v1/orders";
  const response = await api.get(url);
  return response.data;
};

// Cancel an order
export const cancelOrder = async (orderId: string, data: CancelOrderRequest) => {
  const response = await api.post(`/order/api/v1/orders/${orderId}/cancel`, data);
  return response.data;
};

// Update order status
export const updateOrderStatus = async (orderId: string, data: UpdateStatusRequest) => {
  const response = await api.post(`/order/api/v1/orders/${orderId}/update-status`, data);
  return response.data;
};

// Complete an order (buyer only, after delivery)
export const completeOrder = async (orderId: string, data: CompleteOrderRequest) => {
  const response = await api.post(`/order/api/v1/orders/${orderId}/complete`, data);
  return response.data;
};

// ===== Rating Service API =====

// Submit a rating for an order (buyer only)
export const submitRating = async (orderId: string, rate: number) => {
  const response = await api.post("/rating/rating", {
    orderId,
    rate,
  });
  return response.data;
};

// ===== Messaging Service API =====

// List user's conversations (with caching)
export const listConversations = async (forceRefresh = false): Promise<Conversation[]> => {
  const { fetchConversationsWithCache } = await import("./conversationsCache");

  const fetchFn = async (): Promise<Conversation[]> => {
    const response = await api.get("/messaging/api/conversations");
    // Handle case where API returns wrapped object { conversations: [...] } or { data: [...] }
    return response.data.conversations || response.data.data || (Array.isArray(response.data) ? response.data : []);
  };

  return fetchConversationsWithCache(fetchFn, forceRefresh);
};

// Get conversation messages
export const getConversationMessages = async (
  conversationId: string
): Promise<Message[]> => {
  const response = await api.get(
    `/messaging/api/conversations/${conversationId}/messages`
  );
  // Handle wrapped response
  return response.data.messages || response.data.data || (Array.isArray(response.data) ? response.data : []);
};

// Get conversation by order ID (uses cache)
export const getConversationByOrderId = async (
  orderId: string
): Promise<Conversation | null> => {
  try {
    const { getCachedConversationByOrderId } = await import("./conversationsCache");

    // Try cache first
    const cached = getCachedConversationByOrderId(orderId);
    if (cached) {
      return cached;
    }

    // Fallback to fetching all conversations (will populate cache)
    const conversations = await listConversations();
    return conversations.find((c) => c.order_id === orderId) || null;
  } catch (error) {
    console.error("Failed to get conversation by order ID:", error);
    return null;
  }
};

// Get conversation by order ID with retry logic
// Useful when conversation might not be created yet (Kafka event processing delay)
export const getConversationByOrderIdWithRetry = async (
  orderId: string,
  maxRetries: number = 3,
  retryDelayMs: number = 1000
): Promise<Conversation | null> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Force refresh on retry attempts to bypass cache
    const forceRefresh = attempt > 0;

    try {
      if (forceRefresh) {
        // Force refresh the conversations list
        const conversations = await listConversations(true);
        const conv = conversations.find((c) => c.order_id === orderId);
        if (conv) {
          return conv;
        }
      } else {
        const conv = await getConversationByOrderId(orderId);
        if (conv) {
          return conv;
        }
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed to get conversation:`, error);
    }

    // Wait before retrying (except on last attempt)
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }
  }

  return null;
};

// ===== Public Key API =====

// Upload user's public key for E2EE
export const uploadPublicKey = async (publicKey: string): Promise<void> => {
  await api.post("/messaging/api/public_keys", {
    public_key: publicKey,
  });
};

// Get a user's public key
export const getPublicKey = async (userId: string): Promise<string | null> => {
  try {
    const response = await api.get(`/messaging/api/public_keys/${userId}`);
    return response.data.public_key;
  } catch (error: unknown) {
    const axiosError = error as { response?: { status: number }; message?: string };
    // Return null for 404 (key not found) or any other error
    // This prevents the whole E2EE flow from breaking if server has issues
    if (axiosError.response?.status === 404) {
      console.log(`[API] Public key not found for user ${userId}`);
      return null;
    }
    // Log other errors but don't throw - return null so E2EE can continue
    console.error(`[API] Error fetching public key for ${userId}:`, axiosError.message || error);
    return null;
  }
};

// Batch get public keys for multiple users
export const batchGetPublicKeys = async (
  userIds: string[]
): Promise<Record<string, string>> => {
  const response = await api.post("/messaging/api/public_keys/batch", {
    user_ids: userIds,
  });
  return response.data.public_keys;
};

// ===== Messaging Media API =====

// Upload media (unencrypted)
export const uploadMessageMedia = async (
  conversationId: string,
  file: File,
  type: MediaType
): Promise<UploadMediaResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const response = await api.post(
    `/messaging/api/conversations/${conversationId}/media`,
    formData
  );
  return response.data;
};

// Upload encrypted media
export const uploadEncryptedMedia = async (
  conversationId: string,
  encryptedBlob: Blob,
  type: MediaType
): Promise<UploadMediaResponse> => {
  const formData = new FormData();
  formData.append("file", encryptedBlob);
  formData.append("type", type);

  const response = await api.post(
    `/messaging/api/conversations/${conversationId}/media/encrypted`,
    formData
  );
  return response.data;
};

// Get presigned media URL
export const getMessageMediaUrl = async (mediaKey: string): Promise<string> => {
  const response = await api.get(
    `/messaging/api/media/${encodeURIComponent(mediaKey)}`
  );
  return response.data.url;
};

export default api;
