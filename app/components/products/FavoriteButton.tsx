"use client";

import { useFavoriteProduct } from "@/app/hooks/useFavorites";

interface FavoriteButtonProps {
    productId: string;
    size?: "sm" | "md" | "lg";
    className?: string;
    showLabel?: boolean;
}

/**
 * Animated favorite button with 2025 UI/UX micro-interactions
 * Features: heart icon, pop animation, pulse glow, glass morphism
 */
export default function FavoriteButton({
    productId,
    size = "md",
    className = "",
    showLabel = false,
}: FavoriteButtonProps) {
    const { isFavorited, toggle, isAnimating } = useFavoriteProduct(productId);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
    };

    // Size variants
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-full py-4 px-8",
    };

    const iconSizes = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-5 h-5",
    };

    // Full-width variant for product detail page
    if (size === "lg") {
        return (
            <button
                onClick={handleClick}
                className={`
                    ${sizeClasses[size]}
                    flex items-center justify-center gap-2
                    rounded-xl font-semibold text-lg
                    transition-all duration-300
                    ${isFavorited
                        ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        : "bg-white text-gray-900 border-2 border-gray-300 hover:border-rose-300 hover:bg-rose-50"
                    }
                    ${isAnimating ? "animate-favorite-pop" : ""}
                    ${className}
                `}
                aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
                <svg
                    className={`${iconSizes[size]} ${isAnimating ? "animate-favorite-heart" : ""}`}
                    fill={isFavorited ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={isFavorited ? 0 : 2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
                {showLabel && (
                    <span>{isFavorited ? "Saved to Favorites" : "Save to Favorites"}</span>
                )}
            </button>
        );
    }

    // Compact button for cards
    return (
        <button
            onClick={handleClick}
            className={`
                ${sizeClasses[size]}
                flex items-center justify-center
                rounded-full
                backdrop-blur-md
                transition-all duration-300
                ${isFavorited
                    ? "bg-rose-500/90 text-white shadow-lg shadow-rose-500/30"
                    : "bg-white/80 text-gray-600 hover:bg-white hover:text-rose-500 shadow-md"
                }
                ${isAnimating ? "animate-favorite-pop" : ""}
                hover:scale-110 active:scale-95
                ${className}
            `}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
            <svg
                className={`${iconSizes[size]} ${isAnimating ? "animate-favorite-heart" : ""}`}
                fill={isFavorited ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={isFavorited ? 0 : 2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
        </button>
    );
}
