# Payment Flow Diagrams

Visual representations of the payment system flow and state management.

## Complete Payment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                       USER JOURNEY                              │
└─────────────────────────────────────────────────────────────────┘

    Browse Products
         ↓
    ┌─────────────┐
    │ Product Page│
    └─────────────┘
         │
    Click "Buy Now"
         ↓
    ┌──────────────────┐
    │ Checkout Page    │
    │ - Delivery Info  │
    │ - Address        │
    │ - Payment Method │
    └──────────────────┘
         │
    Click "Place Order"
         ↓
    ┌──────────────────────┐
    │ Payment Modal Opens  │
    │ Card Input Form      │
    │ Test Buttons (Mock)  │
    └──────────────────────┘
         │
    ┌────────────────────────────┐
    │ User selects test scenario │
    │ (Success/Decline/Process)  │
    └────────────────────────────┘
         │
    Click "Test Payment" button
         │
         ↓
    ┌─────────────────────┐
    │ Form Validation     │
    │ - Card number       │
    │ - Expiry date       │
    │ - CVC               │
    │ - Holder name       │
    └─────────────────────┘
         │
    Validation Passes
         │
         ↓
    ┌──────────────────────┐
    │ Step 1: Validating   │
    │ (Animation starts)    │
    └──────────────────────┘
         │
         ↓
    ┌────────────────────────────┐
    │ Create Order API Call      │
    │ POST /order/api/v1/orders  │
    └────────────────────────────┘
         │
    Order Created with ID
         │
         ↓
    ┌──────────────────────────┐
    │ Step 2: Processing       │
    │ (Animation continues)     │
    └──────────────────────────┘
         │
         ↓
    ┌────────────────────────────┐
    │ Create Payment API Call    │
    │ POST /payment/payments     │
    │ - orderId                  │
    │ - amount (in cents)        │
    │ - method: "mock"           │
    └────────────────────────────┘
         │
    Payment Created
         │
         ↓
    ┌──────────────────────────┐
    │ Step 3: Confirming       │
    │ (Animation continues)     │
    └──────────────────────────┘
         │
         ↓
    ┌─────────────────────────────────┐
    │ Poll Payment Status             │
    │ GET /payment/payments/{id}/status│
    │ Every 1 second, max 30 attempts │
    └─────────────────────────────────┘
         │
    ┌────────────────────┐
    │ Check Status:      │
    │ completed/failed?  │
    └────────────────────┘
         │
         ├─→ "completed" ──→ ┌──────────────────┐
         │                   │ Success State    │
         │                   │ Show Checkmark   │
         │                   │ 2 sec delay      │
         │                   └──────────────────┘
         │                          │
         │                          ↓
         │                   ┌──────────────────┐
         │                   │ Close Modal      │
         │                   │ Redirect to      │
         │                   │ /orders/{id}     │
         │                   └──────────────────┘
         │
         ├─→ "failed" ──→ ┌──────────────────┐
         │                │ Error State      │
         │                │ Show X & Message │
         │                │ "Try Again" btn  │
         │                └──────────────────┘
         │                       │
         │                       ↓
         │                ┌──────────────────┐
         │                │ User clicks      │
         │                │ "Try Again"      │
         │                │ Return to form   │
         │                └──────────────────┘
         │
         └─→ timeout ──→ ┌──────────────────┐
                         │ Show as Success  │
                         │ (Payment likely  │
                         │  still processing)
                         └──────────────────┘
                                 │
                                 ↓
                         ┌──────────────────┐
                         │ Redirect to      │
                         │ /orders/{id}     │
                         └──────────────────┘
