# Runes SDK

A secure and scalable SDK for Runes. This SDK provides all the necessary tools for managing, validating, and monitoring Runes transactions.

## Features

API Security
- API Key management
- Signature validation
- IP whitelist support

Rate Limiting
- Time window based limits
- Flexible limit configuration
- Automatic cleanup

Transaction Validation
- Address format validation
- Balance checks
- Fee validation
- Amount limits

Mempool Monitoring
- Transaction status tracking
- Confirmation count checks
- RBF support

Webhook Integration
- Event-based notifications
- Configurable retry mechanism
- Multiple endpoint support
- Flexible event filtering
- See [examples/webhook-integration.ts](examples/webhook-integration.ts) for a complete example

## Installation

```bash
npm install @runes/sdk
```

## Quick Start

```typescript
import { RunesSDK } from '@runes/sdk';

// SDK Configuration
const sdk = new RunesSDK({
  host: 'your-node-url',
  username: 'your-username',
  password: 'your-password',
  
  // Security settings
  securityConfig: {
    keyExpirationTime: 3600000, // 1 hour
    maxKeysPerUser: 5,
    requiredKeyStrength: 256,
    ipWhitelistEnabled: true
  },

  // Rate limit settings
  rateLimitConfig: {
    windowSize: 60000,           // 1 minute
    maxRequestsPerWindow: 100,   // 100 requests per minute
    cleanupInterval: 300000,     // 5 minutes
    cleanupThreshold: 3600000    // 1 hour
  },

  // Validation settings
  validationConfig: {
    addressRegex: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/,
    maxTransactionAmount: '1000000000',
    minFee: '500',
    maxFee: '100000'
  },

  // Mempool settings
  mempoolConfig: {
    maxWatchTime: 3600000,      // 1 hour
    checkInterval: 15000,        // 15 seconds
    requiredConfirmations: 6,
    maxRetries: 3
  },

  // Webhook settings
  webhookConfig: {
    url: 'https://your-webhook-url.com',
    events: ['TRANSACTION_CONFIRMED', 'TRANSACTION_FAILED'],
    retryCount: 3,
    timeout: 5000
  }
});

// Generate API Key
const apiKey = await sdk.generateApiKey({
  userId: 'user123',
  permissions: ['transaction:write']
});

// Send Transaction
const transaction = {
  from: 'sender-address',
  to: 'receiver-address',
  amount: '100000',
  fee: '1000'
};

// Validate Transaction
const validationResult = await sdk.validateTransaction(transaction);
if (validationResult.isValid) {
  // Send and monitor transaction
  const txid = 'transaction-id';
  await sdk.watchTransaction(txid);
}
```

## Detailed Documentation

### API Security

Available features for API security:

```typescript
// Generate API Key
const apiKey = await sdk.generateApiKey({
  userId: 'user123',
  permissions: ['transaction:write'],
  ipWhitelist: ['127.0.0.1']
});

// Validate API Key
const validation = await sdk.validateApiKey(
  apiKey,
  signature,
  payload,
  ipAddress
);
```

### Rate Limiting

To control request limits:

```typescript
// Check rate limit
await sdk.checkLimit('user123', 'transaction:write');

// Check limit status
const status = await sdk.getLimitStatus('user123', 'transaction:write');

// Reset limit
await sdk.resetLimit('user123', 'transaction:write');
```

### Transaction Validation

To validate transactions:

```typescript
// Validate transaction
const result = await sdk.validateTransaction({
  from: 'sender-address',
  to: 'receiver-address',
  amount: '100000',
  fee: '1000'
});

if (result.isValid) {
  console.log('Transaction is valid');
} else {
  console.error('Errors:', result.errors);
  console.warn('Warnings:', result.warnings);
}
```

### Mempool Monitoring

To monitor transactions:

```typescript
// Watch transaction
await sdk.watchTransaction('txid');

// Check status
const status = await sdk.getTransactionStatus('txid');

// Stop watching
sdk.stopWatchingTransaction('txid');
```

### Webhook Integration

To receive event notifications:

```typescript
// Register webhook
const webhookId = 'my-webhook';
const webhookConfig = {
  url: 'https://your-webhook-url.com',
  events: ['TRANSACTION_CONFIRMED', 'TRANSACTION_FAILED'],
  retryCount: 3,
  timeout: 5000
};

sdk.registerWebhook(webhookId, webhookConfig);

// Webhook will receive POST requests with event data
// Example event payload:
{
  "type": "TRANSACTION_CONFIRMED",
  "data": {
    "txid": "transaction-id",
    "confirmations": 6,
    "timestamp": 1641234567890
  }
}
```

## Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run all tests
npm run test:all

# Run tests with coverage report
npm run test:coverage
```

## License

MIT 