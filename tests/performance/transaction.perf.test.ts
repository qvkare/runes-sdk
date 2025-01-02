import { RunesSDK } from '../../src/sdk';
import { SDKConfig } from '../../src/types/config.types';

describe('Transaction Performance Tests', () => {
  let sdk: RunesSDK;
  let config: SDKConfig;

  beforeAll(async () => {
    config = {
      host: process.env.RPC_HOST || 'http://localhost:8332',
      username: process.env.RPC_USER || 'test',
      password: process.env.RPC_PASS || 'test',
      mempoolConfig: {
        monitorInterval: 1000,
        maxTransactions: 100,
        minFeeRate: 1,
      },
    };

    sdk = new RunesSDK(config);
    await sdk.initialize();
  });

  afterAll(async () => {
    await sdk.shutdown();
  });

  it('should handle high volume transaction validation', async () => {
    const transactions = Array(1000)
      .fill(null)
      .map(() => ({
        txid: 'test-tx',
        fee: '1000',
      }));

    console.time('transaction-validation');
    await Promise.all(transactions.map(tx => sdk.validateTransaction(tx)));
    console.timeEnd('transaction-validation');
  });

  it('should handle concurrent rate limit checks', async () => {
    console.time('rate-limit-checks');
    await Promise.all(
      Array(1000)
        .fill(null)
        .map((_, i) => sdk.checkLimit(`user${i}`, 'transaction:write'))
    );
    console.timeEnd('rate-limit-checks');
  });

  it('should handle high volume transaction processing', async () => {
    const transactions = Array(1000)
      .fill(null)
      .map(() => ({
        txid: 'test-tx',
        fee: '1000',
      }));

    console.time('transaction-processing');
    await Promise.all(transactions.map(tx => sdk.validateTransaction(tx)));
    console.timeEnd('transaction-processing');
  });
});
