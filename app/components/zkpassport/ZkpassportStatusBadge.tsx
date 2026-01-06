"use client";

import type { ZkpassportSessionStatus } from "@/app/lib/types/zkpassport";

interface ZkpassportStatusBadgeProps {
  status: ZkpassportSessionStatus;
  isPolling?: boolean;
}

interface StatusConfig {
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}

const statusConfigs: Record<ZkpassportSessionStatus, StatusConfig> = {
  pending: {
    bgColor: "bg-amber-50",
    textColor: "text-amber-800",
    borderColor: "border-amber-200",
    icon: (
      <svg
        className="w-5 h-5 text-amber-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    label: "Waiting for verification",
    description: "Please scan the QR code with your ZKPassport app",
  },
  verified: {
    bgColor: "bg-green-50",
    textColor: "text-green-800",
    borderColor: "border-green-200",
    icon: (
      <svg
        className="w-5 h-5 text-green-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    label: "Verification successful",
    description: "Your age has been verified. You can now access all features.",
  },
  rejected: {
    bgColor: "bg-red-50",
    textColor: "text-red-800",
    borderColor: "border-red-200",
    icon: (
      <svg
        className="w-5 h-5 text-red-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    label: "Verification failed",
    description: "Age verification was not successful. Please try again.",
  },
  expired: {
    bgColor: "bg-gray-50",
    textColor: "text-gray-800",
    borderColor: "border-gray-200",
    icon: (
      <svg
        className="w-5 h-5 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    label: "Session expired",
    description: "The verification session has expired. Please start again.",
  },
  error: {
    bgColor: "bg-red-50",
    textColor: "text-red-800",
    borderColor: "border-red-200",
    icon: (
      <svg
        className="w-5 h-5 text-red-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    label: "Error occurred",
    description: "An error occurred during verification. Please try again.",
  },
};

/**
 * Status badge component for ZKPassport verification
 * Shows the current verification status with appropriate styling
 */
export default function ZkpassportStatusBadge({
  status,
  isPolling = false,
}: ZkpassportStatusBadgeProps) {
  const config = statusConfigs[status];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${config.bgColor} ${config.borderColor}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {isPolling && status === "pending" ? (
          <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          config.icon
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${config.textColor}`}>{config.label}</p>
        <p className="text-sm text-gray-600 mt-0.5">{config.description}</p>
      </div>
    </div>
  );
}
