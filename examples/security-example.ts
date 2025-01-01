import { RunesSDK } from '../src/sdk';
import { SDKConfig } from '../src/types/config.types';

async function main() {
  // SDK configuration
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

  // SDK instance
  const sdk = new RunesSDK(config);
  await sdk.initialize();

  try {
    // API key
    const apiKey = await sdk.generateAPIKey('test-user', {
      permissions: ['transaction:write'],
    });
    console.log('Generated API key:', apiKey);

    // Sign
    const payload = { test: 'data' };
    const signature = sdk.generateSignature(payload, apiKey.secretKey);

    // Validate API key
    const isValid = await sdk.validateApiKey(apiKey.apiKey, signature, payload, '127.0.0.1');
    console.log('API key validation:', isValid);

    if (!isValid) {
      console.error('API key validation failed');
      return;
    }

    // Transaction
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
}

main();
