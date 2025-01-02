# Basic Transaction Example

This example demonstrates how to perform basic transaction operations using the Runes SDK, including creating, validating, sending, and monitoring transactions.

## Configuration

First, set up the SDK configuration:

```typescript
import { RunesSDK } from '../src/sdk';
import { SDKConfig } from '../src/types/config.types';

const config: SDKConfig = {
  host: process.env.RPC_HOST || 'http://localhost:8332',
  username: process.env.RPC_USER || 'test',
  password: process.env.RPC_PASS || 'test',
  mempoolConfig: {
    monitorInterval: 1000,
    maxTransactions: 100,
    minFeeRate: 1,
  },
};
```

## SDK Initialization

Initialize the SDK:

```typescript
const sdk = new RunesSDK(config);
await sdk.initialize();
```

## Transaction Operations

Perform various transaction operations:

```typescript
try {
  // Create transaction
  const transaction = {
    txid: 'test-tx',
    fee: '1000',
  };

  // Validate transaction
  const validationResult = await sdk.validateTransaction(transaction);
  if (!validationResult.isValid) {
    console.error('Transaction validation failed:', validationResult.errors);
    return;
  }

  // Send transaction
  const txid = await sdk.sendTransaction(transaction);
  console.log('Transaction sent:', txid);

  // Watch transaction
  await sdk.watchTransaction(txid);

  // Check transaction status
  const status = await sdk.getTransactionStatus(txid);
  console.log('Transaction status:', status);
} catch (error) {
  console.error('Error:', error);
} finally {
  await sdk.shutdown();
}
```

## Error Handling

The example includes proper error handling and cleanup:
- Validation errors are caught and logged
- Transaction errors are caught and handled
- SDK is properly shut down in the finally block

## Running the Example

To run this example:

1. Set up your environment variables:
   ```bash
   export RPC_HOST=http://your-node-url
   export RPC_USER=your-username
   export RPC_PASS=your-password
   ```

2. Run the example:
   ```bash
   ts-node basic-transaction.ts
   ``` 