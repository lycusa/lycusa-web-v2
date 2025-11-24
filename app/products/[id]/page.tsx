"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProduct, getUserProfile } from "@/app/lib/api";
import { useAuth } from "@/app/components/auth/AuthGuard";
import type { Product } from "@/app/lib/types/product";
import { ProductType, ProductStatus, ModerationStatus } from "@/app/lib/types/product";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProduct(productId);

        if (response.success && response.data) {
          setProduct(response.data);

          // Fetch seller profile
          try {
            const sellerResponse = await getUserProfile(response.data.seller_id);
            if (sellerResponse.success && sellerResponse.data) {
              setSellerProfile(sellerResponse.data);
            }
          } catch (err) {
            console.error("Failed to fetch seller profile:", err);
          }
        } else {
          setError(response.message || "Product not found");
        }
      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="aspect-square bg-gray-200 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-12 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-12 text-center">
            <svg
              className="w-16 h-16 text-red-600 mx-auto mb-4"
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
              Product Not Found
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Browse Products
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isOwner = isAuthenticated && user?.id === product.seller_id;
  const selectedImage =
    product.media[selectedImageIndex]?.url || "/placeholder-product.jpg";
  const isPreOrder = product.product_type === ProductType.PRE_ORDER;
  const isActive = product.status === ProductStatus.ACTIVE;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
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

            {isOwner && (
              <Link
                href={`/products/${productId}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Edit Product
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-xl">
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />

              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {isPreOrder && (
                  <span className="px-3 py-1.5 bg-purple-600 text-white text-sm font-semibold rounded-full shadow-lg">
                    Pre-Order
                  </span>
                )}
                {!isActive && (
                  <span className="px-3 py-1.5 bg-gray-600 text-white text-sm font-semibold rounded-full shadow-lg">
                    Inactive
                  </span>
                )}
                {product.moderation_status === ModerationStatus.PENDING && (
                  <span className="px-3 py-1.5 bg-yellow-600 text-white text-sm font-semibold rounded-full shadow-lg">
                    Under Review
                  </span>
                )}
                {product.moderation_status === ModerationStatus.REJECTED && (
                  <span className="px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-full shadow-lg">
                    Rejected
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.media.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.media.map((media, index) => (
                  <button
                    key={media.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-blue-600 shadow-lg"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={media.url}
                      alt={`${product.name} - ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <div>
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg border border-blue-200">
                {product.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-gray-900">
                {product.price.currency} {product.price.amount.toFixed(2)}
              </span>
            </div>

            {/* Due Date for Pre-orders */}
            {isPreOrder && product.due_date && (
              <div className="flex items-center gap-2 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-purple-900">
                    Available from
                  </p>
                  <p className="text-sm text-purple-700">
                    {new Date(product.due_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Info */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Seller</h2>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {sellerProfile?.username?.[0]?.toUpperCase() || "S"}
                </div>
                <div className="flex-1">
                  <Link
                    href={`/users/${product.seller_id}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {sellerProfile?.username || "Seller"}
                  </Link>
                  {sellerProfile?.bio && (
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {sellerProfile.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!isOwner && isActive && (
              <div className="space-y-3">
                <button className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  Contact Seller
                </button>
                <button className="w-full px-8 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all font-semibold">
                  Add to Wishlist
                </button>
              </div>
            )}

            {/* Product Meta */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Listed</p>
                  <p className="font-medium text-gray-900">
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Updated</p>
                  <p className="font-medium text-gray-900">
                    {new Date(product.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
