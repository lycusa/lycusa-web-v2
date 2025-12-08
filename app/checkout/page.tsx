"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/auth/AuthGuard";
import { getProduct, placeOrder } from "@/app/lib/api";
import { Product } from "@/app/lib/types/product";
import {
  DeliveryMethod,
  PaymentMethod,
  PlaceOrderRequest,
} from "@/app/lib/types/order";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const productId = searchParams.get("productId");
  const quantity = parseInt(searchParams.get("quantity") || "1", 10);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Form state
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(
    DeliveryMethod.STANDARD
  );
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.STRIPE
  );

  useEffect(() => {
    if (authLoading) return;

    if (!productId) {
      setError("No product selected");
      setLoading(false);
      return;
    }

    fetchProduct();
  }, [productId, authLoading]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await getProduct(productId!);
      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        setError("Product not found");
      }
    } catch (err: any) {
      console.error("Error fetching product:", err);
      setError(err.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!product) return 0;
    return Number(product.price.amount) * quantity;
  };

  const validateForm = () => {
    if (!deliveryAddress.trim()) {
      setError("Please enter a delivery address");
      return false;
    }

    // Address should have at least city, country format
    const addressParts = deliveryAddress.split(",").map((p) => p.trim());
    if (addressParts.length < 2) {
      setError("Address must include at least city and country (comma-separated)");
      return false;
    }

    if (deliveryAddress.length < 10) {
      setError("Please enter a more complete address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated || !user) {
      setError("Please sign in to place an order");
      return;
    }

    if (!product) {
      setError("Product information not available");
      return;
    }

    if (user.id === product.seller_id) {
      setError("You cannot buy your own product");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Generate a mock payment ID (in real implementation, this would come from payment processor)
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const orderData: PlaceOrderRequest = {
        buyer_id: user.id,
        seller_id: product.seller_id,
        items: [
          {
            product_id: product.id,
            unit_price: Number(product.price.amount),
            total_price: calculateTotal(),
            currency: product.price.currency,
          },
        ],
        delivery_info: {
          method: deliveryMethod,
          address: deliveryAddress,
        },
        payment_info: {
          payment_id: paymentId,
          method: paymentMethod,
        },
        currency: product.price.currency,
      };

      const response = await placeOrder(orderData);

      if (response.order_id) {
        setSuccess(true);
        setOrderId(response.order_id);
      } else {
        setError(response.message || "Failed to place order");
      }
    } catch (err: any) {
      console.error("Error placing order:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to place order";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-2xl p-6">
              <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 bg-gray-200 rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sign in to checkout
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to complete your purchase.
          </p>
          <Link
            href={`/signin?redirect=/checkout?productId=${productId}&quantity=${quantity}`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (success && orderId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-600"
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your order has been placed and is awaiting confirmation from the
            seller.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Order ID: <span className="font-mono">{orderId.slice(0, 12)}...</span>
          </p>
          <div className="flex gap-3">
            <Link
              href={`/orders/${orderId}`}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              View Order
            </Link>
            <Link
              href="/products"
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/products" className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="text-sm font-medium">Back to Products</span>
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-12 text-center">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Unable to Checkout
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Browse Products
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={productId ? `/products/${productId}` : "/products"}
              className="flex items-center gap-2 group"
            >
              <svg
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary */}
              {product && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Order Summary
                  </h2>
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.media?.[0]?.url ? (
                        <img
                          src={product.media[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500">{product.category}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Qty: {quantity} x {product.price.currency}{" "}
                        {Number(product.price.amount).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {product.price.currency} {calculateTotal().toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Method */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Delivery Method
                </h2>
                <div className="space-y-3">
                  <label
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                      deliveryMethod === DeliveryMethod.STANDARD
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={DeliveryMethod.STANDARD}
                      checked={deliveryMethod === DeliveryMethod.STANDARD}
                      onChange={(e) =>
                        setDeliveryMethod(e.target.value as DeliveryMethod)
                      }
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        Standard Delivery
                      </p>
                      <p className="text-sm text-gray-500">5-7 business days</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">Free</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                      deliveryMethod === DeliveryMethod.EXPRESS
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={DeliveryMethod.EXPRESS}
                      checked={deliveryMethod === DeliveryMethod.EXPRESS}
                      onChange={(e) =>
                        setDeliveryMethod(e.target.value as DeliveryMethod)
                      }
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        Express Delivery
                      </p>
                      <p className="text-sm text-gray-500">1-2 business days</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-purple-600">+$9.99</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Delivery Address
                </h2>
                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Street address, City, State/Province, ZIP/Postal Code, Country"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Please include street, city, and country (comma-separated)
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === PaymentMethod.STRIPE
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={PaymentMethod.STRIPE}
                      checked={paymentMethod === PaymentMethod.STRIPE}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentMethod)
                      }
                      className="sr-only"
                    />
                    <svg
                      className="w-8 h-8 text-indigo-600 mr-3"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                    </svg>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        Credit/Debit Card
                      </p>
                      <p className="text-sm text-gray-500">
                        Pay securely with Stripe
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === PaymentMethod.CRYPTO
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={PaymentMethod.CRYPTO}
                      checked={paymentMethod === PaymentMethod.CRYPTO}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentMethod)
                      }
                      className="sr-only"
                    />
                    <svg
                      className="w-8 h-8 text-orange-500 mr-3"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 9.93V19h2.87c-.87.48-1.84.8-2.87.93zM18.24 17H13v-1h5.92c-.2.35-.43.69-.68 1zm1.5-3H13v-1h6.93c-.04.34-.11.67-.19 1z" />
                    </svg>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Cryptocurrency</p>
                      <p className="text-sm text-gray-500">
                        Pay with ETH, SOL, or other crypto
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Total */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Order Total
                </h2>

                {product && (
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">
                        {product.price.currency} {calculateTotal().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery</span>
                      <span className="text-gray-900">
                        {deliveryMethod === DeliveryMethod.EXPRESS
                          ? "$9.99"
                          : "Free"}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold text-gray-900">
                          {product.price.currency}{" "}
                          {(
                            calculateTotal() +
                            (deliveryMethod === DeliveryMethod.EXPRESS ? 9.99 : 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !product}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin w-5 h-5"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
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
                      Place Order
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing your order, you agree to our Terms of Service and
                  Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
