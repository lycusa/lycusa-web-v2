"use client";

import { useState } from "react";
import {
  Order,
  OrderStatus,
  CANCELLABLE_STATUSES,
  VALID_STATUS_TRANSITIONS,
  SELLER_ALLOWED_STATUSES,
  BUYER_ALLOWED_STATUSES,
} from "@/app/lib/types/order";
import CancelOrderModal from "./CancelOrderModal";
import UpdateStatusModal from "./UpdateStatusModal";

interface OrderActionsProps {
  order: Order;
  currentUserId: string;
  onCancel: (reason: string) => Promise<void>;
  onUpdateStatus: (newStatus: OrderStatus, notes?: string) => Promise<void>;
  onComplete: (notes?: string) => Promise<void>;
}

export default function OrderActions({
  order,
  currentUserId,
  onCancel,
  onUpdateStatus,
  onComplete,
}: OrderActionsProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [completing, setCompleting] = useState(false);

  const isBuyer = order.buyer_id === currentUserId;
  const isSeller = order.seller_id === currentUserId;

  // Check if order can be cancelled
  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  // Check if user can update status
  const getAvailableStatusUpdates = () => {
    const validTransitions = VALID_STATUS_TRANSITIONS[order.status] || [];
    return validTransitions.filter((status) => {
      if (isSeller && SELLER_ALLOWED_STATUSES.includes(status)) return true;
      if (isBuyer && BUYER_ALLOWED_STATUSES.includes(status)) return true;
      return false;
    });
  };

  const canUpdateStatus = getAvailableStatusUpdates().length > 0;

  // Check if buyer can complete order
  const canComplete = isBuyer && order.status === OrderStatus.DELIVERED;

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await onComplete(completionNotes || undefined);
      setShowCompleteConfirm(false);
      setCompletionNotes("");
    } catch (err) {
      console.error("Failed to complete order:", err);
    } finally {
      setCompleting(false);
    }
  };

  // No actions available
  if (!canCancel && !canUpdateStatus && !canComplete) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Complete Order (Buyer only, after delivery) */}
      {canComplete && !showCompleteConfirm && (
        <button
          onClick={() => setShowCompleteConfirm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Complete Order
        </button>
      )}

      {/* Complete Confirmation Inline */}
      {showCompleteConfirm && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
          <p className="text-sm text-emerald-800 mb-3">
            Confirm that you received everything in good condition.
          </p>
          <textarea
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Add notes (optional)..."
            rows={2}
            className="w-full px-3 py-2 text-sm border border-emerald-200 rounded-lg mb-3 resize-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowCompleteConfirm(false);
                setCompletionNotes("");
              }}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleComplete}
              disabled={completing}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {completing ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Completing...
                </>
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Update Status */}
      {canUpdateStatus && (
        <button
          onClick={() => setShowStatusModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-tyrian-800 rounded-lg hover:bg-tyrian-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Update Status
        </button>
      )}

      {/* Cancel Order */}
      {canCancel && (
        <button
          onClick={() => setShowCancelModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancel Order
        </button>
      )}

      {/* Modals */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={onCancel}
        orderId={order.id}
        refundAmount={order.total_amount}
        currency={order.currency}
      />

      <UpdateStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={onUpdateStatus}
        orderId={order.id}
        currentStatus={order.status}
        isBuyer={isBuyer}
        isSeller={isSeller}
      />
    </div>
  );
}
