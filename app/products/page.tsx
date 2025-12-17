"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { searchProducts } from "@/app/lib/api";
import ProductCard from "@/app/components/products/ProductCard";
import SearchBar from "@/app/components/products/SearchBar";
import ProductFilters from "@/app/components/products/ProductFilters";
import type { SearchQuery, SearchResult } from "@/app/lib/types/product";
import { ProductType, ProductStatus } from "@/app/lib/types/product";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("*");
  const [filters, setFilters] = useState({
    categories: [] as string[],
    tags: [] as string[],
    currency: "USD",
    status: ProductStatus.ACTIVE,
    page: 1,
    size: 20,
    sort_by: "relevance" as const,
    sort_order: "desc" as const,
  });
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build search query - use empty string or "*" to get all products
        const query: SearchQuery = {
          query: searchQuery || "*",
          ...filters,
        };

        const response = await searchProducts(query);

        if (response.success && response.data) {
          setSearchResult(response.data);
        } else {
          setError(response.message || "Failed to search products");
        }
      } catch (err: any) {
        console.error("Search error:", err);

        // Provide more helpful error messages
        if (err.response?.status === 401) {
          setError("Please sign in to browse products");
        } else if (err.response?.status === 503) {
          setError("Search service is temporarily unavailable. Please try again later.");
        } else if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
          setError("Search request timed out. Please try again.");
        } else {
          setError(err.response?.data?.message || err.message || "An error occurred while searching");
        }
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [searchQuery, filters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query || "*");
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-tyrian-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logos/tyrian-purple-with-word.svg"
                alt="Lycusa"
                width={140}
                height={40}
                className="h-10 w-auto"
              />
            </Link>

            <nav className="flex items-center gap-3">
              <Link
                href="/my-products"
                className="px-4 py-2 text-gray-700 hover:text-tyrian-800 transition-colors text-sm font-medium hover:bg-tyrian-50 rounded-lg"
              >
                My Products
              </Link>
              <Link
                href="/products/new"
                className="px-5 py-2 bg-tyrian-800 text-white rounded-lg hover:bg-tyrian-900 transition-all text-sm font-semibold shadow-md hover:shadow-lg"
              >
                Sell Product
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Browse Products
          </h1>
          <p className="text-gray-600">
            Discover unique pre-loved fashion from verified sellers
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
        </div>

        {/* Layout with Filters and Products */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProductFilters filters={filters} onFilterChange={handleFilterChange} />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            {searchResult && !loading && (
              <div className="mb-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">
                    {searchResult.total_results.toLocaleString()}
                  </span>{" "}
                  products found
                  {searchResult.execution_time_ms && (
                    <span className="ml-2">
                      ({searchResult.execution_time_ms.toFixed(0)}ms)
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Page {searchResult.page} of {searchResult.total_pages}
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl shadow-md overflow-hidden"
                  >
                    <div className="aspect-square bg-gray-200 animate-pulse"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                <svg
                  className="w-12 h-12 text-red-600 mx-auto mb-4"
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
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Search Failed
                </h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && searchResult?.results.length === 0 && (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filters to find what you're looking for
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("*");
                    handleFilterChange({
                      categories: [],
                      tags: [],
                      currency: "USD",
                      status: ProductStatus.ACTIVE,
                      sort_by: "relevance",
                      sort_order: "desc",
                    });
                  }}
                  className="px-6 py-3 bg-tyrian-800 text-white rounded-lg hover:bg-tyrian-900 transition-colors font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && searchResult && searchResult.results.length > 0 && (
              <>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {searchResult.results.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {searchResult.total_pages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(searchResult.page - 1)}
                      disabled={searchResult.page === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
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
                    </button>

                    {[...Array(Math.min(5, searchResult.total_pages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            searchResult.page === pageNum
                              ? "bg-tyrian-800 text-white"
                              : "bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {searchResult.total_pages > 5 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}

                    <button
                      onClick={() => handlePageChange(searchResult.page + 1)}
                      disabled={searchResult.page === searchResult.total_pages}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
