"use client";

import { QRCodeSVG } from "qrcode.react";
import type { ZkpassportSession, ZkpassportStatus } from "@/app/lib/types/zkpassport";

interface ZkpassportQRCodeProps {
  session: ZkpassportSession;
  status: ZkpassportStatus | null;
  size?: number;
}

/**
 * QR Code component for ZKPassport verification
 * Displays a scannable QR code that links to the ZKPassport mobile app
 */
export default function ZkpassportQRCode({
  session,
  status,
  size = 240,
}: ZkpassportQRCodeProps) {
  const isCompleted =
    status?.status === "verified" || status?.status === "rejected";
  const isPending = status?.status === "pending";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Code Container */}
      <div
        className={`relative p-4 bg-white rounded-2xl shadow-lg ${
          isCompleted ? "opacity-50" : ""
        }`}
      >
        <QRCodeSVG
          value={session.verificationUrl}
          size={size}
          level="M"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#1f2937"
        />

        {/* Overlay for completed states */}
        {isCompleted && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-2xl">
            <div
              className={`flex flex-col items-center gap-2 ${
                status?.status === "verified"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {status?.status === "verified" ? (
                <>
                  <svg
                    className="w-12 h-12"
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
                  <span className="font-semibold">Verified</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-12 h-12"
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
                  <span className="font-semibold">Rejected</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Scanning animation for pending state */}
        {isPending && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-tyrian-500/50 to-transparent animate-scan" />
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center max-w-xs">
        <p className="text-gray-700 font-medium mb-1">
          Scan with ZKPassport app
        </p>
        <p className="text-sm text-gray-500">
          Open the ZKPassport app on your phone and scan this QR code to verify
          your age
        </p>
      </div>

      {/* Session expiry */}
      <div className="text-xs text-gray-400">
        Session expires:{" "}
        {new Date(session.expiresAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>

      {/* Mobile deep link (shown on mobile devices) */}
      <a
        href={session.verificationUrl}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-tyrian-700 hover:text-tyrian-800 hover:bg-tyrian-50 rounded-lg transition-colors md:hidden"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
        Open in ZKPassport App
      </a>
    </div>
  );
}
