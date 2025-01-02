# Security Integration Example

This example demonstrates how to implement security features using the Runes SDK, including API key generation, signature creation, and validation.

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

## Security Operations

Implement various security features:

```typescript
try {
  // Generate API key with specific permissions
  const apiKey = await sdk.generateAPIKey('test-user', {
    permissions: ['transaction:write'],
  });
  console.log('Generated API key:', apiKey);

  // Create and sign payload
  const payload = { test: 'data' };
  const signature = sdk.generateSignature(payload, apiKey.secretKey);

  // Validate API key and signature
  const isValid = await sdk.validateApiKey(apiKey.apiKey, signature, payload, '127.0.0.1');
  console.log('API key validation:', isValid);

  if (!isValid) {
    console.error('API key validation failed');
    return;
  }

  // Perform authenticated transaction
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
} catch (error) {
  console.error('Error:', error);
} finally {
  await sdk.shutdown();
}
```

## Security Features

The example demonstrates several important security features:
- API key generation with specific permissions
- Payload signing and signature verification
- IP-based validation
- Transaction validation before processing
- Proper error handling and cleanup

## Best Practices

When implementing security features:
1. Always use HTTPS in production
2. Store API keys and secrets securely
3. Implement rate limiting
4. Log security events
5. Regularly rotate API keys
6. Use the principle of least privilege when assigning permissions

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
   ts-node security-example.ts
   ```

## Security Considerations

Remember to:
- Never expose API keys in client-side code
- Always validate input data
- Implement proper access controls
- Monitor for suspicious activity
- Keep dependencies up to date 