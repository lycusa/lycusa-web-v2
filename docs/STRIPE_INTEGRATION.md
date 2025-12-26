# Stripe Integration Guide

This document provides a comprehensive guide for integrating Stripe with the Lycusa payment system.

## Overview

The current payment system uses a mock payment implementation that follows the **Strategy Pattern**. The architecture is designed to make replacing the mock payment gateway with Stripe seamless.

### Current Architecture

```
CheckoutPage (UI)
    ↓
PaymentModal (Card Input & Validation)
    ↓
createPayment() (Payment Service API)
    ↓
Payment Microservice (Mock Strategy)
    ↓
Database
```

## Step-by-Step Integration

### Step 1: Install Stripe Dependencies

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### Step 2: Set Up Environment Variables

Add these to your `.env.local`:

```env
# Stripe Public Key - Get from https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_51234567890abcdefghijklmnop

# Stripe Secret Key (backend only) - Keep this secure on your backend
STRIPE_SECRET_KEY=sk_test_1234567890abcdefghijklmnop

# Webhook Secret - After setting up webhooks
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnop
```

### Step 3: Create Stripe Payment Intent Endpoint

On your backend (payment microservice), create a new endpoint:

```bash
POST /payment/stripe/create-intent
```

**Request:**
```json
{
  "amount": 9999,          // in cents
  "currency": "usd",
  "orderId": "order_123",
  "sellerId": "seller_456",
  "metadata": {
    "productName": "Vintage Jacket",
    "deliveryMethod": "express"
  }
}
```

**Response:**
```json
{
  "clientSecret": "pi_1234567_secret_abcdef",
  "paymentIntentId": "pi_1234567"
}
```

### Step 4: Update Payment API Client

Update `app/lib/api.ts` to add:

```typescript
// Create Stripe payment intent
export const createStripePaymentIntent = async (data: {
  amount: number;
  currency: string;
  orderId: string;
  sellerId: string;
  metadata?: Record<string, unknown>;
}): Promise<{ clientSecret: string; paymentIntentId: string }> => {
  const response = await api.post("/payment/stripe/create-intent", data);
  return response.data;
};

// Confirm payment intent (call after CardElement tokenization)
export const confirmStripePayment = async (paymentIntentId: string): Promise<PaymentResponse> => {
  const response = await api.post("/payment/stripe/confirm", {
    paymentIntentId,
  });
  return response.data;
};
```

### Step 5: Create Stripe Provider Component

Create `app/components/providers/StripeProvider.tsx`:

```typescript
"use client";

import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ""
);

interface StripeProviderProps {
  children: React.ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
```

Add to your root layout or app provider:

```typescript
import { StripeProvider } from "@/app/components/providers/StripeProvider";

// In your layout:
<StripeProvider>
  {children}
</StripeProvider>
```

### Step 6: Create Stripe Card Component

Create `app/components/payment/StripeCardElement.tsx`:

```typescript
"use client";

import { useState } from "react";
import {
  CardElement,
  useStripe,
  useElements,
  CardElementProps,
} from "@stripe/react-stripe-js";

interface StripeCardElementProps {
  onChange?: (isComplete: boolean) => void;
}

export function StripeCardElement({ onChange }: StripeCardElementProps) {
  const [isComplete, setIsComplete] = useState(false);

  const handleChange = (event: any) => {
    setIsComplete(event.complete);
    onChange?.(event.complete);
  };

  return (
    <CardElement
      onChange={handleChange}
      options={{
        style: {
          base: {
            fontSize: "16px",
            color: "#424770",
            "::placeholder": {
              color: "#aab7c4",
            },
          },
          invalid: {
            color: "#9e2146",
          },
        },
      }}
    />
  );
}
```

### Step 7: Update PaymentModal for Stripe

Modify `app/components/payment/PaymentModal.tsx`:

