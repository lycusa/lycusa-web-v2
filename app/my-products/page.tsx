"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/components/auth/AuthGuard";
import { searchProducts, deleteProduct } from "@/app/lib/api";
import type { SearchResultItem } from "@/app/lib/types/product";
import { ProductType, ProductStatus, ModerationStatus } from "@/app/lib/types/product";

export default function MyProductsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyProducts = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response = await searchProducts({
          query: "*",
          seller_id: user.id,
          page: 1,
          size: 100,
          sort_by: "created_at",
          sort_order: "desc",
        });

        if (response.success && response.data) {
          setProducts(response.data.results);
        } else {
          setError(response.message || "Failed to load products");
        }
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchMyProducts();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, isAuthenticated, authLoading]);

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    setDeletingId(productId);
    try {
      const response = await deleteProduct(productId);

      if (response.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      } else {
        alert(response.message || "Failed to delete product");
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.message || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-12 text-center">
            <svg
              className="w-16 h-16 text-yellow-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              You need to sign in to view your products
            </p>
            <Link
              href="/signin"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sign In
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const activeProducts = products.filter((p) => p.status === ProductStatus.ACTIVE);
  const inactiveProducts = products.filter((p) => p.status === ProductStatus.INACTIVE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <svg
                  className="w-6 h-6 text-white"
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
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Lycusa
              </span>
            </Link>

            <nav className="flex items-center gap-3">
              <Link
                href="/products"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium hover:bg-gray-100 rounded-lg"
              >
                Browse Products
              </Link>
              <Link
                href="/products/new"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-semibold shadow-md hover:shadow-lg"
              >
                List New Product
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Products</h1>
          <p className="text-gray-600">
            Manage your product listings and track their performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeProducts.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inactiveProducts.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center mb-8">
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
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!error && products.length === 0 && (
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start selling by listing your first product
            </p>
            <Link
              href="/products/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              List Your First Product
            </Link>
          </div>
        )}

        {/* Products List */}
        {!error && products.length > 0 && (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="grid md:grid-cols-5 gap-6 p-6">
                  {/* Product Image */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={product.media_urls?.[0] || "/placeholder-product.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                    {product.media_count > 1 && (
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                        +{product.media_count - 1}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded">
                        {product.category}
                      </span>
                      {product.status === ProductStatus.ACTIVE ? (
                        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                          Inactive
                        </span>
                      )}
                      {product.product_type === ProductType.PRE_ORDER && (
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded">
                          Pre-Order
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {product.tags?.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & Dates */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Price</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {product.price.currency} {product.price.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Listed</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(product.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium text-center"
                    >
                      View
                    </Link>
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium text-center"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {deletingId === product.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
