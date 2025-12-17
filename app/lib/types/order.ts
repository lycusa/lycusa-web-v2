// Order Service Types

// Order Status Enum
export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  FAILED = "failed",
  REFUNDED = "refunded",
}

// Payment Methods
export enum PaymentMethod {
  STRIPE = "stripe",
  CRYPTO = "crypto",
}

// Delivery Methods
export enum DeliveryMethod {
  STANDARD = "standard",
  EXPRESS = "express",
}

// Supported Currencies
export enum Currency {
  USD = "USD",
  TRY = "TRY",
  ETH = "ETH",
  SOL = "SOL",
}

// Order Item
export interface OrderItem {
  id: string;
  product_id: string;
  unit_price: number;
  total_price: number;
  quantity: number;
  currency: string;
}

// Create Order Item Request
export interface CreateOrderItemRequest {
  product_id: string;
  unit_price: number;
  total_price: number;
  currency: string;
}

// Delivery Info
export interface DeliveryInfo {
  method: DeliveryMethod;
  address: string;
  tracking_number?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
}

// Payment Info
export interface PaymentInfo {
  payment_id: string;
  method: PaymentMethod;
  timestamp?: string;
}

// Order Status History Entry
export interface OrderStatusHistoryEntry {
  id: string;
  status: OrderStatus;
  updated_at: string;
  updated_by: string;
  notes?: string;
}

// Order (Full)
export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  items: OrderItem[];
  total_amount: number;
  currency: string;
  status: OrderStatus;
  placed_at: string;
  completed_at?: string;
  payment_id: string;
  payment_method: PaymentMethod;
  payment_timestamp?: string;
  delivery_method: DeliveryMethod;
  delivery_address: string;
  tracking_number?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  cancelled_at?: string;
  status_history: OrderStatusHistoryEntry[];
}

// Order List Item (Summary)
export interface OrderListItem {
  id: string;
  buyer_id: string;
  seller_id: string;
  total_amount: number;
  currency: string;
  status: OrderStatus;
  placed_at: string;
  completed_at?: string;
  items_count: number;
  tracking_number?: string;
}

// Place Order Request
export interface PlaceOrderRequest {
  buyer_id: string;
  seller_id: string;
  items: CreateOrderItemRequest[];
  delivery_info: {
    method: DeliveryMethod;
    address: string;
  };
  payment_info: {
    payment_id: string;
    method: PaymentMethod;
  };
  currency: string;
}

// Place Order Response
export interface PlaceOrderResponse {
  order_id: string;
  status: OrderStatus;
  total_amount: number;
  currency: string;
  items: OrderItem[];
  placed_at: string;
  buyer_id: string;
  seller_id: string;
}

// Cancel Order Request
export interface CancelOrderRequest {
  order_id: string;
  cancelled_by: string;
  reason: string;
}

// Cancel Order Response
export interface CancelOrderResponse {
  order_id: string;
  status: OrderStatus;
  cancelled_at: string;
  cancellation_reason: string;
  refund_amount: number;
}

// Update Status Request
export interface UpdateStatusRequest {
  new_status: OrderStatus;
  updated_by: string;
  notes?: string;
}

// Update Status Response
export interface UpdateStatusResponse {
  order_id: string;
  old_status: OrderStatus;
  new_status: OrderStatus;
  updated_at: string;
  success: boolean;
}

// Complete Order Request
export interface CompleteOrderRequest {
  order_id: string;
  completed_by: string;
  completion_notes?: string;
}

// Complete Order Response
export interface CompleteOrderResponse {
  order_id: string;
  status: OrderStatus;
  completed_at: string;
  completion_notes?: string;
}

// List Orders Response
export interface ListOrdersResponse {
  orders: OrderListItem[];
  total_count: number;
  has_more: boolean;
  limit: number;
  offset: number;
}

// List Orders Query Parameters
export interface ListOrdersQuery {
  status?: OrderStatus;
  limit?: number;
  offset?: number;
}

// Professional status display configuration with semantic colors
export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
    iconColor: string;
    dotColor: string;
  }
> = {
  [OrderStatus.PENDING]: {
    label: "Pending",
    description: "Awaiting confirmation",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    iconColor: "text-amber-500",
    dotColor: "bg-amber-500",
  },
  [OrderStatus.CONFIRMED]: {
    label: "Confirmed",
    description: "Order confirmed by seller",
    color: "text-zinc-700",
    bgColor: "bg-zinc-50",
    borderColor: "border-zinc-200",
    iconColor: "text-zinc-500",
    dotColor: "bg-zinc-500",
  },
  [OrderStatus.PROCESSING]: {
    label: "Processing",
    description: "Being prepared for shipment",
    color: "text-tyrian-700",
    bgColor: "bg-tyrian-50",
    borderColor: "border-tyrian-200",
    iconColor: "text-tyrian-500",
    dotColor: "bg-tyrian-500",
  },
  [OrderStatus.SHIPPED]: {
    label: "Shipped",
    description: "On the way to you",
    color: "text-violet-700",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    iconColor: "text-violet-500",
    dotColor: "bg-violet-500",
  },
  [OrderStatus.DELIVERED]: {
    label: "Delivered",
    description: "Successfully delivered",
    color: "text-teal-700",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    iconColor: "text-teal-500",
    dotColor: "bg-teal-500",
  },
  [OrderStatus.COMPLETED]: {
    label: "Completed",
    description: "Order completed successfully",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    iconColor: "text-emerald-500",
    dotColor: "bg-emerald-500",
  },
  [OrderStatus.CANCELLED]: {
    label: "Cancelled",
    description: "Order was cancelled",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-500",
    dotColor: "bg-red-500",
  },
  [OrderStatus.FAILED]: {
    label: "Failed",
    description: "Order processing failed",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-500",
    dotColor: "bg-red-500",
  },
  [OrderStatus.REFUNDED]: {
    label: "Refunded",
    description: "Payment has been refunded",
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    iconColor: "text-slate-500",
    dotColor: "bg-slate-500",
  },
};

// Cancellable states
export const CANCELLABLE_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.FAILED,
];

// Valid status transitions
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.FAILED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.FAILED]: [OrderStatus.CANCELLED],
  [OrderStatus.CANCELLED]: [OrderStatus.REFUNDED],
  [OrderStatus.REFUNDED]: [],
};

// Seller allowed statuses
export const SELLER_ALLOWED_STATUSES: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
];

// Buyer allowed statuses
export const BUYER_ALLOWED_STATUSES: OrderStatus[] = [
  OrderStatus.DELIVERED,
  OrderStatus.COMPLETED,
];

// Order status step order for progress visualization
export const ORDER_STATUS_STEPS: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.COMPLETED,
];

// Get step index for progress bar
export const getStatusStepIndex = (status: OrderStatus): number => {
  const index = ORDER_STATUS_STEPS.indexOf(status);
  return index >= 0 ? index : -1;
};

// Check if status is terminal
export const isTerminalStatus = (status: OrderStatus): boolean => {
  return [OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.REFUNDED, OrderStatus.FAILED].includes(status);
};
