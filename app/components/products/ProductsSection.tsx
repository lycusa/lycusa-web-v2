"use client";

import { useState, useEffect } from "react";
import { searchProducts } from "@/app/lib/api";
import type { SearchResultItem } from "@/app/lib/types/product";
import { ProductStatus } from "@/app/lib/types/product";
import BentoProductGrid from "./BentoProductGrid";

interface ProductsSectionProps {
  sellerId: string;
  isOwnProfile: boolean; // true if viewing own profile, false if viewing another user's profile
  initialProducts?: SearchResultItem[];
}

export default function ProductsSection({
  sellerId,
  isOwnProfile,
  initialProducts,
}: ProductsSectionProps) {
  const [products, setProducts] = useState<SearchResultItem[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">(
    isOwnProfile ? "all" : "active"
  );

  useEffect(() => {
    if (!initialProducts) {
      loadProducts();
    }
  }, [sellerId, isOwnProfile, initialProducts]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use searchProducts API with seller_id filter
      const response = await searchProducts({
        query: "*",
        seller_id: sellerId,
        page: 1,
        size: 100,
        sort_by: "created_at",
        sort_order: "desc",
        // Only filter by status if viewing another user's profile
        ...(isOwnProfile ? {} : { status: ProductStatus.ACTIVE }),
      });

      if (response.success && response.data) {
        setProducts(response.data.results || []);
      } else {
        setError(response.message || "Failed to load products");
      }
    } catch (err: any) {
      console.error("Error loading products:", err);
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on active filter (only for own profile)
  const getFilteredProducts = () => {
    if (!isOwnProfile) return products;

    switch (activeFilter) {
      case "active":
        return products.filter((p) => p.status === "active");
      case "inactive":
        return products.filter((p) => p.status === "inactive");
      default:
        return products;
    }
  };

  const filteredProducts = getFilteredProducts();
  const activeCount = products.filter((p) => p.status === "active").length;
  const inactiveCount = products.filter((p) => p.status === "inactive").length;

  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 auto-rows-[200px] sm:auto-rows-[220px]">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200/60 rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-400 mb-3"
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
          <h3 className="text-lg font-semibold text-red-900 mb-1">
            Error loading products
          </h3>
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={loadProducts}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-tyrian-100 to-tyrian-200 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-tyrian-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {isOwnProfile ? "My Products" : "Products"}
            </h2>
            <p className="text-sm text-gray-500">
              {products.length} {products.length === 1 ? "listing" : "listings"}
              {isOwnProfile && products.length > 0 && (
                <span className="text-gray-400">
                  {" "}· {activeCount} active
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Filter Buttons (only for own profile) */}
        {isOwnProfile && products.length > 0 && (
          <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl border border-gray-200/50">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === "all"
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              All
              <span className={`ml-1.5 ${activeFilter === "all" ? "text-tyrian-600" : "text-gray-400"}`}>
                {products.length}
              </span>
            </button>
            <button
              onClick={() => setActiveFilter("active")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === "active"
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Active
              <span className={`ml-1.5 ${activeFilter === "active" ? "text-emerald-600" : "text-gray-400"}`}>
                {activeCount}
              </span>
            </button>
            <button
              onClick={() => setActiveFilter("inactive")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === "inactive"
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Inactive
              <span className={`ml-1.5 ${activeFilter === "inactive" ? "text-amber-600" : "text-gray-400"}`}>
                {inactiveCount}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <BentoProductGrid
        products={filteredProducts}
        emptyMessage={
          isOwnProfile
            ? activeFilter === "all"
              ? "You haven't listed any products yet"
              : `No ${activeFilter} products`
            : "This seller has no active products"
        }
        showInactiveStatus={isOwnProfile}
      />
    </div>
  );
}
