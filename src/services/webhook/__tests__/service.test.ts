import { WebhookService } from '../service';
import { Logger } from '../../../types/logger.types';
import { createMockLogger } from '../../../utils/test.utils';
import { WebhookConfig, WebhookEventType } from '../../../types/webhook.types';
import { jest } from '@jest/globals';

describe('WebhookService', () => {
  let webhookService: WebhookService;
  let mockLogger: jest.Mocked<Logger>;
  let defaultConfig: WebhookConfig;
  let config: WebhookConfig;

  beforeEach(() => {
    mockLogger = createMockLogger();
    defaultConfig = {
      url: 'http://default.com/webhook',
      events: [WebhookEventType.TRANSACTION_CONFIRMED],
      retryCount: 3,
      timeout: 5000
    };
    webhookService = new WebhookService(mockLogger, defaultConfig);
    config = {
      url: 'http://example.com/webhook',
      events: [WebhookEventType.TRANSACTION_CONFIRMED],
      retryCount: 3,
      timeout: 5000
    };
    global.fetch = jest.fn() as jest.MockedFunction<typeof global.fetch>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerWebhook', () => {
    it('should register webhook successfully', () => {
      const webhookId = 'test-webhook';
      webhookService.registerWebhook(webhookId, config);
      expect(mockLogger.info).toHaveBeenCalledWith('Webhook registered successfully:', webhookId);
    });

    it('should merge with default config', () => {
      const webhookId = 'test-webhook';
      const partialConfig: Partial<WebhookConfig> = {
        url: 'http://example.com/webhook'
      };
      webhookService.registerWebhook(webhookId, partialConfig as WebhookConfig);
      expect(mockLogger.info).toHaveBeenCalledWith('Webhook registered successfully:', webhookId);
    });
  });

  describe('notify', () => {
    it('should notify registered webhooks successfully', async () => {
      const webhookId = 'test-webhook';
      const event = {
        type: WebhookEventType.TRANSACTION_CONFIRMED,
        data: { txid: 'test-tx' },
        timestamp: Date.now()
      };

      webhookService.registerWebhook(webhookId, config);

      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
        statusText: 'OK'
      });

      (global.fetch as jest.MockedFunction<typeof global.fetch>).mockResolvedValueOnce(mockResponse);

      const results = await webhookService.notify(event.type, event.data);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('Webhook notification sent successfully:', webhookId);
      expect(global.fetch).toHaveBeenCalledWith(
        config.url,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String)
        })
      );
    });

    it('should handle HTTP error response', async () => {
      const webhookId = 'test-webhook';
      const event = {
        type: WebhookEventType.TRANSACTION_CONFIRMED,
        data: { txid: 'test-tx' }
      };

      webhookService.registerWebhook(webhookId, config);

      const mockResponse = new Response('Internal Server Error', {
        status: 500,
        statusText: 'Internal Server Error'
      });

      (global.fetch as jest.MockedFunction<typeof global.fetch>).mockResolvedValueOnce(mockResponse);

      const results = await webhookService.notify(event.type, event.data);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBe('HTTP 500');
      expect(mockLogger.error).toHaveBeenCalledWith('Webhook notification failed:', webhookId);
    });

    it('should handle network error', async () => {
      const webhookId = 'test-webhook';
      const event = {
        type: WebhookEventType.TRANSACTION_CONFIRMED,
        data: { txid: 'test-tx' }
      };

      webhookService.registerWebhook(webhookId, config);

      const networkError = new Error('Network error');
      (global.fetch as jest.MockedFunction<typeof global.fetch>).mockRejectedValueOnce(networkError);

      const results = await webhookService.notify(event.type, event.data);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBe('Network error');
      expect(mockLogger.error).toHaveBeenCalledWith('Error sending webhook notification:', networkError);
    });

    it('should not notify webhooks for unregistered event types', async () => {
      const webhookId = 'test-webhook';
      const event = {
        type: WebhookEventType.TRANSACTION_CONFIRMED,
        data: { txid: 'test-tx' }
      };

      const configWithDifferentEvent = {
        ...config,
        events: []
      };

      webhookService.registerWebhook(webhookId, configWithDifferentEvent);

      const results = await webhookService.notify(event.type, event.data);

      expect(results).toHaveLength(0);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle multiple registered webhooks', async () => {
      const webhook1Id = 'webhook1';
      const webhook2Id = 'webhook2';
      const event = {
        type: WebhookEventType.TRANSACTION_CONFIRMED,
        data: { txid: 'test-tx' }
      };

      const config2 = { ...config, url: 'http://example2.com/webhook' };
      webhookService.registerWebhook(webhook1Id, config);
      webhookService.registerWebhook(webhook2Id, config2);

      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
        statusText: 'OK'
      });

      (global.fetch as jest.MockedFunction<typeof global.fetch>)
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce(mockResponse);

      const results = await webhookService.notify(event.type, event.data);

      expect(results).toHaveLength(2);
      expect(results.every(r => r.success)).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
}); 