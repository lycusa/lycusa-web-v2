import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request OTP for email authentication
export const requestOtp = async (email: string) => {
  const response = await api.post('/request-otp', { email });
  return response.data;
};

// Verify OTP and get tokens
export const verifyOtp = async (email: string, otp: string) => {
  const response = await api.post('/verify-otp', { email, otp });
  return response.data;
};

// Get wallet challenge (SIWE message)
export const getWalletChallenge = async (walletAddress: string) => {
  const response = await api.post('/wallet/challenge', { walletAddress });
  return response.data;
};

// Verify wallet signature and get tokens
export const verifyWalletSignature = async (
  message: string,
  signature: string,
  walletAddress: string
) => {
  const response = await api.post('/wallet/verify', {
    message,
    signature,
    walletAddress,
  });
  return response.data;
};

// Refresh access token using refresh token
export const refreshAccessToken = async (refreshToken: string) => {
  const response = await api.post('/refresh-token', { refreshToken });
  return response.data;
};

export default api;
