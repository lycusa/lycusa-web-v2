# Mock Payment Testing Guide

This guide explains how to test the payment flow using the mock payment system during development.

## Overview

The payment modal includes built-in test scenarios that allow you to quickly test different payment outcomes without needing real card data. The mock payment mode is enabled by default during development.

## Quick Testing Scenarios

When the payment modal opens, you'll see three quick test buttons:

### 1. **Success** ✓
- Card: `4242 4242 4242 4242`
- Holder: `Test Success`
- Expiry: `12/25`
- CVC: `123`

**What happens:**
- Order is created
- Payment processing begins
- Animation shows: Validating → Processing → Confirming
- Success animation is displayed
- Order is completed and redirected to order detail page

**Use case:** Test successful payment flow end-to-end

---

### 2. **Decline** ✗
- Card: `4000 0000 0000 0002`
- Holder: `Test Decline`
- Expiry: `12/25`
- CVC: `123`

**What happens:**
- Order is created
- Payment fails during processing
- Error animation is displayed with message
- User can click "Try Again" to retry
- Can modify card details and test again

**Use case:** Test error handling and retry logic

---

### 3. **Processing** ⏳
- Card: `4000 0000 0000 0122`
- Holder: `Test Processing`
- Expiry: `12/25`
- CVC: `123`

**What happens:**
- Order is created
- Payment status shows as "processing"
- Eventually resolves to "completed"
- User is redirected to order page

**Use case:** Test long-running payment processing scenarios

---

## How to Use

### Quick Test (Recommended)
1. Navigate to `/checkout?productId={id}&quantity=1`
2. Fill in delivery address
3. Click "Place Order"
4. Click one of the three test scenario buttons (Success, Decline, or Processing)
5. Watch the payment animation
6. Verify the outcome

### Manual Test
1. Navigate to `/checkout?productId={id}&quantity=1`
2. Manually enter test card details:
   - Card Number: `4242 4242 4242 4242`
   - Cardholder: `Your Name`
   - Expiry: `12/25` (any future date)
   - CVC: `123`
3. Click "Test Payment"
4. Observe the payment flow

### Custom Test Data
You can enter any card number (at least 10 digits) for testing. The mock payment system accepts any input:
- Card Number: Any 10+ digit number
- Expiry: Any date in MM/YY format (no validation in mock mode)
- CVC: Any 3-4 digit number

---

## Payment Flow Visualization

```
User enters checkout
    ↓
Clicks "Place Order"
    ↓
Payment Modal opens with test buttons
    ↓
Clicks "Success", "Decline", or "Processing"
    ↓
Fields auto-fill with test data
    ↓
Clicks "Test Payment"
    ↓
Form validation (minimal in mock mode)
    ↓
Order creation via API
    ↓
Payment creation via Payment Service
    ↓
Mock payment processing (500-2000ms delay)
    ↓
Status polling (checks for completion)
    ↓
Result:
  ✓ Success → Redirect to order detail
  ✗ Failure → Show error with retry button
  ⏳ Processing → Wait and resolve

```

## Placeholders in Mock Mode

When in mock payment mode, the form shows helpful placeholders:

| Field | Placeholder | Purpose |
|-------|------------|---------|
| Card Number | `4242 4242 4242 4242` | Common test card |
| Cardholder | `Test Success` | Indicates mock mode |
| Expiry | `12/25` | Future date |
| CVC | `123` | Standard test CVC |

The "Test Payment" button text changes to indicate mock mode (instead of "Pay").

---

## Testing Different Scenarios

### Test Successful Payment Flow
1. Click "Success" button
2. Verify order is created
3. Check order detail page for correct information
4. Verify payment status shows "completed"

### Test Error Handling
1. Click "Decline" button
2. See error message displayed
3. Click "Try Again" button
4. Enter different card details
5. Verify error is cleared and can retry

### Test Multiple Orders
1. Create multiple test orders using "Success" scenario
2. Navigate to Orders page (`/orders`)
3. Verify all orders appear in the list
4. Check that order count is correct

### Test with Different Products
1. Select different products from browse
2. Click "Buy Now"
3. Use different test scenarios
4. Verify each order associates with correct product

