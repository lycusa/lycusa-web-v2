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
      <div className="py-12">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[280px]">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-2xl"
                style={{
                  gridColumn: i % 6 === 0 ? "span 2" : "span 1",
                  gridRow: i % 6 === 0 || i % 6 === 3 ? "span 2" : "span 1",
                }}
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
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isOwnProfile ? "My Products" : "Products"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {products.length} {products.length === 1 ? "listing" : "listings"}
              {isOwnProfile && (
                <>
                  {" "}
                  ({activeCount} active, {inactiveCount} inactive)
                </>
              )}
            </p>
          </div>
        </div>

        {/* Filter Buttons (only for own profile) */}
        {isOwnProfile && products.length > 0 && (
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeFilter === "all"
                  ? "bg-white text-tyrian-800 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setActiveFilter("active")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeFilter === "active"
                  ? "bg-white text-tyrian-800 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setActiveFilter("inactive")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeFilter === "inactive"
                  ? "bg-white text-tyrian-800 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Inactive ({inactiveCount})
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
