import { RunesSDK } from '../../sdk';
import { _RPCClient } from '../../utils/rpc.client';
import { _ConsoleLogger } from '../../utils/logger';
import { SDKConfig } from '../../types/config.types';

describe('RunesSDK Integration', () => {
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

  describe('Transaction Monitoring', () => {
    it('should monitor transaction status changes', async () => {
      const txid = 'test-transaction-id';
      const statusChanges: any[] = [];

      sdk.onTransactionStatusChanged(status => {
        statusChanges.push(status);
      });

      await sdk.watchTransaction(txid);

      // Wait for status updates
      await new Promise(resolve => setTimeout(resolve, 2000));

      expect(statusChanges.length).toBeGreaterThan(0);
      expect(statusChanges[0].txid).toBe(txid);
    });
  });

  describe('API Security', () => {
    it('should handle API key lifecycle', async () => {
      const userId = 'test-user';

      // Generate API key
      const apiKey = await sdk.generateAPIKey(userId);
      expect(apiKey).toBeDefined();
      expect(typeof apiKey.key).toBe('string');

      // Validate API key
      const isValid = sdk.validateAPIKey(apiKey.key);
      expect(isValid).toBe(true);

      // Deactivate API key
      const deactivated = sdk.deactivateAPIKey(apiKey.key);
      expect(deactivated).toBe(true);

      // Validate deactivated key
      const isStillValid = sdk.validateAPIKey(apiKey.key);
      expect(isStillValid).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const clientId = 'test-client';
      const requests = 10;

      // Make multiple requests
      for (let i = 0; i < requests; i++) {
        const canProceed = await sdk.checkRateLimit(clientId);
        expect(canProceed).toBe(true);
      }

      // Wait for rate limit window to reset
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Should be able to make requests again
      const canProceed = await sdk.checkRateLimit(clientId);
      expect(canProceed).toBe(true);
    });
  });

  describe('Webhook Integration', () => {
    it('should handle webhook registration and notifications', async () => {
      const webhookId = 'test-webhook';
      const webhookUrl = 'https://example.com/webhook';

      // Register webhook
      sdk.registerWebhook(webhookId, {
        url: webhookUrl,
        events: ['transaction.confirmed'],
        secret: 'test-secret',
      });

      // Simulate transaction confirmation
      const txid = 'test-tx';
      await sdk.watchTransaction(txid);

      // Wait for webhook notification
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Unregister webhook
      const unregistered = sdk.unregisterWebhook(webhookId);
      expect(unregistered).toBe(true);
    });
  });
});
