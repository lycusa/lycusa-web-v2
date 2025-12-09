"use client";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export default function StarRating({
  rating,
  size = "md",
  showValue = false,
  className = "",
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const starSize = sizeClasses[size];
  const textSize = textSizes[size];

  // Clamp rating between 0 and 5
  const clampedRating = Math.max(0, Math.min(5, rating));

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= clampedRating;
          const partialFill =
            star > clampedRating && star - 1 < clampedRating
              ? clampedRating - (star - 1)
              : 0;

          return (
            <div key={star} className="relative">
              {partialFill > 0 ? (
                <>
                  {/* Background star (empty) */}
                  <svg
                    className={`${starSize} text-gray-300`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  {/* Partial fill */}
                  <svg
                    className={`${starSize} text-amber-400 absolute top-0 left-0`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      clipPath: `inset(0 ${(1 - partialFill) * 100}% 0 0)`,
                    }}
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </>
              ) : (
                <svg
                  className={`${starSize} ${
                    filled ? "text-amber-400" : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className={`${textSize} font-medium text-gray-700`}>
          {clampedRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
