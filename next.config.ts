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
};

export default nextConfig;
