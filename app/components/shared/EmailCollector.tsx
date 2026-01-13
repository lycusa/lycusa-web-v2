'use client';

import { useState, FormEvent } from 'react';
import { validateEmail } from '@/app/lib/emailService';

interface EmailCollectorProps {
  source?: string;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
  className?: string;
  onSuccess?: (email: string) => void;
  onError?: (error: string) => void;
}

export default function EmailCollector({
  source = 'website',
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  successMessage = 'Thanks for subscribing!',
  className = '',
  onSuccess,
  onError,
}: EmailCollectorProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const validation = validateEmail(email);
    if (!validation.valid) {
      const errorMsg = validation.error || 'Invalid email';
      setMessage({ type: 'error', text: errorMsg });
      onError?.(errorMsg);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/emails/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, source }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to subscribe');
      }

      setMessage({ type: 'success', text: successMessage });
      setEmail('');
      onSuccess?.(email);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:gap-2">
        {/* Email Input - Glass styled with large touch target */}
        <div className="flex-1 relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            inputMode="email"
            className="w-full h-[52px] sm:h-[48px] px-4 sm:px-5 text-base sm:text-sm
              glass-frosted rounded-xl sm:rounded-xl
              border border-white/40 
              text-gray-900 placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-tyrian-500/50 focus:border-tyrian-500/50
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-all duration-200"
            required
            aria-label="Email address"
          />
          {/* Email icon inside input */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:block">
            {/* Hidden on mobile for more input space */}
          </div>
        </div>

        {/* Submit Button - Neumorphic tyrian with large touch target */}
        <button
          type="submit"
          disabled={loading}
          className="h-[52px] sm:h-[48px] px-6 sm:px-7 min-w-[140px]
            neumorphic-tyrian text-white rounded-xl
            font-semibold text-base sm:text-sm
            active:scale-[0.98] sm:hover:scale-[1.02]
            focus:outline-none focus:ring-2 focus:ring-tyrian-400/50 focus:ring-offset-2 focus:ring-offset-white
            disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
            transition-all duration-200
            flex items-center justify-center gap-2"
          aria-label={loading ? 'Subscribing...' : buttonText}
        >
          {loading ? (
            <>
              {/* Loading spinner */}
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="hidden sm:inline">Subscribing...</span>
              <span className="sm:hidden">Wait...</span>
            </>
          ) : (
            <>
              <span>{buttonText}</span>
              <svg
                className="w-4 h-4 hidden sm:block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* Message feedback with animated entrance */}
      {message && (
        <div
          className={`mt-3 p-3 sm:p-3.5 rounded-xl text-sm flex items-start gap-2.5 animate-fade-in ${message.type === 'success'
            ? 'glass-frosted border border-green-300/50 text-green-800'
            : 'glass-frosted border border-red-300/50 text-red-800'
            }`}
          role={message.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {/* Status icon */}
          {message.type === 'success' ? (
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span className="leading-snug">{message.text}</span>
        </div>
      )}
    </div>
  );
}
