'use client';

import { useState, useEffect } from 'react';
import EmailCollector from './EmailCollector';

interface EmailSubscriptionModalProps {
  delayMs?: number;
}

export default function EmailSubscriptionModal({ delayMs = 2000 }: EmailSubscriptionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    setShouldShow(true);
    // Show modal after delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSuccess = () => {
    // Close modal after a short delay to show success message
    setTimeout(() => {
      setIsOpen(false);
    }, 2000);
  };

  if (!shouldShow) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div
          className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center group"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Decorative Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20"
              style={{
                background: 'radial-gradient(circle, rgba(99, 0, 43, 0.3) 0%, transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
            <div
              className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-15"
              style={{
                background: 'radial-gradient(circle, rgba(214, 146, 174, 0.3) 0%, transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 p-8 md:p-12">
            <div className="text-center mb-8">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-tyrian-700 to-tyrian-600 mb-6 shadow-lg shadow-tyrian-700/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              {/* Heading */}
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Stay in the Loop!
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto">
                Get exclusive updates on new features, privacy enhancements, and early access to Lycusa's
                privacy-first marketplace.
              </p>
            </div>

            {/* Email Collector */}
            <div className="flex justify-center mb-6">
              <EmailCollector
                source="homepage_modal"
                placeholder="your@email.com"
                buttonText="Subscribe"
                successMessage="Perfect! You're all set. Welcome to Lycusa!"
                onSuccess={handleSuccess}
                onError={(error) => {
                  console.error('Subscription error:', error);
                }}
              />
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>No spam, ever</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Unsubscribe anytime</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Privacy first</span>
              </div>
            </div>

            {/* Skip Link */}
            <div className="mt-6 text-center">
              <button
                onClick={handleClose}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors underline"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
