# Webhook Integration

The Runes SDK provides webhook support that allows you to track changes in transaction states in real-time.

## Webhook Registration

```typescript
const sdk = new RunesSDK(config);

sdk.registerWebhook('unique-webhook-id', {
  url: 'https://api.example.com/webhook',
  secret: 'your-secret-key',
  events: ['transaction.confirmed', 'transaction.failed'],
  retryCount: 3,
  timeoutMs: 5000
});
```

### Webhook Configuration Options

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|----------|-------------|
| url | string | Yes | - | Webhook endpoint URL |
| secret | string | No | - | Secret key for signing |
| events | WebhookEventType[] | Yes | - | Events to listen for |
| retryCount | number | No | 3 | Number of retry attempts for failed requests |
| timeoutMs | number | No | 5000 | Request timeout (ms) |

### Event Types

- `transaction.confirmed`: When transaction is confirmed
- `transaction.failed`: When transaction fails
- `transaction.replaced`: When transaction is replaced by RBF
- `transaction.unconfirmed`: When transaction is not yet confirmed

## Webhook Payload

Each webhook call includes a JSON payload in the following format:

```typescript
{
  "event": "transaction.confirmed",
  "timestamp": 1634567890123,
  "data": {
    "txid": "abc123...",
    "status": "confirmed",
    "confirmations": 6,
    "lastChecked": 1634567890123
  },
  "signature": "sha256-hmac-signature" // If secret is specified
}
```

### Signing and Security

HMAC-SHA256 signing is used to ensure webhook call security:

1. Specify a `secret` during webhook registration
2. Check the `X-Webhook-Signature` header in each webhook request
3. To verify the signature:

```typescript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('hex');
  return signature === expectedSignature;
}
```

## Error Handling

The webhook service automatically retries in the following cases:

- Network errors
- 5xx server errors
- Timeouts

Retries are made using an exponential backoff strategy:
- 1st retry: after 2 seconds
- 2nd retry: after 4 seconds
- 3rd retry: after 8 seconds

## Removing a Webhook

```typescript
sdk.unregisterWebhook('unique-webhook-id');
```

## Best Practices

1. Use a unique ID for each webhook
2. Use a strong secret for signing
3. Make your webhook endpoint respond quickly (< 1 second)
4. Return 200 OK immediately after receiving the webhook
5. Process webhook operations in the background
6. Use HTTPS for your webhook URL
7. Implement rate limiting

## Example Implementation

```typescript
// Webhook endpoint (Express.js)
app.post('/webhook', express.json(), (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = req.body;

  // Verify signature
  if (!verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Return 200 OK immediately
  res.status(200).send();

  // Process in background
  handleWebhookAsync(payload).catch(console.error);
});

async function handleWebhookAsync(payload) {
  switch (payload.event) {
    case 'transaction.confirmed':
      await processConfirmedTransaction(payload.data);
      break;
    case 'transaction.failed':
      await processFailedTransaction(payload.data);
      break;
  }
}
``` 