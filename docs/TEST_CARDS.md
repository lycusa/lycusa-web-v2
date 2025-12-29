# Mock Payment Test Cards

This document describes the test cards available for testing payment scenarios in the mock payment system.

## Overview

The mock payment strategy supports test card numbers that simulate specific payment outcomes. Pass the last 4 digits of the card number in the payment metadata to trigger specific scenarios.

## Available Test Cards

### Success Cards

| Card Number | Last 4 | Description |
|-------------|--------|-------------|
| `4242 4242 4242 4242` | `4242` | Always succeeds - Standard test card |
| `4000 0000 0000 0122` | `0122` | Always succeeds - Processing simulation |

### Failure Cards

| Card Number | Last 4 | Error Code | Description |
|-------------|--------|------------|-------------|
| `4000 0000 0000 0002` | `0002` | `CARD_DECLINED` | Generic decline |
| `4000 0000 0000 9995` | `9995` | `INSUFFICIENT_FUNDS` | Insufficient funds |
| `4000 0000 0000 9987` | `9987` | `LOST_CARD` | Card reported lost |
| `4000 0000 0000 9979` | `9979` | `STOLEN_CARD` | Card reported stolen |
| `4000 0000 0000 0069` | `0069` | `EXPIRED_CARD` | Card has expired |
| `4000 0000 0000 0127` | `0127` | `INCORRECT_CVC` | Incorrect CVC code |
| `4000 0000 0000 0119` | `0119` | `PROCESSING_ERROR` | Processing error |
| `4000 0000 0000 0259` | `0259` | `CARD_VELOCITY_EXCEEDED` | Card velocity exceeded |
| `4000 0000 0000 3220` | `3220` | `FRAUDULENT` | Fraudulent transaction |

## API Endpoint

Retrieve available test cards programmatically:

```
GET /payments/test-cards
```

This endpoint is public (no authentication required) and returns all test cards with their descriptions and usage instructions.

## Usage

### Creating a Payment with Test Card

Include the `cardLast4` field in the payment metadata:

```json
POST /payments
{
  "orderId": "order_123456",
  "sellerId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 1000,
  "currency": "USD",
  "method": "CREDIT_CARD",
  "platformFee": 100,
  "metadata": {
    "cardLast4": "0002"
  }
}
```

### Example: Simulating a Successful Payment

```json
{
  "metadata": {
    "cardLast4": "4242"
  }
}
```

### Example: Simulating Insufficient Funds

```json
{
  "metadata": {
    "cardLast4": "9995"
  }
}
```

### Example: Simulating Expired Card

```json
{
  "metadata": {
    "cardLast4": "0069"
  }
}
```

## Response Examples

### Successful Payment Response

```json
{
  "success": true,
  "transactionId": "mock_txn_1703847123456_abc123",
  "paymentId": "mock_pay_1703847123456_xyz789",
  "status": "COMPLETED",
  "processedAt": "2024-12-29T12:30:00.000Z",
  "gatewayResponse": {
    "gateway": "mock",
    "transactionId": "mock_txn_1703847123456_abc123",
    "amount": 1000,
    "currency": "USD",
    "method": "CREDIT_CARD",
    "platformFee": 100,
    "processingFee": 0.3,
    "netAmount": 899.7
  }
}
```

### Failed Payment Response

```json
{
  "success": false,
  "transactionId": "mock_txn_1703847123456_abc123",
  "paymentId": "mock_pay_1703847123456_xyz789",
  "status": "FAILED",
  "processedAt": "2024-12-29T12:30:00.000Z",
  "failureReason": "Insufficient funds",
  "gatewayResponse": {
    "gateway": "mock",
    "errorCode": "INSUFFICIENT_FUNDS",
    "errorMessage": "Insufficient funds",
    "transactionId": "mock_txn_1703847123456_abc123",
    "testCard": {
      "last4": "9995",
      "scenario": "Insufficient funds"
    }
  }
}
```

## Notes

- If no `cardLast4` is provided, the payment outcome is determined by the configured random failure rate (default: 10%)
- Test cards only work with the mock payment strategy
- The test card information is included in failed payment responses for debugging purposes
