# Authentication Setup Guide

This guide explains the authentication implementation for the Lycusa e-commerce platform.

## Overview

The application supports two authentication methods:
1. **Email + OTP** - Users receive a 6-digit code via email
2. **Wallet (SIWE)** - Users authenticate using MetaMask with Sign-In with Ethereum

## Architecture

### Backend (lycusa-auth-service)
- FastAPI service handling authentication
- Email OTP flow with Redis caching
- Wallet authentication using SIWE (Sign-In with Ethereum)
- JWT tokens (access + refresh) using RS256 algorithm
- Rate limiting and security features

### Frontend (lycusa-web-v2)
- Next.js 16 with React 19
- Client-side authentication components
- JWT storage in localStorage
- MetaMask integration for wallet auth

## File Structure

```
app/
├── lib/
│   ├── api.ts              # API client and endpoints
│   ├── auth.ts             # JWT token management
│   └── wallet.ts           # MetaMask/Web3 utilities
├── components/
│   └── auth/
│       ├── EmailAuth.tsx   # Email + OTP authentication component
│       ├── WalletAuth.tsx  # Wallet authentication component
│       ├── AuthGuard.tsx   # Protected route wrapper + useAuth hook
│       └── LogoutButton.tsx # Logout functionality
└── (auth)/
    ├── signin/
    │   └── page.tsx        # Sign in page
    └── signup/
        └── page.tsx        # Sign up page
```

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3000
```

Replace `http://localhost:3000` with your auth service URL.

### 2. Install Dependencies

Dependencies are already installed:
- `ethers` - Ethereum wallet integration
- `siwe` - Sign-In with Ethereum
- `axios` - HTTP client

### 3. Start the Auth Service

Make sure the `lycusa-auth-service` is running:

```bash
cd ../lycusa-auth-service
npm run dev
```

The service should be running on `http://localhost:3000`

### 4. Start the Frontend

```bash
npm run dev
```

Visit `http://localhost:3001` (or the port Next.js assigns)

## Authentication Flow

### Email + OTP Flow

1. User enters email address
2. Backend generates 6-digit OTP and sends via email
3. OTP stored in Redis with 5-minute expiration
4. User enters OTP
5. Backend verifies OTP and creates/finds user via gRPC
6. Backend generates access + refresh tokens
7. Frontend stores tokens in localStorage
8. User is authenticated

**API Endpoints:**
- `POST /request-otp` - Request OTP code
- `POST /verify-otp` - Verify OTP and get tokens

### Wallet Flow (SIWE)

1. User clicks "Connect Wallet"
2. MetaMask prompts for account connection
3. Frontend requests challenge from backend
4. Backend generates SIWE message with nonce
5. User signs message in MetaMask
6. Frontend sends signature to backend
7. Backend verifies signature using SIWE library
8. Backend creates/finds user via gRPC
9. Backend generates access + refresh tokens
10. Frontend stores tokens in localStorage
11. User is authenticated

**API Endpoints:**
- `POST /wallet/challenge` - Get SIWE challenge message
- `POST /wallet/verify` - Verify signature and get tokens

### Token Management

**Access Token:**
- Short-lived (15 minutes by default)
- Included in Authorization header for API requests
- Contains user ID, email/wallet address, and role

**Refresh Token:**
- Long-lived (7 days by default)
- Used to obtain new access tokens
- Stored in Redis for revocation support

**API Endpoint:**
- `POST /refresh-token` - Get new access token

## Using Authentication in Your App

### Protecting Routes

Wrap any page component with `AuthGuard`:

```tsx
import AuthGuard from '@/app/components/auth/AuthGuard';

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <div>Protected content</div>
    </AuthGuard>
  );
}
```

### Getting User Info

Use the `useAuth` hook:

```tsx
import { useAuth } from '@/app/components/auth/AuthGuard';

export default function MyComponent() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return (
    <div>
      Welcome {user?.email || user?.walletAddress}!
    </div>
  );
}
```

### Making Authenticated API Calls

```tsx
import api from '@/app/lib/api';
import { getAccessToken } from '@/app/lib/auth';

// Add token to request
api.defaults.headers.common['Authorization'] = `Bearer ${getAccessToken()}`;

// Make authenticated request
const response = await api.get('/some-protected-endpoint');
```

### Logout

```tsx
import LogoutButton from '@/app/components/auth/LogoutButton';

<LogoutButton />
```

## JWT Payload Structure

```json
{
  "id": "user-uuid",
  "email": "user@example.com",  // or walletAddress
  "role": "user",
  "iat": 1234567890,
  "exp": 1234568790,
  "iss": "lycusa-auth-service",
  "aud": "lycusa-api",
  "type": "access"  // or "refresh"
}
```

## Security Features

1. **Rate Limiting** - 5 requests per minute per email/IP
2. **OTP Expiration** - 5 minutes
3. **Failure Tracking** - Max 5 failed attempts before temporary block
4. **Token Rotation** - Short-lived access tokens
5. **Refresh Token Revocation** - Stored in Redis for instant invalidation
6. **RS256 Algorithm** - Asymmetric JWT signing
7. **SIWE Verification** - Cryptographic proof of wallet ownership

## Common Issues

### MetaMask Not Detected
- Install MetaMask browser extension
- Check that you're using a supported browser

### OTP Not Received
- Check spam folder
- Verify email configuration in auth service
- Check Redis connection

### Token Expired
- Use refresh token to get new access token
- Implement automatic token refresh in your API client

### CORS Issues
- Add your frontend URL to auth service CORS configuration
- Check `security.corsOrigins` in auth service config

## Testing

### Test Email Auth
1. Navigate to `/signin`
2. Select "Email" tab
3. Enter your email
4. Check email for OTP code
5. Enter OTP to complete sign in

### Test Wallet Auth
1. Install MetaMask
2. Navigate to `/signin`
3. Select "Wallet" tab
4. Click "Connect Wallet"
5. Approve connection in MetaMask
6. Sign the SIWE message
7. You're signed in!

## Next Steps

1. Implement token refresh interceptor in axios
2. Add password reset flow (if needed)
3. Implement email verification
4. Add social auth providers
5. Create user profile management
6. Add role-based access control (RBAC)
7. Implement session management UI

## API Reference

### Request OTP
```bash
POST /request-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Verify OTP
```bash
POST /verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Get Wallet Challenge
```bash
POST /wallet/challenge
Content-Type: application/json

{
  "walletAddress": "0x..."
}
```

### Verify Wallet
```bash
POST /wallet/verify
Content-Type: application/json

{
  "message": "Sign-in with Ethereum message...",
  "signature": "0x...",
  "walletAddress": "0x..."
}
```

### Refresh Token
```bash
POST /refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```
