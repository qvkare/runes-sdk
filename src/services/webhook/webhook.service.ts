import { Logger } from '../../types/logger.types';
import { WebhookConfig, WebhookEventType, WebhookResult } from '../../types/webhook.types';

export class WebhookService {
  private webhooks: Map<string, WebhookConfig>;

  constructor(
    private readonly logger: Logger,
    private readonly defaultConfig: WebhookConfig
  ) {
    this.webhooks = new Map();
  }

  registerWebhook(webhookId: string, config: WebhookConfig): void {
    this.webhooks.set(webhookId, {
      ...this.defaultConfig,
      ...config
    });
    this.logger.info('Webhook registered successfully:', webhookId);
  }

  async notify(eventType: WebhookEventType, data: any): Promise<WebhookResult[]> {
    const results: WebhookResult[] = [];

    for (const [webhookId, config] of this.webhooks.entries()) {
      if (config.events.includes(eventType)) {
        try {
          const response = await fetch(config.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              type: eventType,
              data,
              timestamp: Date.now()
            })
          });

          if (response.ok) {
            results.push({ success: true });
            this.logger.info('Webhook notification sent successfully:', webhookId);
          } else {
            results.push({ success: false, error: `HTTP ${response.status}` });
            this.logger.error('Webhook notification failed:', webhookId);
          }
        } catch (error: any) {
          results.push({ success: false, error: error?.message || 'Unknown error' });
          this.logger.error('Error sending webhook notification:', error);
        }
      }
    }

    return results;
  }
}
