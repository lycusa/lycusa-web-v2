"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/auth/AuthGuard";
import ProductForm from "@/app/components/products/ProductForm";
import { createProduct } from "@/app/lib/api";

export default function NewProductPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  const handleSubmit = async (data: any) => {
    try {
      const response = await createProduct(data);

      if (response.success && response.data?.product_id) {
        router.push(`/products/${response.data.product_id}`);
      } else {
        throw new Error(response.message || "Failed to create product");
      }
    } catch (error) {
      console.error("Create product error:", error);
      throw error;
    }
  };

  if (loading) {
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
              You need to sign in to create a product listing
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/products" className="flex items-center gap-2 group">
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
            <span className="text-sm font-medium">Back to Products</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Page Header */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              List a Product
            </h1>
            <p className="text-gray-600">
              Share your pre-loved fashion with the community
            </p>
          </div>

          {/* Product Form */}
          <ProductForm
            sellerId={user.id}
            onSubmit={handleSubmit}
            submitLabel="Create Product"
          />
        </div>
      </main>
    </div>
  );
}