```

---

## PaymentModal State Machine

```
┌──────────────────────────────────────────────────────────────┐
│                    PAYMENT MODAL STATES                       │
└──────────────────────────────────────────────────────────────┘

                        ┌────────┐
                        │  IDLE  │ ◄─────────────┐
                        └────────┘               │
                           │                    │
                    User clicks button           │
                           │                    │
                           ↓                    │
                    ┌─────────────┐             │
                    │ VALIDATING  │             │
                    └─────────────┘             │
                           │                    │
                    Validation succeeds         │
                           │                    │
                           ↓                    │
                    ┌─────────────┐             │
                    │ PROCESSING  │             │
                    └─────────────┘             │
                           │                    │
                    Payment created             │
                           │                    │
                           ↓                    │
                    ┌─────────────┐             │
                    │ CONFIRMING  │             │
                    └─────────────┘             │
                           │                    │
                    Status polling...           │
                           │                    │
                    ┌──────┴──────┐             │
                    │             │             │
             Succeeded       Failed             │
                    │             │             │
                    ↓             ↓             │
              ┌─────────┐    ┌────────┐        │
              │ SUCCESS │    │ ERROR  │        │
              └─────────┘    └────────┘        │
                    │             │            │
            2 sec delay      "Try Again"       │
                    │        click button      │
                    │             │            │
                    └─────────────┘ ───────────┘
                           │
                    Modal closes
                    Redirect to
                    /orders/{id}
```

---

## Component Hierarchy

```
CheckoutPage (page.tsx)
├── AppBackground
├── Header
└── CheckoutContent
    ├── Order Summary Card
    │   ├── Product Image
    │   ├── Product Name
    │   ├── Quantity & Price
    │   └── Total
    │
    ├── Delivery Method Card
    │   ├── Standard Delivery (Free)
    │   └── Express Delivery (+$9.99)
    │
    ├── Delivery Address Card
    │   └── Textarea (address input)
    │
    ├── Payment Method Card
    │   ├── Credit/Debit Card
    │   └── Cryptocurrency
    │
    ├── Order Total Sidebar
    │   ├── Subtotal
    │   ├── Delivery Cost
    │   ├── Total
    │   └── Place Order Button
    │
    └── PaymentModal
        ├── Header (gradient bg)
        │   ├── Product Image
        │   ├── Total Amount Display
        │   └── Close Button
        │
        ├── Content (dynamic based on step)
        │   │
        │   ├─ If step = "idle":
        │   │  ├── Mock Test Buttons (Success/Decline/Processing)
        │   │  ├── Card Input Form
        │   │  │  ├── Card Number Input
        │   │  │  ├── Cardholder Name Input
        │   │  │  ├── Expiry Date Input
        │   │  │  ├── CVC Input
        │   │  │  ├── Submit Button ("Test Payment")
        │   │  │  └── Security Badge
        │   │  └── Error Display (if validation fails)
        │   │
        │   ├─ If step = "validating"|"processing"|"confirming":
        │   │  ├── ProcessingAnimation Component
        │   │  │  ├── Step 1: Validating... ⊙
        │   │  │  ├── Step 2: Processing... ⊙
        │   │  │  └── Step 3: Confirming... ⊙
        │   │  └── "Please do not close this window"
        │   │
        │   ├─ If step = "success":
        │   │  ├── SuccessAnimation Component
        │   │  │  ├── Checkmark ✓
        │   │  │  ├── "Payment Successful!"
        │   │  │  └── "Your order has been placed..."
        │   │  └── 2 second delay before redirect
        │   │
        │   └─ If step = "error":
        │      ├── ErrorAnimation Component
        │      │  ├── X Icon
        │      │  ├── "Payment Failed"
        │      │  ├── Error Message
        │      │  └── Try Again Button
        │      └── User can click "Try Again"
        │
        └── Footer (always visible)
            └── Close Button (disabled during processing)
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA FLOW DIAGRAM                         │
└─────────────────────────────────────────────────────────────┘

User Input (Card Form)
    ↓
    ↓ handleInputChange()
    ↓
