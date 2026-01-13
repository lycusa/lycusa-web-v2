import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lycusa-product-media.s3.amazonaws.com", // Added this global S3 hostname
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lycusa-product-media.s3.eu-west-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lycusa-product-media.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    const MESSAGING_URL =
      process.env.MESSAGING_SERVICE_URL || "http://localhost:4001";
    return [
      {
        source: "/messaging/api/:path*",
        destination: `${MESSAGING_URL}/api/:path*`,
      },
      {
        source: "/messaging/socket/:path*",
        destination: `${MESSAGING_URL}/socket/:path*`,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "tum-lz",

  project: "lycusa-tum",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
