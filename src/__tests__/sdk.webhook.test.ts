import { RunesSDK } from '../sdk';
import { SDKConfig } from '../types/config.types';
import { TransactionStatusInfo } from '../types/mempool.types';
import { WebhookEventType } from '../types/webhook.types';

jest.mock('../services/webhook/webhook.service');
jest.mock('../services/mempool/mempool.monitor.service');

describe('RunesSDK Webhook Integration', () => {
  let sdk: RunesSDK;
  let config: SDKConfig;

  beforeEach(() => {
    config = {
      host: 'http://localhost:8332',
      username: 'test',
      password: 'test',
    };
    sdk = new RunesSDK(config);
  });

  describe('webhook registration', () => {
    it('should register webhook successfully', () => {
      const webhookConfig = {
        url: 'https://test.com/webhook',
        secret: 'test-secret',
        events: ['transaction.confirmed' as WebhookEventType],
      };

      expect(() => {
        sdk.registerWebhook('test-id', webhookConfig);
      }).not.toThrow();
    });

    it('should unregister webhook successfully', () => {
      const webhookConfig = {
        url: 'https://test.com/webhook',
        events: ['transaction.confirmed' as WebhookEventType],
      };

      sdk.registerWebhook('test-id', webhookConfig);
      const result = sdk.unregisterWebhook('test-id');
      expect(result).toBe(true);
    });
  });

  describe('transaction status change notifications', () => {
    it('should notify webhooks when transaction is confirmed', async () => {
      const webhookConfig = {
        url: 'https://test.com/webhook',
        events: ['transaction.confirmed' as WebhookEventType],
      };

      sdk.registerWebhook('test-id', webhookConfig);

      const txStatus: TransactionStatusInfo & { txid: string } = {
        txid: 'test-tx',
        status: 'confirmed',
        confirmations: 6,
        lastChecked: Date.now(),
      };

      // Trigger status change event from MempoolMonitor
      const mempoolMonitor = (sdk as any).mempoolMonitor;
      mempoolMonitor.emit('statusChanged', txStatus);

      // Check if WebhookService's notify method was called
      const webhookService = (sdk as any).webhookService;
      expect(webhookService.notify).toHaveBeenCalledWith(
        'transaction.confirmed',
        expect.objectContaining({
          txid: 'test-tx',
          status: 'confirmed',
        })
      );
    });

    it('should notify webhooks when transaction fails', async () => {
      const webhookConfig = {
        url: 'https://test.com/webhook',
        events: ['transaction.failed' as WebhookEventType],
      };

      sdk.registerWebhook('test-id', webhookConfig);

      const txStatus: TransactionStatusInfo & { txid: string } = {
        txid: 'test-tx',
        status: 'failed',
        confirmations: 0,
        lastChecked: Date.now(),
      };

      const mempoolMonitor = (sdk as any).mempoolMonitor;
      mempoolMonitor.emit('statusChanged', txStatus);

      const webhookService = (sdk as any).webhookService;
      expect(webhookService.notify).toHaveBeenCalledWith(
        'transaction.failed',
        expect.objectContaining({
          txid: 'test-tx',
          status: 'failed',
        })
      );
    });

    it('should handle webhook delivery errors gracefully', async () => {
      const webhookConfig = {
        url: 'https://test.com/webhook',
        events: ['transaction.confirmed' as WebhookEventType],
      };

      sdk.registerWebhook('test-id', webhookConfig);

      const webhookService = (sdk as any).webhookService;
      webhookService.notify.mockRejectedValue(new Error('Network error'));

      const txStatus: TransactionStatusInfo & { txid: string } = {
        txid: 'test-tx',
        status: 'confirmed',
        confirmations: 6,
        lastChecked: Date.now(),
      };

      const mempoolMonitor = (sdk as any).mempoolMonitor;

      // Ensure error is caught and logged
      expect(mockLogger.error).toHaveBeenCalled();

      await expect(async () => {
        mempoolMonitor.emit('statusChanged', txStatus);
      }).not.toThrow();
    });
  });

  describe('shutdown', () => {
    it('should cleanup webhooks on shutdown', async () => {
      const webhookConfig = {
        url: 'https://test.com/webhook',
        events: ['transaction.confirmed' as WebhookEventType],
      };

      sdk.registerWebhook('test-id', webhookConfig);
      await sdk.shutdown();

      // Check if all webhooks are cleaned up
      const webhookService = (sdk as any).webhookService;
      expect(webhookService.unregisterWebhook).toHaveBeenCalledWith('test-id');
    });
  });
});