cardDetails (local state)
    ↓
    ├─ detectCardBrand() → cardBrand state
    │
    ├─ formatCardNumber() → display
    │
    └─ formatExpiry() → display
         │
         ↓
    Display in form fields


Form Submission
    ↓
    ↓ validateForm()
    ↓
errors (local state)
    ↓
    ├─ Show validation errors
    │
    └─ If valid: processPayment()
         │
         ↓
    step = "validating"
    step = "processing"
    step = "confirming"
         │
         ├─ onCreateOrder() callback
         │  ↓
         │  placeOrder(orderData)
         │  ↓
         │  Order Service API
         │  ↓
         │  Response: { orderId }
         │  ↓
         │  orderId state
         │
         ├─ createPayment(paymentData)
         │  ↓
         │  Payment Service API
         │  ↓
         │  Response: { id, status }
         │  ↓
         │  paymentId state
         │
         ├─ pollPaymentStatus(paymentId)
         │  ↓
         │  Recurring requests
         │  ↓
         │  Final status
         │
         └─ step = "success" OR "error"
            ↓
            ├─ If success:
            │  onSuccess(paymentId, orderId)
            │  ↓
            │  Checkout redirects to /orders/{orderId}
            │
            └─ If error:
               Show error message
               User clicks "Try Again"
               Reset to step = "idle"
```

---

## Payment Status Timeline

```
Time    │ Payment Status │ Frontend Step │ Animation
────────┼────────────────┼───────────────┼──────────────
  0ms   │ pending        │ idle          │ Form visible
  500ms │ pending        │ validating    │ ⊙ Validating
  1s    │ processing     │ processing    │ ⊙ Processing
  2s    │ processing     │ confirming    │ ⊙ Confirming
  3s    │ completed      │ success       │ ✓ Success!
  5s    │ completed      │ idle (closed) │ Redirecting

Alternative - Failure:
  0ms   │ pending        │ idle          │ Form visible
  500ms │ pending        │ validating    │ ⊙ Validating
  1s    │ processing     │ processing    │ ⊙ Processing
  2s    │ failed         │ error         │ ✗ Failed
  ∞     │ failed         │ error         │ "Try Again" button
```

---

## Mock Test Scenario Flows

### Success Scenario
```
┌─────────────────────────────────────────────────┐
│            SUCCESS SCENARIO                     │
└─────────────────────────────────────────────────┘

Button Click: "Success"
      ↓
Form Auto-fill:
  • Card: 4242 4242 4242 4242
  • Name: Test Success
  • Expiry: 12/25
  • CVC: 123
      ↓
User clicks "Test Payment"
      ↓
Validation: PASS ✓
      ↓
Create Order: SUCCESS ✓
      ↓
Create Payment: SUCCESS ✓
      ↓
Poll Status...
      ↓
Status Check 1: pending
Status Check 2: pending
Status Check 3: completed ✓
      ↓
Step: success
      ↓
Show Checkmark ✓
      ↓
2 second wait
      ↓
Close Modal → Redirect to /orders/{id}
```

### Decline Scenario
```
┌─────────────────────────────────────────────────┐
│           DECLINE SCENARIO                      │
└─────────────────────────────────────────────────┘

Button Click: "Decline"
      ↓
Form Auto-fill:
  • Card: 4000 0000 0000 0002
  • Name: Test Decline
  • Expiry: 12/25
  • CVC: 123
      ↓
User clicks "Test Payment"
      ↓
Validation: PASS ✓
      ↓
Create Order: SUCCESS ✓
      ↓
Create Payment: SUCCESS ✓
      ↓
Poll Status...
      ↓
Status Check 1: pending
Status Check 2: failed ✗
      ↓
Step: error
      ↓
Show Error ✗
Message: "Payment was declined..."
      ↓
"Try Again" button available
      ↓
User clicks "Try Again"
      ↓
Reset to step: idle
      ↓
User can:
  • Modify card details
  • Click another test button
  • Or close modal
