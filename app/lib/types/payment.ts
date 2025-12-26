// Payment Service Types - Aligned with backend payment microservice
// Designed to be easily replaced with Stripe or other payment providers

// Payment Status Enum
export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
  CANCELED = "canceled",
}

// Payment Method Enum (aligned with backend)
export enum PaymentMethodType {
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  CRYPTO = "crypto",
  MOCK = "mock",
}

// Currency Enum
export enum PaymentCurrency {
  USD = "USD",
  EUR = "EUR",
  TRY = "TRY",
  ETH = "ETH",
}

// Card type for UI display
export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "unknown";

// Card details for UI (mock - will be replaced by Stripe Elements)
export interface CardDetails {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

// Create Payment Request
export interface CreatePaymentRequest {
  orderId: string;
  sellerId: string;
  amount: number; // In smallest currency unit (cents)
  currency: PaymentCurrency;
  method: PaymentMethodType;
  platformFee: number;
  metadata?: Record<string, unknown>;
}

// Payment Response from API
export interface PaymentResponse {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: PaymentCurrency;
  method: PaymentMethodType;
  platformFee: number;
  totalAmount: number;
  status: PaymentStatus;
  processedAt?: string;
  completedAt?: string;
  failureReason?: string;
  isHeld: boolean;
  heldAt?: string;
  releaseAt?: string;
  holdReason?: string;
  transactions?: TransactionDto[];
  refunds?: RefundDto[];
  createdAt: string;
  updatedAt: string;
}

// Transaction record
export interface TransactionDto {
  id: string;
  gateway: string;
  transactionId: string;
  status: "succeeded" | "failed";
  attemptedAt: string;
  metadata?: Record<string, unknown>;
}

// Refund record
export interface RefundDto {
  id: string;
  amount: number;
  reason: string;
  processedAt: string;
  processedBy: string;
  status: "completed" | "failed";
}

// Payment Status Response (lightweight)
export interface PaymentStatusResponse {
  id: string;
  status: PaymentStatus;
}

// Payment processing states for UI
export type PaymentStep =
  | "idle"
  | "validating"
  | "processing"
  | "confirming"
  | "success"
  | "error";

// Payment modal props
export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentId: string, orderId: string) => void;
  orderData: {
    productName: string;
    productImage?: string;
    amount: number;
    currency: string;
    sellerId: string;
    deliveryMethod: string;
    deliveryAddress: string;
    deliveryCost: number;
  };
  onCreateOrder: () => Promise<{ orderId: string } | null>;
}

// Helper to detect card brand from number
export function detectCardBrand(cardNumber: string): CardBrand {
  const cleanNumber = cardNumber.replace(/\s/g, "");

  if (/^4/.test(cleanNumber)) return "visa";
  if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber))
    return "mastercard";
  if (/^3[47]/.test(cleanNumber)) return "amex";
  if (/^6(?:011|5)/.test(cleanNumber)) return "discover";

  return "unknown";
}

// Helper to format card number with spaces
export function formatCardNumber(value: string): string {
  const cleanValue = value.replace(/\D/g, "");
  const groups = cleanValue.match(/.{1,4}/g);
  return groups ? groups.join(" ") : cleanValue;
}

// Helper to format expiry date
export function formatExpiry(value: string): string {
  const cleanValue = value.replace(/\D/g, "");
  if (cleanValue.length >= 2) {
    return cleanValue.slice(0, 2) + "/" + cleanValue.slice(2, 4);
  }
  return cleanValue;
}

// Validate card number (Luhn algorithm)
export function validateCardNumber(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(cleanNumber)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// Validate expiry date
export function validateExpiry(expiry: string): boolean {
  const [month, year] = expiry.split("/").map((s) => parseInt(s, 10));
  if (!month || !year) return false;
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
}

// Validate CVC
export function validateCVC(cvc: string, cardBrand: CardBrand): boolean {
  const length = cardBrand === "amex" ? 4 : 3;
  return new RegExp(`^\\d{${length}}$`).test(cvc);
}

// Payment status display configuration
export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  {
    label: string;
    description: string;
    color: string;
    bgColor: string;
  }
> = {
  [PaymentStatus.PENDING]: {
    label: "Pending",
    description: "Payment is awaiting processing",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
  },
  [PaymentStatus.PROCESSING]: {
    label: "Processing",
    description: "Payment is being processed",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
  },
  [PaymentStatus.COMPLETED]: {
    label: "Completed",
    description: "Payment was successful",
    color: "text-green-700",
    bgColor: "bg-green-50",
  },
  [PaymentStatus.FAILED]: {
    label: "Failed",
    description: "Payment failed",
    color: "text-red-700",
    bgColor: "bg-red-50",
  },
  [PaymentStatus.REFUNDED]: {
    label: "Refunded",
    description: "Payment has been refunded",
    color: "text-slate-700",
    bgColor: "bg-slate-50",
  },
  [PaymentStatus.CANCELED]: {
    label: "Canceled",
    description: "Payment was canceled",
    color: "text-gray-700",
    bgColor: "bg-gray-50",
  },
};
