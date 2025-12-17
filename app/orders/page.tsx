"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/components/auth/AuthGuard";
import { listOrders } from "@/app/lib/api";
import { OrderListItem, OrderStatus, ORDER_STATUS_CONFIG } from "@/app/lib/types/order";
import OrderCard from "@/app/components/orders/OrderCard";
import { AppBackground, Header } from "@/app/components/layout";

type TabType = "all" | "buying" | "selling";

export default function OrdersPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const LIMIT = 12;

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    fetchOrders(true);
  }, [isAuthenticated, user, authLoading, statusFilter]);

  const fetchOrders = async (reset: boolean = false) => {
    if (!user) return;

    try {
      if (reset) {
        setLoading(true);
        setOffset(0);
      } else {
        setLoadingMore(true);
      }

      const currentOffset = reset ? 0 : offset;
      const response = await listOrders({
        status: statusFilter || undefined,
        limit: LIMIT,
        offset: currentOffset,
      });

      if (response.orders) {
        if (reset) {
          setOrders(response.orders);
        } else {
          setOrders((prev) => [...prev, ...response.orders]);
        }
        setHasMore(response.has_more);
        setTotalCount(response.total_count || response.orders.length);
        setOffset(currentOffset + response.orders.length);
      }
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchOrders(false);
    }
  };

  // Filter orders by tab
  const filteredOrders = orders.filter((order) => {
    if (!user) return false;
    if (activeTab === "buying") return order.buyer_id === user.id;
    if (activeTab === "selling") return order.seller_id === user.id;
    return true;
  });

  // Count orders by tab
  const getCounts = () => {
    if (!user) return { all: 0, buying: 0, selling: 0 };
    return {
      all: orders.length,
      buying: orders.filter((o) => o.buyer_id === user.id).length,
      selling: orders.filter((o) => o.seller_id === user.id).length,
    };
  };

  const counts = getCounts();

  if (authLoading) {
    return (
      <AppBackground>
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="flex items-center gap-3 text-gray-500">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      </AppBackground>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppBackground>
        <Header />
        <div className="max-w-lg mx-auto px-4 py-16">
          <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-200/50 p-8 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Sign in required</h2>
            <p className="text-sm text-gray-600 mb-6">Please sign in to view your orders.</p>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-tyrian-800 rounded-xl hover:bg-tyrian-900 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      {/* Header */}
      <Header />

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
              {(["all", "buying", "selling"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-3 py-1.5 text-sm font-medium rounded-md transition-all
                    ${activeTab === tab
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                    }
                  `}
                >
                  {tab === "all" && `All${counts.all > 0 ? ` (${counts.all})` : ""}`}
                  {tab === "buying" && `Purchases${counts.buying > 0 ? ` (${counts.buying})` : ""}`}
                  {tab === "selling" && `Sales${counts.selling > 0 ? ` (${counts.selling})` : ""}`}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
              >
                <option value="">All</option>
                {Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => (
                  <option key={status} value={status}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading State */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex justify-between">
                    <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                    <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="p-4">
                  <div className="h-6 w-20 bg-gray-100 rounded animate-pulse mb-2" />
                  <div className="h-4 w-12 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-900 font-medium mb-1">Failed to load orders</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => fetchOrders(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No orders found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              {activeTab === "all" && "You haven't placed or received any orders yet."}
              {activeTab === "buying" && "You haven't made any purchases yet."}
              {activeTab === "selling" && "You haven't received any orders yet."}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* Orders Grid */}
        {!loading && !error && filteredOrders.length > 0 && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  currentUserId={user?.id || ""}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </AppBackground>
  );
}
