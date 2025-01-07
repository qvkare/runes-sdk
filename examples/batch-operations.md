# Batch Operations Example

This example demonstrates how to perform batch operations using the Runes SDK, including validating, sending, and monitoring multiple transactions simultaneously.

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

## Batch Transaction Operations

Perform operations on multiple transactions:

```typescript
try {
  // Create transactions
  const transactions = [
    {
      txid: 'tx1',
      fee: '1000',
    },
    {
      txid: 'tx2',
      fee: '1000',
    },
  ];

  // Validate transactions in parallel
  const validationResults = await Promise.all(
    transactions.map(tx => sdk.validateTransaction(tx))
  );

  // Filter valid transactions
  const validTransactions = transactions.filter((_, index) => validationResults[index].isValid);

  if (validTransactions.length === 0) {
    console.error('No valid transactions found');
    return;
  }

  // Send transactions in parallel
  const txids = await Promise.all(validTransactions.map(tx => sdk.sendTransaction(tx)));
  console.log('Transactions sent:', txids);

  // Watch transactions in parallel
  await Promise.all(txids.map(txid => sdk.watchTransaction(txid)));

  // Check transaction statuses in parallel
  const statuses = await Promise.all(txids.map(txid => sdk.getTransactionStatus(txid)));
  console.log('Transaction statuses:', statuses);
} catch (error) {
  console.error('Error:', error);
} finally {
  await sdk.shutdown();
}
```

## Key Features

The example demonstrates several important batch processing features:
- Parallel validation of multiple transactions
- Filtering of invalid transactions
- Parallel sending of valid transactions
- Parallel monitoring of transaction status
- Proper error handling and cleanup

## Performance Considerations

This example uses `Promise.all()` for parallel processing, which can significantly improve performance when dealing with multiple transactions. However, be mindful of:
- Rate limits on the RPC node
- Memory usage when processing large batches
- Network bandwidth constraints

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
   ts-node batch-operations.ts
   ``` 