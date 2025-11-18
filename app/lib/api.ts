import axios from 'axios';

// API Gateway URL - all requests go through the gateway
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized request');
    }
    return Promise.reject(error);
  }
);

// Request OTP for email authentication
export const requestOtp = async (email: string) => {
  const response = await api.post('/auth/auth/request-otp', { email });
  return response.data;
};

// Verify OTP and get tokens
export const verifyOtp = async (email: string, otp: string) => {
  const response = await api.post('/auth/auth/verify-otp', { email, otp });
  return response.data;
};

// Get wallet challenge (SIWE message)
export const getWalletChallenge = async (walletAddress: string, domain: string, uri: string) => {
  const response = await api.post('/auth/auth/wallet/challenge', {
    walletAddress,
    domain,
    uri
  });
  return response.data;
};

// Verify wallet signature and get tokens
export const verifyWalletSignature = async (
  message: string,
  signature: string,
  walletAddress: string
) => {
  const response = await api.post('/auth/auth/wallet/verify', {
    message,
    signature,
    walletAddress,
  });
  return response.data;
};

// Refresh access token using refresh token
export const refreshAccessToken = async (refreshToken: string) => {
  const response = await api.post('/auth/auth/refresh-token', { refreshToken });
  return response.data;
};

export default api;
