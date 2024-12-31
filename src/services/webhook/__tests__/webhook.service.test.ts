import { WebhookService } from '../webhook.service';
import { ConsoleLogger, LogLevel } from '../../../utils/logger';

describe('WebhookService', () => {
  let service: WebhookService;
  let logger: ConsoleLogger;

  beforeEach(() => {
    logger = new ConsoleLogger('WebhookService', LogLevel.INFO);
    service = new WebhookService(logger);
  });

  describe('registerWebhook', () => {
    it('should register webhook successfully', () => {
      const url = 'http://example.com/webhook';
      const events = ['transaction', 'block'];
      
      service.registerWebhook(url, events);
      
      expect(service.getWebhooks()).toContainEqual({
        url,
        events,
        active: true
      });
    });

    it('should not register duplicate webhook', () => {
      const url = 'http://example.com/webhook';
      const events = ['transaction'];
      
      service.registerWebhook(url, events);
      service.registerWebhook(url, events);
      
      const webhooks = service.getWebhooks();
      expect(webhooks.length).toBe(1);
      expect(webhooks[0]).toEqual({
        url,
        events,
        active: true
      });
    });
  });

  describe('unregisterWebhook', () => {
    it('should unregister webhook successfully', () => {
      const url = 'http://example.com/webhook';
      service.registerWebhook(url, ['transaction']);
      
      service.unregisterWebhook(url);
      
      expect(service.getWebhooks()).toHaveLength(0);
    });

    it('should handle unregistering non-existent webhook', () => {
      expect(() => {
        service.unregisterWebhook('http://nonexistent.com/webhook');
      }).not.toThrow();
    });
  });

  describe('getWebhooks', () => {
    it('should return all registered webhooks', () => {
      const webhooks = [
        { url: 'http://example1.com/webhook', events: ['transaction'] },
        { url: 'http://example2.com/webhook', events: ['block'] }
      ];
      
      webhooks.forEach(webhook => {
        service.registerWebhook(webhook.url, webhook.events);
      });
      
      const registeredWebhooks = service.getWebhooks();
      expect(registeredWebhooks).toHaveLength(2);
      webhooks.forEach((webhook, index) => {
        expect(registeredWebhooks[index]).toEqual({
          ...webhook,
          active: true
        });
      });
    });

    it('should return empty array when no webhooks registered', () => {
      expect(service.getWebhooks()).toEqual([]);
    });
  });
}); 