```typescript
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { createStripePaymentIntent, confirmStripePayment } from "@/app/lib/api";

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  orderData,
  onCreateOrder,
}: PaymentModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardComplete, setCardComplete] = useState(false);

  const processPayment = async () => {
    if (!stripe || !elements) {
      setErrorMessage("Stripe not loaded. Please refresh and try again.");
      return;
    }

    try {
      setStep("validating");
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Create order first
      const orderResult = await onCreateOrder();
      if (!orderResult) {
        throw new Error("Failed to create order. Please try again.");
      }
      setOrderId(orderResult.orderId);

      setStep("processing");

      const totalAmount = Math.round(
        (orderData.amount + orderData.deliveryCost) * 100
      );

      // Create payment intent
      const intentResponse = await createStripePaymentIntent({
        amount: totalAmount,
        currency: orderData.currency.toLowerCase(),
        orderId: orderResult.orderId,
        sellerId: orderData.sellerId,
        metadata: {
          productName: orderData.productName,
          deliveryMethod: orderData.deliveryMethod,
        },
      });

      // Confirm payment with card
      const result = await stripe.confirmCardPayment(
        intentResponse.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              // Add billing details from form if needed
            },
          },
        }
      );

      if (result.error) {
        throw new Error(result.error.message || "Payment failed");
      }

      if (
        result.paymentIntent.status === "succeeded" ||
        result.paymentIntent.status === "processing"
      ) {
        setStep("confirming");
        await new Promise((resolve) => setTimeout(resolve, 500));
        setStep("success");

        setTimeout(() => {
          onSuccess(intentResponse.paymentIntentId, orderResult.orderId);
        }, 2000);
      } else {
        throw new Error("Payment could not be processed");
      }
    } catch (error: any) {
      console.error("Stripe payment error:", error);
      setErrorMessage(error.message || "An unexpected error occurred");
      setStep("error");
    }
  };

  // Rest of the component remains the same, but replace card input with:
  return (
    // ... modal structure
    <form onSubmit={(e) => { e.preventDefault(); processPayment(); }}>
      {/* Replace the manual card input fields with: */}
      <div className="p-4 border border-gray-300 rounded-xl bg-white">
        <CardElement />
      </div>

      {/* Rest of the form */}
    </form>
    // ... modal structure
  );
}
```

### Step 8: Set Up Webhook Handler (Backend)

Create a webhook endpoint to handle Stripe events:

```bash
POST /payment/stripe/webhook
```

**Webhook events to handle:**
- `payment_intent.succeeded` - Payment completed
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Refund processed

Example webhook handler (pseudo-code):

```typescript
export const handleStripeWebhook = async (event: any) => {
  switch (event.type) {
    case "payment_intent.succeeded":
      await updatePaymentStatus(
        event.data.object.id,
        PaymentStatus.COMPLETED
      );
      break;

    case "payment_intent.payment_failed":
      await updatePaymentStatus(
        event.data.object.id,
        PaymentStatus.FAILED,
        event.data.object.last_payment_error?.message
      );
      break;

    case "charge.refunded":
      await processRefund(event.data.object.payment_intent);
      break;
  }
};
```

### Step 9: Update Payment Strategy (Backend)

In the payment microservice, add a new Stripe strategy:

```typescript
// src/payments/strategies/stripe/stripe-payment.strategy.ts

import { PaymentStrategy } from "../interfaces/payment-strategy.interface";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export class StripePaymentStrategy implements PaymentStrategy {
  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      const intent = await stripe.paymentIntents.retrieve(
        paymentData.transactionId
      );

      return {
        success: intent.status === "succeeded",
        transactionId: intent.id,
        gatewayResponse: {
          status: intent.status,
          amount: intent.amount,
          currency: intent.currency,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async validatePayment(paymentData: PaymentData): Promise<ValidationResult> {
    // Basic validation
    if (!paymentData.amount || paymentData.amount <= 0) {
      return { isValid: false, errors: ["Invalid amount"] };
    }
    return { isValid: true, errors: [] };
  }

  async refundPayment(transactionId: string): Promise<RefundResult> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: transactionId,
      });

      return {
        success: refund.status === "succeeded",
        refundId: refund.id,
        amount: refund.amount,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async getPaymentStatus(
    transactionId: string
  ): Promise<PaymentStatus> {
    const intent = await stripe.paymentIntents.retrieve(transactionId);

    switch (intent.status) {
      case "succeeded":
        return PaymentStatus.COMPLETED;
      case "processing":
        return PaymentStatus.PROCESSING;
      case "requires_payment_method":
      case "requires_confirmation":
        return PaymentStatus.PENDING;
      case "canceled":
        return PaymentStatus.CANCELED;
      default:
        return PaymentStatus.FAILED;
    }
  }
}
```

