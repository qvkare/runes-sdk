import { WebhookService } from '../webhook.service';
import { WebhookConfig, WebhookEventType } from '../../../types/webhook.types';
import { createMockLogger } from '../../../utils/test.utils';

jest.mock('node-fetch');

describe('WebhookService', () => {
  let service: WebhookService;
  const mockLogger = createMockLogger();
  const defaultConfig: WebhookConfig = {
    url: 'http://default.webhook.com',
    events: [WebhookEventType.TRANSFER],
    retryCount: 3,
    timeout: 5000
  };

  beforeEach(() => {
    service = new WebhookService(mockLogger, defaultConfig);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('registerWebhook', () => {
    it('should register webhook with default config', () => {
      const webhookId = 'webhook1';
      service.registerWebhook(webhookId, {
        url: 'http://test.webhook.com',
        events: [WebhookEventType.TRANSFER],
        retryCount: 3,
        timeout: 5000
      });
      expect(mockLogger.info).toHaveBeenCalledWith('Webhook registered successfully:', webhookId);
    });

    it('should override default config with custom config', () => {
      const webhookId = 'webhook2';
      const customConfig: WebhookConfig = {
        url: 'http://custom.webhook.com',
        events: [WebhookEventType.MINT],
        retryCount: 5,
        timeout: 10000
      };
      service.registerWebhook(webhookId, customConfig);
      expect(mockLogger.info).toHaveBeenCalledWith('Webhook registered successfully:', webhookId);
    });
  });

  describe('notify', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock) = jest.fn();
    });

    it('should send notification successfully', async () => {
      const webhookId = 'webhook3';
      service.registerWebhook(webhookId, defaultConfig);
      
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({ success: true })
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const results = await service.notify(WebhookEventType.TRANSFER, { data: 'test' });
      
      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('Webhook notification sent successfully:', webhookId);
      expect(global.fetch).toHaveBeenCalledWith(
        defaultConfig.url,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String)
        })
      );
    });

    it('should handle HTTP error response', async () => {
      const webhookId = 'webhook4';
      service.registerWebhook(webhookId, defaultConfig);
      
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Internal Server Error' })
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const results = await service.notify(WebhookEventType.TRANSFER, { data: 'test' });
      
      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBe('HTTP 500');
      expect(mockLogger.error).toHaveBeenCalledWith('Webhook notification failed:', webhookId);
    });

    it('should handle network error', async () => {
      const webhookId = 'webhook5';
      const networkError = new Error('Network error');
      service.registerWebhook(webhookId, defaultConfig);
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      const results = await service.notify(WebhookEventType.TRANSFER, { data: 'test' });
      
      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBe('Network error');
      expect(mockLogger.error).toHaveBeenCalledWith('Error sending webhook notification:', networkError);
    });

    it('should handle unknown error', async () => {
      const webhookId = 'webhook6';
      service.registerWebhook(webhookId, defaultConfig);
      (global.fetch as jest.Mock).mockRejectedValueOnce({});

      const results = await service.notify(WebhookEventType.TRANSFER, { data: 'test' });
      
      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBe('Unknown error');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should not send notification for unregistered event type', async () => {
      const webhookId = 'webhook7';
      service.registerWebhook(webhookId, {
        ...defaultConfig,
        events: [WebhookEventType.MINT]
      });

      const results = await service.notify(WebhookEventType.TRANSFER, { data: 'test' });
      
      expect(results).toHaveLength(0);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should send notifications to multiple webhooks', async () => {
      const webhook1 = 'webhook8';
      const webhook2 = 'webhook9';
      service.registerWebhook(webhook1, defaultConfig);
      service.registerWebhook(webhook2, {
        ...defaultConfig,
        url: 'http://another.webhook.com'
      });

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({ success: true })
      };
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce(mockResponse);

      const results = await service.notify(WebhookEventType.TRANSFER, { data: 'test' });
      
      expect(results).toHaveLength(2);
      expect(results.every(r => r.success)).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
