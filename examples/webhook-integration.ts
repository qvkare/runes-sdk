import { RunesSDK } from '../src';
import { WebhookEventType } from '../src/types/webhook.types';

async function webhookExample() {
  // Initialize SDK
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

  // Register multiple webhooks
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
    
    // Webhooks will receive POST requests with event data
    // Example payload for TRANSACTION_CONFIRMED:
    // {
    //   "type": "TRANSACTION_CONFIRMED",
    //   "data": {
    //     "txid": "transaction-id",
    //     "confirmations": 6,
    //     "timestamp": 1641234567890
    //   }
    // }
    
    // Example payload for HIGH_FEES:
    // {
    //   "type": "HIGH_FEES",
    //   "data": {
    //     "currentFee": "5000",
    //     "recommendedFee": "2000",
    //     "timestamp": 1641234567890
    //   }
    // }
  }

  // Later, you can unregister webhooks if needed
  await sdk.unregisterWebhook(webhook1Id);
  await sdk.unregisterWebhook(webhook2Id);
}

webhookExample().catch(console.error); 