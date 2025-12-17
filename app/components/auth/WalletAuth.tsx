"use client";

import { useState, useEffect } from "react";
import {
  connectWallet,
  signMessage,
  isMetaMaskInstalled,
  isMetaMaskUnlocked,
  onAccountsChanged,
  removeAccountsChangedListener,
} from "@/app/lib/wallet";
import { getWalletChallenge, verifyWalletSignature } from "@/app/lib/api";
import { setTokens } from "@/app/lib/auth";

interface WalletAuthProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function WalletAuth({ onSuccess, onError }: WalletAuthProps) {
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<
    "idle" | "connecting" | "signing" | "verifying"
  >("idle");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [metaMaskInstalled, setMetaMaskInstalled] = useState(false);
  const [metaMaskLocked, setMetaMaskLocked] = useState(false);

  useEffect(() => {
    const checkMetaMaskStatus = async () => {
      const installed = isMetaMaskInstalled();
      setMetaMaskInstalled(installed);

      if (installed) {
        const unlocked = await isMetaMaskUnlocked();
        setMetaMaskLocked(!unlocked);
      }
    };

    checkMetaMaskStatus();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setWalletAddress("");
        setMessage("");
        setStep("idle");
        setMetaMaskLocked(true);
      } else {
        setWalletAddress(accounts[0]);
        setMetaMaskLocked(false);
      }
    };

    onAccountsChanged(handleAccountsChanged);

    return () => {
      removeAccountsChangedListener(handleAccountsChanged);
    };
  }, []);

  const handleWalletAuth = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Step 1: Connect wallet (this will trigger MetaMask to open)
      setStep("connecting");
      setMessage(
        metaMaskLocked
          ? "Opening MetaMask - please unlock it..."
          : "Connecting wallet..."
      );
      const address = await connectWallet();
      setWalletAddress(address);
      setMetaMaskLocked(false);

      // Step 2: Get challenge from backend
      setMessage("Preparing signature request...");
      const domain = window.location.host;
      const uri = window.location.origin;
      const { siweMessage } = await getWalletChallenge(address, domain, uri);

      // Step 3: Sign the message
      setStep("signing");
      setMessage("Please sign the message in MetaMask...");
      const signature = await signMessage(siweMessage);

      // Step 4: Verify signature and get tokens
      setStep("verifying");
      setMessage("Verifying signature...");
      const result = await verifyWalletSignature(
        siweMessage,
        signature,
        address
      );

      setTokens(result.accessToken, result.refreshToken);
      setMessage("Successfully authenticated!");
      onSuccess?.();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Failed to authenticate with wallet";
      setError(errorMessage);
      onError?.(errorMessage);
      setStep("idle");

      // Check if MetaMask is still locked
      const unlocked = await isMetaMaskUnlocked();
      setMetaMaskLocked(!unlocked);
    } finally {
      setLoading(false);
    }
  };

  if (!metaMaskInstalled) {
    return (
      <div className="w-full space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center">
            <svg
              className="w-12 h-12 text-orange-600"
              viewBox="0 0 40 40"
              fill="currentColor"
            >
              <path d="M36.1 10.4l-14-9.2c-1.3-.9-3-.9-4.3 0l-14 9.2c-1.3.9-2.1 2.4-2.1 4v11.2c0 1.6.8 3.1 2.1 4l14 9.2c.7.4 1.4.6 2.1.6s1.5-.2 2.1-.6l14-9.2c1.3-.9 2.1-2.4 2.1-4V14.4c.1-1.6-.7-3.1-2-4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              MetaMask Required
            </h3>
            <p className="text-sm text-gray-600 max-w-sm mx-auto">
              To sign in with your wallet, you'll need to install the MetaMask
              browser extension first.
            </p>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-lg font-bold text-orange-600">1</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Download MetaMask
              </p>
              <p className="text-xs text-gray-600">
                Free browser extension for Chrome, Firefox, and more
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-lg font-bold text-orange-600">2</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Create or import wallet
              </p>
              <p className="text-xs text-gray-600">
                Set up your Ethereum wallet in minutes
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-lg font-bold text-orange-600">3</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Return and connect
              </p>
              <p className="text-xs text-gray-600">
                Come back to sign in with your wallet
              </p>
            </div>
          </div>
        </div>

        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 text-center"
        >
          Download MetaMask
          <svg
            className="inline-block ml-2 w-4 h-4"
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
        </a>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* MetaMask Locked Warning */}
      {metaMaskLocked && !walletAddress && !loading && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 mb-1">
                MetaMask is Locked
              </p>
              <p className="text-xs text-amber-700">
                Click the button below to open MetaMask. You'll be prompted to unlock it with your password.
              </p>
            </div>
          </div>
        </div>
      )}

      {walletAddress && !loading && (
        <div className="p-4 bg-gradient-to-r from-brand-50 to-tyrian-50 border border-brand-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-brand-900 mb-0.5">
                Connected Wallet
              </p>
              <p className="text-sm font-mono text-brand-700 truncate">
                {walletAddress}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <svg
            className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      )}

      {message && !error && (
        <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <svg
            className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-brand-800 font-medium">{message}</p>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleWalletAuth}
          disabled={loading}
          className="relative w-full bg-brand-500 text-white py-3.5 px-6 rounded-xl font-semibold hover:bg-brand-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:shadow-none disabled:translate-y-0 group"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>
                {step === "connecting" && "Connecting..."}
                {step === "signing" && "Waiting for signature..."}
                {step === "verifying" && "Verifying..."}
              </span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5 transition-transform group-hover:scale-110"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM12 17.5l-5-5h3v-5h4v5h3l-5 5z" />
              </svg>
              <span>
                {metaMaskLocked && !walletAddress
                  ? "Unlock & Connect Wallet"
                  : "Connect Wallet"}
              </span>
            </span>
          )}
        </button>

        <div className="text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5">
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Secured by Sign-In with Ethereum (SIWE)</span>
          </p>
        </div>
      </div>

      {!walletAddress && !loading && (
        <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Why connect your wallet?
          </h4>
          <ul className="space-y-2">
            {[
              { icon: "🔐", text: "Secure passwordless authentication" },
              { icon: "⚡", text: "Instant access to your account" },
              { icon: "🌐", text: "Decentralized identity ownership" },
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-gray-700"
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
