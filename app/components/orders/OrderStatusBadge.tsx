"use client";

import { OrderStatus, ORDER_STATUS_CONFIG } from "@/app/lib/types/order";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
  className?: string;
}

export default function OrderStatusBadge({
  status,
  size = "md",
  showDot = true,
  className = "",
}: OrderStatusBadgeProps) {
  const config = ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG[OrderStatus.PENDING];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2 h-2",
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${config.bgColor} ${config.color}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {showDot && (
        <span className={`${dotSizes[size]} rounded-full ${config.dotColor}`} />
      )}
      {config.label}
    </span>
  );
}
