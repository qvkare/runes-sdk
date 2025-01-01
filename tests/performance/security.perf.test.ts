import { RunesSDK } from '../../src/sdk';
import { SDKConfig } from '../../src/types/config.types';

describe('Security Performance Tests', () => {
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

  it('should handle high volume API key validation', async () => {
    const apiKey = await sdk.generateAPIKey('test-user', {
      permissions: ['transaction:write'],
    });

    const signature = 'test-signature';
    const payload = { test: 'data' };

    console.time('api-key-validation');
    await Promise.all(
      Array(1000)
        .fill(null)
        .map(() => sdk.validateApiKey(apiKey.apiKey, signature, payload, '127.0.0.1'))
    );
    console.timeEnd('api-key-validation');
  });

  it('should handle concurrent IP whitelist validation', async () => {
    const apiKey = await sdk.generateAPIKey('test-user', {
      permissions: ['transaction:write'],
      ipWhitelist: Array(1000)
        .fill(null)
        .map((_, i) => `192.168.1.${i}`),
    });

    console.time('ip-validation');
    await Promise.all(
      Array(1000)
        .fill(null)
        .map((_, i) =>
          sdk.validateApiKey(apiKey.apiKey, 'test-signature', { test: 'data' }, `192.168.1.${i}`)
        )
    );
    console.timeEnd('ip-validation');
  });

  it('should handle high volume key generation', async () => {
    console.time('key-generation');
    await Promise.all(
      Array(100)
        .fill(null)
        .map((_, i) =>
          sdk.generateAPIKey(`user-${i}`, {
            permissions: ['transaction:write'],
          })
        )
    );
    console.timeEnd('key-generation');
  });
});
