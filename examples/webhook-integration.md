# Webhook Integration Example

This example demonstrates how to integrate webhooks with the Runes SDK for real-time event notifications and monitoring.

## Configuration

First, initialize the SDK with webhook configuration:

```typescript
import { RunesSDK } from '../src';
import { WebhookEventType } from '../src/types/webhook.types';

const sdk = new RunesSDK({
  host: 'your-node-url',
  username: 'your-username',
  password: 'your-password',
  
  // Default webhook configuration
  webhookConfig: {
    url: 'https://default-webhook.com',
    events: [WebhookEventType.TRANSACTION_CONFIRMED],
    retryCount: 3,
    timeout: 5000
  }
});
```

## Registering Webhooks

Register multiple webhooks for different event types:

```typescript
// Transaction webhook
const webhook1Id = 'transaction-webhook';
await sdk.registerWebhook(webhook1Id, {
  url: 'https://your-webhook-1.com',
  events: [
    WebhookEventType.TRANSACTION_CONFIRMED,
    WebhookEventType.TRANSACTION_FAILED
  ],
  retryCount: 3,
  timeout: 5000
});

// Monitoring webhook
const webhook2Id = 'monitoring-webhook';
await sdk.registerWebhook(webhook2Id, {
  url: 'https://your-webhook-2.com',
  events: [
    WebhookEventType.MEMPOOL_FULL,
    WebhookEventType.HIGH_FEES
  ],
  retryCount: 5,
  timeout: 10000
});
```

## Transaction Processing

Process a transaction and receive webhook notifications:

```typescript
// Example transaction
const transaction = {
  from: 'sender-address',
  to: 'receiver-address',
  amount: '100000',
  fee: '1000'
};

// Validate and send transaction
const validationResult = await sdk.validateTransaction(transaction);
if (validationResult.isValid) {
  const txid = 'transaction-id';
  
  // Watch transaction and receive webhook notifications
  await sdk.watchTransaction(txid);
}
```

## Webhook Payloads

Example webhook payloads for different events:

### Transaction Confirmed Event
```json
{
  "type": "TRANSACTION_CONFIRMED",
  "data": {
    "txid": "transaction-id",
    "confirmations": 6,
    "timestamp": 1641234567890
  }
}
```

### High Fees Event
```json
{
  "type": "HIGH_FEES",
  "data": {
    "currentFee": "5000",
    "recommendedFee": "2000",
    "timestamp": 1641234567890
  }
}
```

## Webhook Management

Unregister webhooks when they are no longer needed:

```typescript
await sdk.unregisterWebhook(webhook1Id);
await sdk.unregisterWebhook(webhook2Id);
```

## Features

The example demonstrates:
- Multiple webhook registration
- Different event type handling
- Configurable retry and timeout settings
- Transaction monitoring with webhooks
- Webhook payload structure
- Proper webhook cleanup

## Best Practices

When implementing webhooks:
1. Use HTTPS endpoints
2. Implement proper authentication
3. Handle webhook retries
4. Set appropriate timeouts
5. Validate webhook payloads
6. Monitor webhook delivery status

## Running the Example

To run this example:

1. Set up your environment variables:
   ```bash
   export NODE_URL=your-node-url
   export USERNAME=your-username
   export PASSWORD=your-password
   ```

2. Run the example:
   ```bash
   ts-node webhook-integration.ts
   ```

## Security Considerations

Remember to:
- Secure webhook endpoints with HTTPS
- Validate webhook signatures
- Implement rate limiting
- Monitor for failed deliveries
- Keep webhook URLs confidential 