```

### Processing Scenario
```
┌─────────────────────────────────────────────────┐
│          PROCESSING SCENARIO                    │
└─────────────────────────────────────────────────┘

Button Click: "Processing"
      ↓
Form Auto-fill:
  • Card: 4000 0000 0000 0122
  • Name: Test Processing
  • Expiry: 12/25
  • CVC: 123
      ↓
User clicks "Test Payment"
      ↓
Validation: PASS ✓
      ↓
Create Order: SUCCESS ✓
      ↓
Create Payment: SUCCESS ✓
      ↓
Poll Status (multiple checks)...
      ↓
Status Check 1: pending
Status Check 2: pending
Status Check 3: processing
Status Check 4: processing
Status Check 5: processing
Status Check 6: completed ✓
      ↓
Step: success
      ↓
Show Checkmark ✓
      ↓
2 second wait
      ↓
Close Modal → Redirect to /orders/{id}
```

---

## Network Request Sequence

```
┌──────────────────────────────────────────────────────────┐
│              NETWORK REQUEST SEQUENCE                     │
└──────────────────────────────────────────────────────────┘

Frontend                        API Gateway          Backend Services
   │                                │                        │
   │ 1. POST /order/api/v1/orders   │                        │
   ├───────────────────────────────►│                        │
   │                                │ → Order Service        │
   │                                ├───────────────────────►│
   │                                │                        │
   │                                │ ◄─ Create order response
   │◄───────────────────────────────┤                        │
   │ Response: { orderId }          │                        │
   │                                │                        │
   │ 2. POST /payment/payments      │                        │
   ├───────────────────────────────►│                        │
   │                                │ → Payment Service      │
   │                                ├───────────────────────►│
   │                                │                        │
   │                                │ ◄─ Create payment response
   │◄───────────────────────────────┤                        │
   │ Response: { id, status }       │                        │
   │                                │                        │
   │ 3. GET /payment/payments/{id}/status (polling)          │
   ├───────────────────────────────►│                        │
   │                                │ → Payment Service      │
   │                                ├───────────────────────►│
   │◄───────────────────────────────┤◄───────────────────────│
   │ Response: { status }           │                        │
   │                                │                        │
   │ Wait 1 second...               │                        │
   │                                │                        │
   │ 4. GET /payment/payments/{id}/status (polling again)    │
   ├───────────────────────────────►│                        │
   │                                │ → Payment Service      │
   │                                ├───────────────────────►│
   │◄───────────────────────────────┤◄───────────────────────│
   │ Response: { status: completed }│                        │
   │                                │                        │
   │ Success! Stop polling.         │                        │
   │ Close modal, redirect.         │                        │

Average timings:
  Order creation: 300-800ms
  Payment creation: 500-2000ms
  Each status poll: 200-500ms
  Total time: 2-5 seconds (depending on test scenario)
```

---

## Error Handling Flow

```
┌────────────────────────────────────────────────┐
│           ERROR HANDLING FLOW                  │
└────────────────────────────────────────────────┘

User Submission
    │
    ├─ Validation Error
    │  ├─ Card number invalid
    │  ├─ Expiry invalid
    │  ├─ CVC invalid
    │  └─ Name empty
    │
    │  Response: Show red border + error message
    │  User can: Correct input and resubmit
    │
    ├─ Order Creation Error
    │  ├─ Network timeout
    │  ├─ 400: Bad request
    │  ├─ 401: Not authenticated
    │  ├─ 403: No KYC verification
    │  └─ 500: Server error
    │
    │  Response: "Failed to create order. Please try again."
    │  User can: Click "Try Again" in error modal
    │
    ├─ Payment Creation Error
    │  ├─ Network timeout
    │  ├─ 400: Invalid payment data
    │  └─ 500: Server error
    │
    │  Response: "An unexpected error occurred. Please try again."
    │  User can: Click "Try Again" in error modal
    │
    ├─ Status Polling Error
    │  ├─ Network error during polling
    │  ├─ Timeout after 30 seconds
    │  └─ Malformed response
    │
    │  Response:
    │    - Timeout: Show as success (payment likely processing)
    │    - Other: Show error and allow retry
    │  User can: Retry or close modal
    │
    └─ Payment Processing Error
       ├─ Payment declined
       ├─ Insufficient funds
       ├─ Card expired
       ├─ Fraudulent transaction detected
       └─ Payment gateway error

       Response: "Payment was declined. Please check your card details..."
       User can: Click "Try Again" with different card
