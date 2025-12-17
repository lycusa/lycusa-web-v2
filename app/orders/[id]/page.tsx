"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/auth/AuthGuard";
import {
  getOrder,
  cancelOrder,
  updateOrderStatus,
  completeOrder,
  getUserProfile,
  getProduct,
  submitRating,
  getConversationByOrderIdWithRetry,
} from "@/app/lib/api";
import {
  Order,
  OrderStatus,
  ORDER_STATUS_CONFIG,
  ORDER_STATUS_STEPS,
  getStatusStepIndex,
  isTerminalStatus,
  PaymentMethod,
  DeliveryMethod,
} from "@/app/lib/types/order";
import OrderStatusBadge from "@/app/components/orders/OrderStatusBadge";
import OrderTimeline from "@/app/components/orders/OrderTimeline";
import OrderActions from "@/app/components/orders/OrderActions";
import RatingModal from "@/app/components/orders/RatingModal";
import StarRating from "@/app/components/orders/StarRating";

interface UserProfile {
  username: string;
  bio?: string;
}

interface ProductInfo {
  id: string;
  name: string;
  media?: { url: string }[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buyerProfile, setBuyerProfile] = useState<UserProfile | null>(null);
  const [sellerProfile, setSellerProfile] = useState<UserProfile | null>(null);
  const [productInfos, setProductInfos] = useState<Record<string, ProductInfo>>({});
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [submittedRating, setSubmittedRating] = useState<number | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    fetchOrder();
  }, [orderId, isAuthenticated, authLoading]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getOrder(orderId);

      if (response) {
        setOrder(response);

        // Fetch conversation (single attempt, no retry needed on initial load)
        try {
          const conv = await getConversationByOrderIdWithRetry(response.id, 0, 0);
          if (conv) {
            setConversationId(conv.id);
          }
        } catch (err) {
          console.error("Error fetching conversation:", err);
        }

        // Fetch user profiles
        try {
          const [buyerRes, sellerRes] = await Promise.all([
            getUserProfile(response.buyer_id),
            getUserProfile(response.seller_id),
          ]);
          if (buyerRes.success) setBuyerProfile(buyerRes.data);
          if (sellerRes.success) setSellerProfile(sellerRes.data);
        } catch (err) {
          console.error("Error fetching profiles:", err);
        }

        // Fetch product info for each item
        const productIds = Array.from(new Set(response.items.map((item: any) => item.product_id as string))) as string[];
        const productPromises = productIds.map(async (id) => {
          try {
            const productRes = await getProduct(id);
            if (productRes.success && productRes.data) {
              return { id, data: productRes.data };
            }
          } catch (err) {
            console.error(`Error fetching product ${id}:`, err);
          }
          return null;
        });

        const products = await Promise.all(productPromises);
        const productMap: Record<string, ProductInfo> = {};
        products.forEach((p) => {
          if (p) productMap[p.id] = p.data;
        });
        setProductInfos(productMap);
      }
    } catch (err: any) {
      console.error("Error fetching order:", err);
      setError(err.response?.data?.message || err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reason: string) => {
    if (!order || !user) return;
    await cancelOrder(order.id, {
      order_id: order.id,
      cancelled_by: user.id,
      reason,
    });
    await fetchOrder();
  };

  const handleUpdateStatus = async (newStatus: OrderStatus, notes?: string) => {
    if (!order || !user) return;
    await updateOrderStatus(order.id, {
      new_status: newStatus,
      updated_by: user.id,
      notes,
    });
    await fetchOrder();
  };

  const handleComplete = async (notes?: string) => {
    if (!order || !user) return;
    await completeOrder(order.id, {
      order_id: order.id,
      completed_by: user.id,
      completion_notes: notes,
    });
    await fetchOrder();
  };

  const handleRating = async (rating: number) => {
    if (!order) return;
    await submitRating(order.id, rating);
    setHasRated(true);
    setSubmittedRating(rating);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number | string, currency: string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) {
      return `0.00 ${currency}`;
    }
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(numAmount);
    }
    return `${numAmount.toFixed(2)} ${currency}`;
  };

  const handleContact = async () => {
    // If conversation ID is already found, use it
    if (conversationId) {
      router.push(`/messages/${conversationId}`);
      return;
    }

    if (!order) return;

    // Try to find conversation with retry logic
    // This handles cases where the Kafka event hasn't been processed yet
    setContactLoading(true);
    setContactError(null);

    try {
      const conv = await getConversationByOrderIdWithRetry(order.id, 3, 1000);

      if (conv) {
        setConversationId(conv.id);
        router.push(`/messages/${conv.id}`);
      } else {
        // Conversation not found after retries - show error
        setContactError("Chat not available yet. Please try again in a moment.");
      }
    } catch (err) {
      console.error("Error finding conversation:", err);
      setContactError("Failed to open chat. Please try again.");
    } finally {
      setContactLoading(false);
    }
  };

  // Loading skeleton
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-20 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Sign in required</h2>
          <p className="text-sm text-gray-600 mb-6">Please sign in to view this order.</p>
          <Link href="/signin" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link href="/orders" className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Order not found</h2>
            <p className="text-sm text-gray-600 mb-6">{error || "This order doesn't exist or you don't have access."}</p>
            <Link href="/orders" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
              View All Orders
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isBuyer = order.buyer_id === user?.id;
  const isSeller = order.seller_id === user?.id;
  const currentStepIndex = getStatusStepIndex(order.status);
  const isTerminal = isTerminalStatus(order.status);
  const statusConfig = ORDER_STATUS_CONFIG[order.status];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/orders" className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-gray-900">
                    Order #{orderId.slice(0, 8).toUpperCase()}
                  </h1>
                  <OrderStatusBadge status={order.status} size="sm" />
                </div>
                <p className="text-xs text-gray-500">{formatDate(order.placed_at)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(order.total_amount, order.currency)}
              </p>
              <p className="text-xs text-gray-500">
                {isBuyer ? "You're buying" : "You're selling"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Progress Bar (for non-terminal orders) */}
          {!isTerminal && currentStepIndex >= 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                {ORDER_STATUS_STEPS.map((step, index) => {
                  const stepConfig = ORDER_STATUS_CONFIG[step];
                  const isActive = index === currentStepIndex;
                  const isCompleted = index < currentStepIndex;

                  return (
                    <div key={step} className="flex-1 flex items-center">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                            ${isCompleted ? "bg-emerald-500 text-white" : ""}
                            ${isActive ? `${stepConfig.bgColor} ${stepConfig.color}` : ""}
                            ${!isCompleted && !isActive ? "bg-gray-100 text-gray-400" : ""}
                          `}
                        >
                          {isCompleted ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span className={`text-xs mt-1.5 ${isActive ? stepConfig.color : "text-gray-500"}`}>
                          {stepConfig.label}
                        </span>
                      </div>
                      {index < ORDER_STATUS_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 ${index < currentStepIndex ? "bg-emerald-500" : "bg-gray-200"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-center text-gray-600">{statusConfig.description}</p>
            </div>
          )}

          {/* Cancelled/Failed Status Banner */}
          {(order.status === OrderStatus.CANCELLED || order.status === OrderStatus.FAILED) && (
            <div className={`rounded-lg border p-4 ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full ${statusConfig.bgColor} flex items-center justify-center`}>
                  <svg className={`w-4 h-4 ${statusConfig.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-medium ${statusConfig.color}`}>
                    Order {order.status === OrderStatus.CANCELLED ? "Cancelled" : "Failed"}
                  </p>
                  {order.cancellation_reason && (
                    <p className="text-sm text-gray-600 mt-1">{order.cancellation_reason}</p>
                  )}
                  {order.cancelled_at && (
                    <p className="text-xs text-gray-500 mt-1">on {formatDateTime(order.cancelled_at)}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Items ({order.items.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {order.items.map((item) => {
                    const product = productInfos[item.product_id];
                    return (
                      <div key={item.id} className="p-4 flex gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product?.media?.[0]?.url ? (
                            <img src={product.media[0].url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${item.product_id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                            {product?.name || `Product #${item.product_id.slice(0, 8)}`}
                          </Link>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Qty: {item.quantity} × {formatCurrency(item.unit_price, item.currency)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.total_price, item.currency)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(order.total_amount, order.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-900">Delivery</h2>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Delivery Address</p>
                      <p className="text-sm text-gray-900">{order.delivery_address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Method</p>
                      <p className="text-sm text-gray-900 capitalize">
                        {order.delivery_method === DeliveryMethod.EXPRESS ? "Express" : "Standard"} Delivery
                      </p>
                    </div>
                  </div>
                  {order.tracking_number && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tracking Number</p>
                        <p className="text-sm font-mono text-violet-600">{order.tracking_number}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-900">Payment</h2>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      {order.payment_method === PaymentMethod.CRYPTO ? (
                        <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 9.93V19h2.87c-.87.48-1.84.8-2.87.93zM18.24 17H13v-1h5.92c-.2.35-.43.69-.68 1zm1.5-3H13v-1h6.93c-.04.34-.11.67-.19 1z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payment Method</p>
                      <p className="text-sm text-gray-900">
                        {order.payment_method === PaymentMethod.CRYPTO ? "Cryptocurrency" : "Credit Card (Stripe)"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payment ID</p>
                      <p className="text-sm font-mono text-gray-600">{order.payment_id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              {user && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900">Actions</h2>
                  </div>
                  <div className="p-4 space-y-3">
                    <OrderActions
                      order={order}
                      currentUserId={user.id}
                      onCancel={handleCancel}
                      onUpdateStatus={handleUpdateStatus}
                      onComplete={handleComplete}
                    />

                    {/* Message Button - Always visible */}
                    <button
                      onClick={handleContact}
                      disabled={contactLoading}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        contactLoading
                          ? "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
                          : "text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100"
                      }`}
                    >
                      {contactLoading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Opening chat...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {conversationId ? "Continue Chat" : (isBuyer ? "Contact Seller" : "Contact Buyer")}
                        </>
                      )}
                    </button>

                    {/* Contact Error Message */}
                    {contactError && (
                      <div className="px-3 py-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                        {contactError}
                      </div>
                    )}

                    {/* Rate Order Button - only for buyer when order is completed */}
                    {isBuyer && order.status === OrderStatus.COMPLETED && !hasRated && (
                      <button
                        onClick={() => setShowRatingModal(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        Rate This Order
                      </button>
                    )}

                    {/* Already Rated Message */}
                    {isBuyer && order.status === OrderStatus.COMPLETED && hasRated && submittedRating && (
                      <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-emerald-700" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                          <span className="text-sm font-medium text-emerald-700">
                            Rating submitted
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pl-6">
                          <StarRating rating={submittedRating} size="md" showValue />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Participants */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-900">Participants</h2>
                </div>
                <div className="p-4 space-y-4">
                  {/* Buyer */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                      {buyerProfile?.username?.[0]?.toUpperCase() || "B"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link href={`/users/${order.buyer_id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors truncate">
                          {buyerProfile?.username || "Buyer"}
                        </Link>
                        {isBuyer && (
                          <span className="px-1.5 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded">You</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Buyer</p>
                    </div>
                  </div>

                  {/* Seller */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-medium text-sm">
                      {sellerProfile?.username?.[0]?.toUpperCase() || "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link href={`/users/${order.seller_id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors truncate">
                          {sellerProfile?.username || "Seller"}
                        </Link>
                        {isSeller && (
                          <span className="px-1.5 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-100 rounded">You</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Seller</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-900">Activity</h2>
                </div>
                <div className="p-4">
                  <OrderTimeline history={order.status_history || []} compact />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onConfirm={handleRating}
        orderId={orderId}
      />
    </div>
  );
}
