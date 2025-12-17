"use client";

import { useState, useEffect } from "react";
import {
  OrderStatus,
  ORDER_STATUS_CONFIG,
  VALID_STATUS_TRANSITIONS,
  SELLER_ALLOWED_STATUSES,
  BUYER_ALLOWED_STATUSES,
} from "@/app/lib/types/order";

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newStatus: OrderStatus, notes?: string) => Promise<void>;
  orderId: string;
  currentStatus: OrderStatus;
  isBuyer: boolean;
  isSeller: boolean;
}

export default function UpdateStatusModal({
  isOpen,
  onClose,
  onConfirm,
  orderId,
  currentStatus,
  isBuyer,
  isSeller,
}: UpdateStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedStatus("");
      setNotes("");
      setError(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  // Get valid transitions based on current status and user role
  const getAvailableStatuses = (): OrderStatus[] => {
    const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];

    return validTransitions.filter((status) => {
      if (isSeller && SELLER_ALLOWED_STATUSES.includes(status)) return true;
      if (isBuyer && BUYER_ALLOWED_STATUSES.includes(status)) return true;
      return false;
    });
  };

  const availableStatuses = getAvailableStatuses();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedStatus) {
      setError("Please select a status");
      return;
    }

    setLoading(true);
    try {
      await onConfirm(selectedStatus, notes || undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const currentConfig = ORDER_STATUS_CONFIG[currentStatus];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
        onClick={() => !loading && onClose()}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-tyrian-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-tyrian-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Update Status
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  #{orderId.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          {availableStatuses.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                No status updates available for your role.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">
                {/* Current Status */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className={`w-2 h-2 rounded-full ${currentConfig.dotColor}`} />
                  <div>
                    <p className="text-xs text-gray-500">Current status</p>
                    <p className={`text-sm font-medium ${currentConfig.color}`}>
                      {currentConfig.label}
                    </p>
                  </div>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <div className="space-y-2">
                    {availableStatuses.map((status) => {
                      const config = ORDER_STATUS_CONFIG[status];
                      const isSelected = selectedStatus === status;

                      return (
                        <label
                          key={status}
                          className={`
                            flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all
                            ${isSelected
                              ? `${config.bgColor} ${config.borderColor}`
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="status"
                            value={status}
                            checked={isSelected}
                            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                            className="sr-only"
                          />
                          <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${isSelected ? config.color : "text-gray-700"}`}>
                              {config.label}
                            </p>
                            <p className="text-xs text-gray-500">{config.description}</p>
                          </div>
                          {isSelected && (
                            <svg className={`w-5 h-5 ${config.iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Notes <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this update..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-tyrian-500/20 focus:border-tyrian-500 resize-none transition-colors"
                    disabled={loading}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <svg
                      className="w-4 h-4 text-red-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedStatus}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-tyrian-800 rounded-lg hover:bg-tyrian-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Updating...
                    </>
                  ) : (
                    "Update Status"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