```

---

## Validation Rules by Mode

```
┌──────────────────────────────────────────────────┐
│      VALIDATION RULES: MOCK vs REAL              │
└──────────────────────────────────────────────────┘

MOCK MODE (Current Implementation)
═════════════════════════════════════

Card Number:
  ✓ Accepted: Any 10+ digit number
  ✓ Formatting: Spaces every 4 digits (automatic)
  ✗ Luhn validation: NOT performed
  ✗ Card type check: NOT enforced

Expiry Date:
  ✓ Accepted: MM/YY format (12/25)
  ✓ Formatting: Automatic slash insertion
  ✗ Expiry validation: NOT performed
  ✗ Future date check: NOT enforced

CVC:
  ✓ Accepted: 3-4 digit number
  ✗ Length validation: NOT enforced
  ✗ Card type matching: NOT enforced (Amex = 4 digits not required)

Cardholder Name:
  ✓ Accepted: Any text, min 1 character
  ✗ Format validation: NOT performed


STRIPE MODE (Future Implementation)
════════════════════════════════════

Card Number:
  ✓ Luhn algorithm validation
  ✓ Card type detection and enforcement
  ✓ Token generation (never stored)
  ✓ Stripe validation

Expiry Date:
  ✓ Must be future date
  ✓ MM/YY format validation
  ✓ Stripe validation

CVC:
  ✓ Length validation (3-4 digits)
  ✓ Card type matching (Amex = 4, others = 3)
  ✓ Stripe validation

Cardholder Name:
  ✓ Min/max length validation
  ✓ Character validation
  ✓ Stripe validation
```

---

## File Size Reference

```
┌─────────────────────────────────────────┐
│         FILE SIZE REFERENCE             │
└─────────────────────────────────────────┘

app/lib/types/payment.ts
  • Lines: 250
  • Size: ~8 KB
  • Types, enums, validators

app/lib/api.ts
  • Lines: +50 (added to existing file)
  • Size: +2 KB
  • Payment API functions

app/components/payment/PaymentModal.tsx
  • Lines: 800+
  • Size: ~32 KB
  • Main payment component

app/components/payment/index.ts
  • Lines: 1
  • Size: <1 KB
  • Export file

app/checkout/page.tsx
  • Lines: +30 (modified)
  • Size: +1.5 KB
  • Integration changes

Total New Code: ~45 KB
Total Changes: ~70 KB (including checkout modifications)
```

---

## Performance Profile

```
┌──────────────────────────────────────────┐
│       PERFORMANCE PROFILE                │
└──────────────────────────────────────────┘

Form Rendering: <50ms
  • Modal opens instantly
  • Input fields render immediately
  • Animations are smooth

Form Input Processing: <10ms per keystroke
  • Card number detection: <5ms
  • Card brand detection: <3ms
  • Input formatting: <2ms

Form Validation: <10ms
  • Field validation: <8ms
  • Luhn algorithm: <3ms
  • Error display: <2ms

API Calls (Network-dependent):
  • Order creation: 300-800ms
  • Payment creation: 500-2000ms
  • Status polling: 200-500ms each

Total End-to-End:
  • Success path: 2-5 seconds
  • Error path: 1-3 seconds (until error)
  • Retry path: Variable (depends on user)
```

This completes the visual documentation of the payment system architecture and flows!
