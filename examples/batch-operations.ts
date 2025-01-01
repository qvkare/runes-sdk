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

    // Validate transactions
    const validationResults = await Promise.all(
      transactions.map(tx => sdk.validateTransaction(tx))
    );

    // Filter valid transactions
    const validTransactions = transactions.filter((_, index) => validationResults[index].isValid);

    if (validTransactions.length === 0) {
      console.error('No valid transactions found');
      return;
    }

    // Send transactions
    const txids = await Promise.all(validTransactions.map(tx => sdk.sendTransaction(tx)));
    console.log('Transactions sent:', txids);

    // Watch transactions
    await Promise.all(txids.map(txid => sdk.watchTransaction(txid)));

    // Check transaction statuses
    const statuses = await Promise.all(txids.map(txid => sdk.getTransactionStatus(txid)));
    console.log('Transaction statuses:', statuses);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sdk.shutdown();
  }
}

main();
