"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getUserProfile } from "@/app/lib/api";
import { useAuth } from "@/app/components/auth/AuthGuard";
import { useProduct } from "@/app/hooks/useProducts";
import type { Product } from "@/app/lib/types/product";
import { ProductType, ProductStatus, ModerationStatus } from "@/app/lib/types/product";
import FavoriteButton from "@/app/components/products/FavoriteButton";
import { AppBackground, Header } from "@/app/components/layout";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const productId = params.id as string;

  const { product, isLoading: loading, error } = useProduct(productId);

  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchSellerProfile = async () => {
      if (!product?.seller_id) return;
      try {
        const sellerResponse = await getUserProfile(product.seller_id);
        if (sellerResponse.success && sellerResponse.data) {
          setSellerProfile(sellerResponse.data);
        }
      } catch (err) {
        console.error("Failed to fetch seller profile:", err);
      }
    };

    fetchSellerProfile();
  }, [product?.seller_id]);

  if (loading) {
    return (
      <AppBackground>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full border-4 border-tyrian-800 border-t-transparent animate-spin" />
              <p className="text-sm text-gray-600 font-medium">Loading product...</p>
            </div>
          </div>
        </main>
      </AppBackground>
    );
  }

  if (error || !product) {
    return (
      <AppBackground>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="glass-frosted rounded-3xl p-12 max-w-lg mx-auto text-center depth-shadow-lg">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Product Not Found</h2>
            <p className="text-gray-600 mb-8">{error || "This product doesn't exist or has been removed."}</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 neumorphic-tyrian text-white rounded-2xl hover:scale-105 transition-all font-semibold glow-tyrian"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Browse Products
            </Link>
          </div>
        </main>
      </AppBackground>
    );
  }

  const isOwner = isAuthenticated && user?.id === product.seller_id;
  const selectedImage = product.media[selectedImageIndex]?.url || "/placeholder-product.jpg";
  const isPreOrder = product.product_type === ProductType.PRE_ORDER;
  const isActive = product.status === ProductStatus.ACTIVE;

  return (
    <AppBackground>
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">

          {/* Left Column - Image Gallery */}
          <div className="lg:col-span-5 space-y-4">
            {/* Main Image Card */}
            <div className="relative group glass-frosted rounded-3xl overflow-hidden depth-shadow-lg hover:depth-shadow-xl transition-all duration-500">
              <div className="aspect-[4/3] relative">
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />

                {/* Glass Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {isPreOrder && (
                    <span className="px-3 py-1.5 bg-purple-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full shadow-lg">
                      Pre-Order
                    </span>
                  )}
                  {!isActive && (
                    <span className="px-3 py-1.5 bg-gray-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full shadow-lg">
                      Inactive
                    </span>
                  )}
                  {product.moderation_status === ModerationStatus.PENDING && (
                    <span className="px-3 py-1.5 bg-amber-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full shadow-lg">
                      Under Review
                    </span>
                  )}
                  {product.moderation_status === ModerationStatus.REJECTED && (
                    <span className="px-3 py-1.5 bg-red-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full shadow-lg">
                      Rejected
                    </span>
                  )}
                </div>

                {/* Favorite Button */}
                <div className="absolute top-4 right-4 z-10">
                  <FavoriteButton productId={productId} size="md" />
                </div>

                {/* Image Counter */}
                {product.media.length > 1 && (
                  <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/40 backdrop-blur-md text-white text-xs font-medium rounded-full">
                    {selectedImageIndex + 1} / {product.media.length}
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.media.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.media.slice(0, 5).map((media, index) => (
                  <button
                    key={media.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
                      selectedImageIndex === index
                        ? "ring-2 ring-tyrian-800 ring-offset-2 scale-95 shadow-lg"
                        : "opacity-70 hover:opacity-100 hover:scale-95 glass"
                    }`}
                  >
                    <Image
                      src={media.url}
                      alt={`${product.name} - ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
                {product.media.length > 5 && (
                  <div className="aspect-square rounded-xl glass-frosted flex items-center justify-center text-sm font-semibold text-gray-700">
                    +{product.media.length - 5}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="lg:col-span-7 grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Title & Price Card - Full Width */}
            <div className="lg:col-span-2 glass-frosted rounded-3xl p-6 depth-shadow-md hover:depth-shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-tyrian-400/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-semibold text-tyrian-800 mb-3">
                      <div className="w-1.5 h-1.5 bg-tyrian-600 rounded-full" />
                      {product.category}
                    </span>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-gray-500 mb-1">Price</p>
                    <p className="text-3xl lg:text-4xl font-bold text-gray-900">
                      <span className="text-tyrian-800">{product.price.currency}</span> {Number(product.price.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Card */}
            <div className="group glass-light rounded-3xl p-5 depth-shadow-md hover:depth-shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-0 glass-reflection pointer-events-none opacity-30" />
              <div className="relative z-10">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">Seller</p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-tyrian-800 to-tyrian-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden shadow-lg shadow-tyrian-700/25 group-hover:scale-110 transition-transform duration-300">
                    {sellerProfile?.avatarUrl ? (
                      <img src={sellerProfile.avatarUrl} alt={sellerProfile.username} className="w-full h-full object-cover" />
                    ) : (
                      sellerProfile?.username?.[0]?.toUpperCase() || "S"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/users/${product.seller_id}`}
                      className="font-bold text-gray-900 hover:text-tyrian-800 transition-colors text-lg truncate block"
                    >
                      {sellerProfile?.username || "Seller"}
                    </Link>
                    {sellerProfile?.bio && (
                      <p className="text-sm text-gray-500 truncate">{sellerProfile.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pre-order Date Card OR Meta Card */}
            {isPreOrder && product.due_date ? (
              <div className="group relative overflow-hidden rounded-3xl p-5 depth-shadow-md hover:depth-shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.95) 0%, rgba(126, 34, 206, 0.98) 100%)',
                }}>
                <div className="absolute inset-0 opacity-20" style={{
                  background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
                }} />
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-white/80">Available From</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {new Date(product.due_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="neumorphic rounded-3xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-gray-100/30 pointer-events-none" />
                <div className="relative z-10">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">Listing Info</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Listed</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(product.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Updated</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(product.updated_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Description Card - Full Width */}
            <div className="lg:col-span-2 glass-frosted rounded-3xl p-6 depth-shadow-md hover:depth-shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-tyrian-50/10 pointer-events-none" />
              <div className="relative z-10">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">Description</p>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Tags Card */}
            <div className="glass rounded-3xl p-5 depth-shadow-sm hover:depth-shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags && product.tags.length > 0 ? (
                    product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 neumorphic-button rounded-xl text-xs font-medium text-gray-700 hover:scale-105 transition-transform cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No tags</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons Card */}
            <div className="flex flex-col gap-3">
              {!isOwner && isActive && (
                <>
                  <button
                    onClick={() => router.push(`/checkout?productId=${productId}&quantity=1`)}
                    className="group flex-1 relative overflow-hidden px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                      }} />
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="relative z-10">Buy Now</span>
                  </button>
                  <button className="group flex-1 px-6 py-4 neumorphic-tyrian text-white rounded-2xl font-bold text-base hover:scale-[1.02] transition-all flex items-center justify-center gap-3 glow-tyrian">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Contact Seller
                  </button>
                </>
              )}
              {isOwner && (
                <Link
                  href={`/products/${productId}/edit`}
                  className="flex-1 px-6 py-4 neumorphic-tyrian text-white rounded-2xl font-bold text-base hover:scale-[1.02] transition-all flex items-center justify-center gap-3 glow-tyrian"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Product
                </Link>
              )}
              {!isOwner && !isActive && (
                <div className="flex-1 glass-frosted rounded-2xl flex items-center justify-center p-6">
                  <div className="text-center">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <p className="text-sm text-gray-500 font-medium">Product not available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Pre-order Meta Card (if pre-order, show listing info here) */}
            {isPreOrder && product.due_date && (
              <div className="lg:col-span-2 glass-light rounded-3xl p-5 depth-shadow-md relative overflow-hidden">
                <div className="absolute inset-0 glass-reflection pointer-events-none opacity-30" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Listed</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(product.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Updated</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(product.updated_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 glass rounded-full border border-tyrian-200/50">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-gray-700">Pre-Order Active</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </AppBackground>
  );
}
