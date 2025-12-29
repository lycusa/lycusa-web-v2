"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CardDetails,
  CardBrand,
  PaymentStep,
  PaymentMethodType,
  PaymentCurrency,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  validateCardNumber,
  validateExpiry,
  validateCVC,
} from "@/app/lib/types/payment";
import { createPayment, pollPaymentStatus } from "@/app/lib/api";

interface PaymentModalProps {
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
  paymentType?: "mock" | "stripe"; // Default: "mock"
}

// Card brand icons
const CardBrandIcon = ({ brand }: { brand: CardBrand }) => {
  switch (brand) {
    case "visa":
      return (
        <svg className="w-10 h-6" viewBox="0 0 50 16" fill="none">
          <rect width="50" height="16" rx="2" fill="#1A1F71" />
          <path
            d="M19.5 11.5L21 4.5H23L21.5 11.5H19.5ZM28.5 4.7C28 4.5 27.2 4.3 26.2 4.3C24 4.3 22.5 5.4 22.5 7C22.5 8.2 23.6 8.9 24.5 9.3C25.4 9.7 25.7 10 25.7 10.4C25.7 11 25 11.3 24.3 11.3C23.3 11.3 22.8 11.2 22 10.8L21.7 10.7L21.4 12.5C22 12.7 23 12.9 24 12.9C26.3 12.9 27.8 11.8 27.8 10C27.8 9 27.2 8.3 25.9 7.7C25.1 7.3 24.6 7.1 24.6 6.6C24.6 6.2 25.1 5.8 26 5.8C26.8 5.8 27.4 5.9 27.8 6.1L28 6.2L28.5 4.7ZM33 4.5H31.3C30.8 4.5 30.4 4.6 30.2 5.1L27 11.5H29.3L29.7 10.3H32.5L32.7 11.5H34.8L33 4.5ZM30.3 8.7L31.3 6.1L31.9 8.7H30.3ZM17.5 4.5L15.5 9.3L15.3 8.3C14.9 7.1 13.8 5.8 12.5 5.2L14.4 11.5H16.7L19.8 4.5H17.5Z"
            fill="white"
          />
          <path
            d="M14 4.5H10.5L10.5 4.7C13.2 5.4 15 7 15.6 9L15 5.2C14.9 4.7 14.5 4.5 14 4.5Z"
            fill="#FAA61A"
          />
        </svg>
      );
    case "mastercard":
      return (
        <svg className="w-10 h-6" viewBox="0 0 50 16" fill="none">
          <rect width="50" height="16" rx="2" fill="#000" />
          <circle cx="20" cy="8" r="5" fill="#EB001B" />
          <circle cx="30" cy="8" r="5" fill="#F79E1B" />
          <path
            d="M25 4.17C26.27 5.27 27 6.8 27 8.5C27 10.2 26.27 11.73 25 12.83C23.73 11.73 23 10.2 23 8.5C23 6.8 23.73 5.27 25 4.17Z"
            fill="#FF5F00"
          />
        </svg>
      );
    case "amex":
      return (
        <svg className="w-10 h-6" viewBox="0 0 50 16" fill="none">
          <rect width="50" height="16" rx="2" fill="#006FCF" />
          <path
            d="M8 11L10 5H13L15 11H13L12.5 9.5H10.5L10 11H8ZM11 7L10.5 8.5H12L11.5 7H11ZM16 5H18L19 8L20 5H22L19.5 11H17.5L16 5ZM23 5H27V6.5H25V7.5H27V9H25V9.5H27V11H23V5ZM28 5H32L33 7L34 5H36V11H34V7.5L33 9.5H32L31 7.5V11H29L28 5ZM37 5H41V6.5H39V7.5H41V9H39V9.5H41V11H37V5Z"
            fill="white"
          />
        </svg>
      );
    default:
      return (
        <svg
          className="w-10 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      );
  }
};

// Processing animation component
const ProcessingAnimation = ({ step }: { step: PaymentStep }) => {
  const steps = [
    { key: "validating", label: "Validating card" },
    { key: "processing", label: "Processing payment" },
    { key: "confirming", label: "Confirming transaction" },
  ];

  const currentIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="space-y-4">
      {steps.map((s, index) => (
        <div key={s.key} className="flex items-center gap-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
              index < currentIndex
                ? "bg-green-500"
                : index === currentIndex
                ? "bg-tyrian-600 animate-pulse"
                : "bg-gray-200"
            }`}
          >
            {index < currentIndex ? (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : index === currentIndex ? (
              <div className="w-3 h-3 bg-white rounded-full" />
            ) : (
              <div className="w-3 h-3 bg-gray-400 rounded-full" />
            )}
          </div>
          <span
            className={`text-sm font-medium transition-colors duration-300 ${
              index < currentIndex
                ? "text-green-600"
                : index === currentIndex
                ? "text-tyrian-700"
                : "text-gray-400"
            }`}
          >
            {s.label}
          </span>
          {index === currentIndex && (
            <svg
              className="w-4 h-4 text-tyrian-600 animate-spin ml-auto"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
};

// Success animation component
const SuccessAnimation = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-green-500 animate-[scale-in_0.5s_ease-out]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div className="absolute inset-0 animate-ping">
          <div className="w-24 h-24 rounded-full bg-green-400 opacity-20" />
        </div>
      </div>
      <h3 className="mt-6 text-xl font-bold text-gray-900">
        Payment Successful!
      </h3>
      <p className="mt-2 text-gray-600 text-center">
        Your order has been placed and payment confirmed.
      </p>
    </div>
  );
};

// Error animation component
const ErrorAnimation = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => {
  return (
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
        <svg
          className="w-12 h-12 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      <h3 className="mt-6 text-xl font-bold text-gray-900">Payment Failed</h3>
      <p className="mt-2 text-gray-600 text-center max-w-xs">{message}</p>
      <button
        onClick={onRetry}
        className="mt-6 px-6 py-2.5 bg-tyrian-600 text-white rounded-xl hover:bg-tyrian-700 transition-colors font-medium"
      >
        Try Again
      </button>
    </div>
  );
};

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  orderData,
  onCreateOrder,
  paymentType = "mock",
}: PaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>("idle");
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });
  const [cardBrand, setCardBrand] = useState<CardBrand>("unknown");
  const [errors, setErrors] = useState<Partial<Record<keyof CardDetails, string>>>({});
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [isMockMode] = useState(paymentType === "mock");

  // Detect card brand as user types
  useEffect(() => {
    setCardBrand(detectCardBrand(cardDetails.number));
  }, [cardDetails.number]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step === "idle") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, step]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleInputChange = useCallback(
    (field: keyof CardDetails, value: string) => {
      let formattedValue = value;

      if (field === "number") {
        formattedValue = formatCardNumber(value).slice(0, 19);
      } else if (field === "expiry") {
        formattedValue = formatExpiry(value);
      } else if (field === "cvc") {
        formattedValue = value.replace(/\D/g, "").slice(0, 4);
      }

      setCardDetails((prev) => ({ ...prev, [field]: formattedValue }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  // Mock payment test scenarios - aligned with TEST_CARDS.md
  const mockTestScenarios = [
    // Success cards
    {
      category: "Success",
      name: "Always Success",
      card: "4242 4242 4242 4242",
      holder: "Test Success",
      expiry: "12/25",
      cvc: "123",
      description: "Standard test card - always succeeds",
    },
    {
      category: "Success",
      name: "Processing Simulation",
      card: "4000 0000 0000 0122",
      holder: "Test Processing",
      expiry: "12/25",
      cvc: "123",
      description: "Simulates processing - always succeeds",
    },
    // Failure cards - selected scenarios only
    {
      category: "Failure",
      name: "Card Declined",
      card: "4000 0000 0000 0002",
      holder: "Test Decline",
      expiry: "12/25",
      cvc: "123",
      description: "Card declined - generic decline",
    },
    {
      category: "Failure",
      name: "Insufficient Funds",
      card: "4000 0000 0000 9995",
      holder: "Test Insufficient",
      expiry: "12/25",
      cvc: "123",
      description: "Card declined - insufficient funds",
    },
    {
      category: "Failure",
      name: "Incorrect CVC",
      card: "4000 0000 0000 0127",
      holder: "Test CVC",
      expiry: "12/25",
      cvc: "123",
      description: "Incorrect CVC code",
    },
    {
      category: "Failure",
      name: "Expired Card",
      card: "4000 0000 0000 0069",
      holder: "Test Expired",
      expiry: "12/25",
      cvc: "123",
      description: "Card has expired",
    },
  ];

  // Apply mock test scenario
  const applyMockScenario = useCallback(
    (scenario: typeof mockTestScenarios[0]) => {
      setCardDetails({
        number: scenario.card,
        expiry: scenario.expiry,
        cvc: scenario.cvc,
        name: scenario.holder,
      });
      setErrors({});
    },
    []
  );

  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof CardDetails, string>> = {};

    if (!cardDetails.name.trim()) {
      newErrors.name = "Cardholder name is required";
    }

    // For mock mode, allow any card format
    if (isMockMode) {
      if (!cardDetails.number || cardDetails.number.replace(/\s/g, "").length < 10) {
        newErrors.number = "Enter a card number";
      }
    } else {
      if (!validateCardNumber(cardDetails.number)) {
        newErrors.number = "Invalid card number";
      }
    }

    if (!cardDetails.expiry) {
      newErrors.expiry = "Required";
    } else if (!isMockMode && !validateExpiry(cardDetails.expiry)) {
      newErrors.expiry = "Invalid expiry date";
    }

    if (!cardDetails.cvc) {
      newErrors.cvc = "Required";
    } else if (!isMockMode && !validateCVC(cardDetails.cvc, cardBrand)) {
      newErrors.cvc = "Invalid CVC";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [cardDetails, cardBrand, isMockMode]);

  const processPayment = async () => {
    if (!validateForm()) return;

    try {
      // Step 1: Validating
      setStep("validating");
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Step 2: Create order first
      const orderResult = await onCreateOrder();
      if (!orderResult) {
        throw new Error("Failed to create order. Please try again.");
      }
      setOrderId(orderResult.orderId);

      // Step 3: Processing payment
      setStep("processing");

      // Calculate total amount (product + delivery)
      const totalAmount = orderData.amount + orderData.deliveryCost;
      const platformFee = Math.round(totalAmount * 0.05); // 5% platform fee

      const paymentResponse = await createPayment({
        orderId: orderResult.orderId,
        sellerId: orderData.sellerId,
        amount: totalAmount,
        currency: orderData.currency as PaymentCurrency,
        method: PaymentMethodType.MOCK,
        platformFee,
        metadata: {
          cardLast4: cardDetails.number.slice(-4),
          cardBrand,
          productName: orderData.productName,
        },
      });

      setPaymentId(paymentResponse.id);

      // Step 4: Confirming
      setStep("confirming");

      // Poll for payment status
      const finalStatus = await pollPaymentStatus(paymentResponse.id, 15, 500);

      if (finalStatus.status === "completed") {
        setStep("success");
        // Wait a moment to show success animation
        setTimeout(() => {
          onSuccess(paymentResponse.id, orderResult.orderId);
        }, 2000);
      } else if (finalStatus.status === "failed") {
        // Extract detailed error information from the response
        const failureReason = (finalStatus as any).failureReason || "Payment was declined";
        const testCardInfo = (finalStatus as any).gatewayResponse?.testCard;

        let errorMsg = failureReason;

        // Add test card information if available (for debugging)
        if (testCardInfo) {
          errorMsg += ` (Test card: ${testCardInfo.last4} - ${testCardInfo.scenario})`;
        }

        throw new Error(errorMsg);
      } else {
        // Payment is still processing after timeout
        setStep("success");
        setTimeout(() => {
          onSuccess(paymentResponse.id, orderResult.orderId);
        }, 2000);
      }
    } catch (error: any) {
      console.error("Payment error:", error);

      // Extract error message with priority:
      // 1. Backend API error message
      // 2. Error message from thrown error
      // 3. Generic fallback
      const backendError = error.response?.data?.message;
      const errorMsg = backendError || error.message || "An unexpected error occurred. Please try again.";

      setErrorMessage(errorMsg);
      setStep("error");
    }
  };

  const handleRetry = () => {
    setStep("idle");
    setErrorMessage("");
    setPaymentId("");
    setOrderId("");
  };

  const handleClose = () => {
    if (step === "idle" || step === "error") {
      setCardDetails({ number: "", expiry: "", cvc: "", name: "" });
      setErrors({});
      setErrorMessage("");
      setStep("idle");
      onClose();
    }
  };

  const totalAmount = orderData.amount + orderData.deliveryCost;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-[slide-up_0.3s_ease-out] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-tyrian-800 to-tyrian-900 p-6 text-white flex-shrink-0">
          <button
            onClick={handleClose}
            disabled={step !== "idle" && step !== "error"}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
              {orderData.productImage ? (
                <img
                  src={orderData.productImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-7 h-7 text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              )}
            </div>
            <div>
              <p className="text-white/70 text-sm">Total Amount</p>
              <p className="text-2xl font-bold">
                {orderData.currency} {totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-white/80 text-sm truncate">
              {orderData.productName}
            </p>
            <p className="text-white/60 text-xs mt-1">
              {orderData.deliveryMethod === "express"
                ? "Express Delivery"
                : "Standard Delivery"}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === "idle" && (
            <>
              {/* Mock Mode Quick Test Buttons */}
              {isMockMode && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm font-semibold text-blue-900 mb-3">
                    Test Card Scenarios:
                  </p>

                  {/* Success scenarios */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-green-700 mb-2 uppercase tracking-wide">
                      Success Scenarios
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {mockTestScenarios
                        .filter((s) => s.category === "Success")
                        .map((scenario) => (
                          <button
                            key={scenario.name}
                            type="button"
                            onClick={() => applyMockScenario(scenario)}
                            className="px-3 py-2 text-xs font-medium bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-green-700 text-left"
                            title={scenario.description}
                          >
                            {scenario.name}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Failure scenarios */}
                  <div>
                    <p className="text-xs font-medium text-red-700 mb-2 uppercase tracking-wide">
                      Failure Scenarios
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {mockTestScenarios
                        .filter((s) => s.category === "Failure")
                        .map((scenario) => (
                          <button
                            key={scenario.name}
                            type="button"
                            onClick={() => applyMockScenario(scenario)}
                            className="px-3 py-2 text-xs font-medium bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-red-700 text-left"
                            title={scenario.description}
                          >
                            {scenario.name}
                          </button>
                        ))}
                    </div>
                  </div>

                  <p className="text-xs text-blue-700 mt-3">
                    Click any scenario to auto-fill test card data
                  </p>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  processPayment();
                }}
                className="space-y-4"
              >
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder={isMockMode ? "4242 4242 4242 4242" : "1234 5678 9012 3456"}
                    value={cardDetails.number}
                    onChange={(e) => handleInputChange("number", e.target.value)}
                    className={`w-full pl-4 pr-14 py-3.5 border rounded-xl focus:ring-2 focus:ring-tyrian-500 focus:border-transparent transition-all ${
                      errors.number
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CardBrandIcon brand={cardBrand} />
                  </div>
                </div>
                {errors.number && (
                  <p className="mt-1 text-sm text-red-600">{errors.number}</p>
                )}
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  autoComplete="cc-name"
                  placeholder={isMockMode ? "Test Success" : "John Doe"}
                  value={cardDetails.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-tyrian-500 focus:border-transparent transition-all ${
                    errors.name
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Expiry and CVC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder={isMockMode ? "12/25" : "MM/YY"}
                    value={cardDetails.expiry}
                    onChange={(e) => handleInputChange("expiry", e.target.value)}
                    className={`w-full px-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-tyrian-500 focus:border-transparent transition-all ${
                      errors.expiry
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.expiry && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiry}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    CVC
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder={isMockMode ? "123" : cardBrand === "amex" ? "1234" : "123"}
                    value={cardDetails.cvc}
                    onChange={(e) => handleInputChange("cvc", e.target.value)}
                    className={`w-full px-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-tyrian-500 focus:border-transparent transition-all ${
                      errors.cvc
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.cvc && (
                    <p className="mt-1 text-sm text-red-600">{errors.cvc}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-4 py-4 bg-gradient-to-r from-tyrian-700 to-tyrian-800 text-white font-semibold rounded-xl hover:from-tyrian-800 hover:to-tyrian-900 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                {isMockMode ? "Test Payment" : "Pay"} {orderData.currency}{" "}
                {totalAmount.toFixed(2)}
              </button>

              {/* Security Badge */}
              <div
                className={`flex items-center justify-center gap-2 text-xs mt-4 ${
                  isMockMode
                    ? "text-blue-600"
                    : "text-gray-500"
                }`}
              >
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                {isMockMode
                  ? "Mock payment for testing"
                  : "Secured by 256-bit SSL encryption"}
              </div>
            </form>
            </>
          )}

          {(step === "validating" ||
            step === "processing" ||
            step === "confirming") && (
            <div className="py-8">
              <ProcessingAnimation step={step} />
              <p className="text-center text-gray-500 text-sm mt-8">
                Please do not close this window
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="py-8">
              <SuccessAnimation />
            </div>
          )}

          {step === "error" && (
            <div className="py-8">
              <ErrorAnimation message={errorMessage} onRetry={handleRetry} />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
