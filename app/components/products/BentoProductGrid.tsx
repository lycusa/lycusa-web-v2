"use client";

import Link from "next/link";
import Image from "next/image";
import type { SearchResultItem } from "@/app/lib/types/product";
import { ProductType, ProductStatus } from "@/app/lib/types/product";
import { formatPrice } from "@/app/lib/utils";
import FavoriteButton from "./FavoriteButton";

interface BentoProductGridProps {
  products: SearchResultItem[];
  emptyMessage?: string;
  showInactiveStatus?: boolean;
}

export default function BentoProductGrid({
  products,
  emptyMessage = "No products found",
  showInactiveStatus = false
}: BentoProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {emptyMessage}
          </h3>
          <p className="text-sm text-gray-600">
            Check back later for new listings
          </p>
        </div>
      </div>
    );
  }

  // Function to get grid span classes for bento style - smaller, more compact layout
  const getBentoClass = (index: number) => {
    // Create a subtle pattern that repeats every 8 items - mostly uniform with occasional accents
    const pattern = index % 8;

    switch (pattern) {
      case 0:
        return "md:col-span-1 md:row-span-1"; // Standard
      case 1:
        return "md:col-span-1 md:row-span-1"; // Standard
      case 2:
        return "lg:col-span-2 md:col-span-1 md:row-span-1"; // Wide on large screens only
      case 3:
        return "md:col-span-1 md:row-span-1"; // Standard
      case 4:
        return "md:col-span-1 md:row-span-1"; // Standard
      case 5:
        return "md:col-span-1 md:row-span-1"; // Standard
      case 6:
        return "md:col-span-1 md:row-span-1"; // Standard
      case 7:
        return "md:col-span-1 md:row-span-1"; // Standard
      default:
        return "md:col-span-1 md:row-span-1";
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 auto-rows-[200px] sm:auto-rows-[220px]">
      {products.map((product, index) => {
        const imageUrl = product.media_urls?.[0] || "/placeholder-product.jpg";
        const isPreOrder = product.product_type === ProductType.PRE_ORDER;
        const isActive = product.status === ProductStatus.ACTIVE;
        const bentoClass = getBentoClass(index);

        return (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className={`group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-tyrian-200 hover:-translate-y-0.5 ${bentoClass}`}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            {/* Status Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
              {isPreOrder && (
                <span className="px-2 py-1 bg-tyrian-600/90 text-white text-[10px] font-semibold rounded-md backdrop-blur-sm">
                  Pre-Order
                </span>
              )}
              {!isActive && showInactiveStatus && (
                <span className="px-2 py-1 bg-gray-700/90 text-white text-[10px] font-semibold rounded-md backdrop-blur-sm">
                  Inactive
                </span>
              )}
            </div>

            {/* Favorite Button */}
            <div className="absolute top-2 right-2 z-20">
              <FavoriteButton productId={product.id} size="sm" />
            </div>

            {/* Media Count Badge */}
            {product.media_count > 1 && (
              <div className="absolute bottom-2 left-2 px-1.5 py-1 bg-black/50 backdrop-blur-sm text-white text-[10px] rounded-md flex items-center gap-1 z-10">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">{product.media_count}</span>
              </div>
            )}

            {/* Product Info - Positioned at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
              {/* Category Badge */}
              <span className="inline-block text-[10px] font-semibold text-white/90 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded mb-1.5">
                {product.category}
              </span>

              {/* Product Name */}
              <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2 leading-tight">
                {product.name}
              </h3>

              {/* Price */}
              <p className="text-base font-bold text-white">
                {product.price.currency} {formatPrice(product.price.amount)}
              </p>

              {/* Due Date for Pre-orders - compact */}
              {isPreOrder && product.due_date && (
                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-white/80">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date(product.due_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-tyrian-400/50 rounded-xl transition-all duration-300 pointer-events-none" />
          </Link>
        );
      })}
    </div>
  );
}
