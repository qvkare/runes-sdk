import { WebhookService } from '../service';
import { WebhookConfig, WebhookEventType } from '../../../types/webhook.types';
import { createMockLogger } from '../../../utils/test.utils';
import { Logger } from '../../../types/logger.types';

describe('WebhookService', () => {
  let service: WebhookService;
  let mockLogger: jest.Mocked<Logger>;
  const defaultConfig: WebhookConfig = {
    url: 'http://default.webhook.com',
    events: [WebhookEventType.TRANSFER],
    timeout: 5000
  };

  beforeEach(() => {
    mockLogger = createMockLogger();
    service = new WebhookService(mockLogger, defaultConfig);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerWebhook', () => {
    it('should register webhook with default config', () => {
      const webhookId = 'webhook1';
      service.registerWebhook(webhookId, {});
      expect(mockLogger.info).toHaveBeenCalledWith('Webhook registered successfully:', webhookId);
    });

    it('should override default config with custom config', () => {
      const webhookId = 'webhook2';
      const customConfig: Partial<WebhookConfig> = {
        url: 'http://custom.webhook.com',
        events: [WebhookEventType.TRANSFER, WebhookEventType.MINT],
        timeout: 10000
      };
      service.registerWebhook(webhookId, customConfig);
      expect(mockLogger.info).toHaveBeenCalledWith('Webhook registered successfully:', webhookId);
    });
  });

  describe('notify', () => {
    it('should send notification successfully', async () => {
      const webhookId = 'test-webhook';
      service.registerWebhook(webhookId, {});

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK'
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const results = await service.notify(WebhookEventType.TRANSFER, { data: 'test' });

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(results[0].webhookId).toBe(webhookId);
      expect(results[0].statusCode).toBe(200);
    });

    it('should handle HTTP error response', async () => {
      const webhookId = 'test-webhook';
      service.registerWebhook(webhookId, {});

      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValue('Server Error')
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const results = await service.notify(WebhookEventType.TRANSFER, { data: 'test' });

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].webhookId).toBe(webhookId);
      expect(results[0].statusCode).toBe(500);
      expect(results[0].error).toBe('HTTP 500');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Webhook notification failed:',
        webhookId
      );
    });

    it('should handle network error', async () => {
      const webhookId = 'test-webhook';
      service.registerWebhook(webhookId, {});

      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      const results = await service.notify(WebhookEventType.TRANSFER, { data: 'test' });

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].webhookId).toBe(webhookId);
      expect(results[0].error).toBe('Network error');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error sending webhook notification:',
        networkError
      );
    });

    it('should not send notification for unregistered event type', async () => {
      const webhookId = 'test-webhook';
      service.registerWebhook(webhookId, {
        events: [WebhookEventType.MINT]
      });

      const results = await service.notify(WebhookEventType.TRANSFER, { data: 'test' });

      expect(results).toHaveLength(0);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should send notifications to multiple webhooks', async () => {
      const webhook1 = 'webhook1';
      const webhook2 = 'webhook2';
      service.registerWebhook(webhook1, {});
      service.registerWebhook(webhook2, {});

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK'
      };
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce(mockResponse);

      const results = await service.notify(WebhookEventType.TRANSFER, { data: 'test' });

      expect(results).toHaveLength(2);
      expect(results.every(r => r.success)).toBe(true);
      expect(results[0].webhookId).toBe(webhook1);
      expect(results[1].webhookId).toBe(webhook2);
    });
  });
});
