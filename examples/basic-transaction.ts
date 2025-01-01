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
}

main();