---

## Expected Behavior

### Success Scenario Timeline
```
0ms   → Payment modal opens
500ms → Click "Success" button
       Form fields auto-fill
       → Click "Test Payment"
       → Form validation passes
700ms → "Validating card..." (step 1)
1500ms → "Processing payment..." (step 2)
2000ms → "Confirming transaction..." (step 3)
2500ms → Success checkmark animation
3500ms → Redirect to order page
```

### Decline Scenario Timeline
```
0ms   → Payment modal opens
500ms → Click "Decline" button
       Form fields auto-fill
       → Click "Test Payment"
       → Form validation passes
700ms → "Validating card..." (step 1)
1500ms → "Processing payment..." (step 2)
2000ms → Error displayed
       → "Your card was declined"
       → "Try Again" button appears
```

---

## Debugging Tips

### Check Browser Console
```javascript
// Payment creation request
console.log("Creating payment with order:", orderId)

// Payment status polling
console.log("Checking payment status:", status)

// Order creation
console.log("Order created:", response)
```

### Enable Network Tab
In DevTools Network tab, you can see:
1. `POST /order/api/v1/orders` - Order creation
2. `POST /payment/payments` - Payment creation
3. `GET /payment/payments/{id}/status` - Status checks (repeated every ~1s)

### Check Response Times
- Order creation: typically <500ms
- Payment creation: typically <1000ms
- Status polling: typically <500ms each

---

## Common Issues & Solutions

### Issue: Payment modal doesn't open
**Solution:**
- Verify you're authenticated (sign in if needed)
- Check browser console for errors
- Verify product is available and not your own listing

### Issue: Test buttons don't fill the form
**Solution:**
- Ensure JavaScript is enabled
- Try refreshing the page
- Clear browser cache

### Issue: Payment always fails
**Solution:**
- Check browser console for errors
- Verify payment service is running
- Check network tab for failed requests

### Issue: Stuck on "Processing"
**Solution:**
- Wait up to 30 seconds (polling timeout)
- Check network tab for errors
- Refresh page if stuck longer than 30s

---

## Switching to Stripe Later

When you're ready to integrate Stripe:

1. The mock payment mode will be **automatically disabled**
2. Instead of test scenario buttons, real Stripe CardElement will appear
3. Real card validation (Luhn algorithm) will be enforced
4. All other UI remains the same

### Migration Path
```typescript
// Before (Mock Mode)
<PaymentModal
  paymentType="mock"  // ← Enables test buttons
  {...props}
/>

// After (Stripe Mode)
<PaymentModal
  paymentType="stripe"  // ← Disables test buttons, uses Stripe CardElement
  {...props}
/>
```

---

## Performance Notes

The mock payment system simulates realistic conditions:
- **Network delay**: 500-2000ms (configurable on backend)
- **Processing delay**: Varies by test scenario
- **Status check interval**: 1000ms with 30-second timeout

This mirrors how real payment gateways behave, so you can test timeout scenarios and user experience during slow networks.

---

## Testing Checklist

- [ ] Test "Success" scenario - complete flow end-to-end
- [ ] Test "Decline" scenario - error handling and retry
- [ ] Test "Processing" scenario - long-running payment handling
- [ ] Test manual card entry - custom card data
- [ ] Test order creation - verify order appears in `/orders`
- [ ] Test order detail - verify all information is correct
- [ ] Test multiple orders - verify list and counts are correct
- [ ] Test error recovery - can continue after error
- [ ] Test on mobile - responsive design works
- [ ] Test on different browsers - compatibility

---

## Next Steps

Once you've verified the mock payment flow:

1. **Integration Testing**: Test with real orders and users
2. **Performance Testing**: Test under load with multiple concurrent payments
3. **Stripe Setup**: Configure Stripe account and test credentials
4. **Stripe Migration**: Switch from mock to Stripe payment processor
5. **Production**: Deploy to production with Stripe enabled

See [STRIPE_INTEGRATION.md](./STRIPE_INTEGRATION.md) for detailed Stripe integration instructions.
