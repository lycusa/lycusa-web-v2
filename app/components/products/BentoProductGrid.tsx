"use client";

import Link from "next/link";
import Image from "next/image";
import type { SearchResultItem } from "@/app/lib/types/product";
import { ProductType, ProductStatus } from "@/app/lib/types/product";
import { formatPrice } from "@/app/lib/utils";

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

  // Function to get grid span classes for bento style
  const getBentoClass = (index: number) => {
    // Create a pattern that repeats every 6 items
    const pattern = index % 6;

    switch (pattern) {
      case 0:
        return "md:col-span-2 md:row-span-2"; // Large square
      case 1:
        return "md:col-span-1 md:row-span-1"; // Small
      case 2:
        return "md:col-span-1 md:row-span-1"; // Small
      case 3:
        return "md:col-span-1 md:row-span-2"; // Tall
      case 4:
        return "md:col-span-2 md:row-span-1"; // Wide
      case 5:
        return "md:col-span-1 md:row-span-1"; // Small
      default:
        return "md:col-span-1 md:row-span-1";
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[280px]">
      {products.map((product, index) => {
        const imageUrl = product.media_urls?.[0] || "/placeholder-product.jpg";
        const isPreOrder = product.product_type === ProductType.PRE_ORDER;
        const isActive = product.status === ProductStatus.ACTIVE;
        const bentoClass = getBentoClass(index);

        return (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className={`group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-tyrian-200 ${bentoClass}`}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />
            </div>

            {/* Status Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {isPreOrder && (
                <span className="px-3 py-1.5 bg-brand-500 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm">
                  Pre-Order
                </span>
              )}
              {!isActive && showInactiveStatus && (
                <span className="px-3 py-1.5 bg-gray-700 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm">
                  Inactive
                </span>
              )}
            </div>

            {/* Media Count Badge */}
            {product.media_count > 1 && (
              <div className="absolute top-4 right-4 px-2.5 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs rounded-lg flex items-center gap-1.5 z-10">
                <svg
                  className="w-3.5 h-3.5"
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
                <span className="font-medium">{product.media_count}</span>
              </div>
            )}

            {/* Product Info - Positioned at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
              {/* Category Badge */}
              <div className="mb-2">
                <span className="inline-block text-xs font-bold text-white bg-tyrian-600/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  {product.category}
                </span>
              </div>

              {/* Product Name */}
              <h3 className="text-lg md:text-xl font-bold text-white mb-2 line-clamp-2 drop-shadow-lg">
                {product.name}
              </h3>

              {/* Description - Only show on larger cards */}
              {bentoClass.includes("row-span-2") && (
                <p className="text-sm text-gray-200 mb-3 line-clamp-2 drop-shadow-md">
                  {product.description}
                </p>
              )}

              {/* Price */}
              <div className="flex items-center justify-between">
                <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                  {product.price.currency} {formatPrice(product.price.amount)}
                </p>
              </div>

              {/* Tags - Only show on larger cards */}
              {bentoClass.includes("col-span-2") && product.tags && product.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {product.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="text-xs text-white bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-md font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                  {product.tags.length > 3 && (
                    <span className="text-xs text-white/80 px-2 py-1 font-medium">
                      +{product.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Due Date for Pre-orders */}
              {isPreOrder && product.due_date && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-white bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg inline-flex">
                  <svg
                    className="w-4 h-4"
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
                  <span className="font-medium">
                    Available: {new Date(product.due_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-tyrian-400 rounded-2xl transition-all duration-300 pointer-events-none" />
          </Link>
        );
      })}
    </div>
  );
}
