"use client";

import Link from "next/link";
import Image from "next/image";
import type { SearchResultItem } from "@/app/lib/types/product";
import { ProductType, ProductStatus } from "@/app/lib/types/product";
import { formatPrice } from "@/app/lib/utils";

interface ProductCardProps {
  product: SearchResultItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.media_urls?.[0] || "/placeholder-product.jpg";
  const isPreOrder = product.product_type === ProductType.PRE_ORDER;
  const isActive = product.status === ProductStatus.ACTIVE;

  // Helper function to render highlighted text
  const renderHighlightedText = (text: string, highlights?: string[]) => {
    if (!highlights || highlights.length === 0) {
      return text;
    }

    // Use the first highlight if available
    const highlighted = highlights[0];
    // Parse the <em> tags and render with emphasis
    const parts = highlighted.split(/(<em>|<\/em>)/g);
    let isHighlighted = false;

    return (
      <>
        {parts.map((part, i) => {
          if (part === '<em>') {
            isHighlighted = true;
            return null;
          } else if (part === '</em>') {
            isHighlighted = false;
            return null;
          } else if (part) {
            return isHighlighted ? (
              <span key={i} className="bg-yellow-200 font-semibold">{part}</span>
            ) : (
              <span key={i}>{part}</span>
            );
          }
          return null;
        })}
      </>
    );
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isPreOrder && (
              <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full shadow-lg">
                Pre-Order
              </span>
            )}
            {!isActive && (
              <span className="px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-full shadow-lg">
                Inactive
              </span>
            )}
          </div>

          {/* Media Count Badge */}
          {product.media_count > 1 && (
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs rounded-lg flex items-center gap-1">
              <svg
                className="w-3 h-3"
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
              <span>{product.media_count}</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-5">
          {/* Category */}
          <div className="mb-2">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              {product.category}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {renderHighlightedText(product.name, product.highlights?.name)}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {renderHighlightedText(product.description, product.highlights?.description)}
          </p>

          {/* Price and Tags */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {product.price.currency} {formatPrice(product.price.amount)}
              </p>
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md"
                >
                  #{tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{product.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Due Date for Pre-orders */}
          {isPreOrder && product.due_date && (
            <div className="mt-3 flex items-center gap-1 text-xs text-purple-600">
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
              <span>Available: {new Date(product.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