## Testing

### Test Cards

Stripe provides test card numbers:

```
Visa:           4242 4242 4242 4242
Mastercard:     5555 5555 5555 4444
Amex:           3782 822463 10005
```

Use any future expiry date and any 3-4 digit CVC.

### Testing Payment Flows

1. **Successful Payment**
   - Use card: `4242 4242 4242 4242`
   - Expected: Payment succeeds, order created

2. **Declined Card**
   - Use card: `4000 0000 0000 0002`
   - Expected: Payment fails with error message

3. **3D Secure Required**
   - Use card: `4000 0025 0000 3155`
   - Expected: SCA/3D Secure challenge

## Error Handling

Common Stripe errors to handle:

```typescript
const handleStripeError = (error: StripeError) => {
  switch (error.code) {
    case "card_declined":
      return "Your card was declined. Please try another card.";
    case "expired_card":
      return "Your card has expired. Please use another card.";
    case "incorrect_cvc":
      return "The CVC code is incorrect.";
    case "processing_error":
      return "An error occurred processing your card. Try again later.";
    case "rate_limit":
      return "Too many requests. Please wait a moment and try again.";
    default:
      return error.message || "Payment failed. Please try again.";
  }
};
```

## Security Best Practices

1. **Never Log Card Data** - Use PCI DSS compliant Stripe Elements
2. **Use HTTPS** - All Stripe communication must be over HTTPS
3. **Validate on Backend** - Always verify payment status on backend
4. **Webhook Verification** - Verify webhook signatures with `stripe.webhooks.constructEvent()`
5. **Rate Limiting** - Implement rate limiting on payment endpoints
6. **Customer PII** - Store customer data securely, never pass full card details

## Monitoring

Set up monitoring for:

1. **Failed Payments** - Alert when payment success rate drops
2. **Webhook Failures** - Ensure webhooks are being delivered
3. **Refunds** - Track refund requests and status
4. **Disputes** - Monitor chargeback and dispute rates

## References

- [Stripe Documentation](https://stripe.com/docs)
- [React Stripe Documentation](https://stripe.com/docs/stripe-js/react)
- [Payment Intent API](https://stripe.com/docs/api/payment_intents)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
- [PCI Compliance](https://stripe.com/docs/security/pci-compliance)

## Rollback Plan

If Stripe integration has issues:

1. Revert the PaymentModal to use mock card inputs
2. Update `processPayment()` to use mock payment strategy
3. Restart with mock payments until Stripe issues are resolved

## Troubleshooting

### Payment Intent Not Found
- Ensure `clientSecret` is being passed correctly
- Verify payment intent was created on backend
- Check webhook logs for errors

### Card Element Not Rendering
- Ensure StripeProvider wraps the component
- Check that public key is set in environment variables
- Verify Stripe.js is loaded

### Webhook Delivery Failures
- Check endpoint is accessible and returning 200
- Verify webhook secret in environment variables
- Review Stripe Dashboard webhook logs

## Timeline

Estimated implementation time: **2-3 days**

1. **Day 1**: Environment setup, Stripe account configuration, API keys
2. **Day 2**: Backend integration (payment intent, webhook handler)
3. **Day 3**: Frontend integration, testing, go-live
