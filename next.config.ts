import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lycusa-product-media.s3.amazonaws.com', // Added this global S3 hostname
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lycusa-product-media.s3.eu-west-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lycusa-product-media.s3.us-east-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    const MESSAGING_URL = process.env.MESSAGING_SERVICE_URL || 'http://localhost:4001';
    return [
      {
        source: '/messaging/api/:path*',
        destination: `${MESSAGING_URL}/api/:path*`,
      },
      {
        source: '/messaging/socket/:path*',
        destination: `${MESSAGING_URL}/socket/:path*`,
      },
    ];
  },
};

export default nextConfig;
