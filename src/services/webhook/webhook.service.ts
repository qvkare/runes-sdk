import { Logger } from '../../utils/logger';

interface Webhook {
  url: string;
  events: string[];
  active: boolean;
}

export class WebhookService {
  private webhooks: Webhook[] = [];

  constructor(private readonly logger: Logger) {}

  registerWebhook(url: string, events: string[]) {
    const existingWebhook = this.webhooks.find(w => w.url === url);
    if (existingWebhook) {
      this.logger.warn(`Webhook already registered for URL: ${url}`);
      return;
    }

    this.webhooks.push({
      url,
      events,
      active: true
    });

    this.logger.info(`Registered webhook for URL: ${url}`);
  }

  unregisterWebhook(url: string) {
    const index = this.webhooks.findIndex(w => w.url === url);
    if (index === -1) {
      this.logger.warn(`No webhook found for URL: ${url}`);
      return;
    }

    this.webhooks.splice(index, 1);
    this.logger.info(`Unregistered webhook for URL: ${url}`);
  }

  getWebhooks(): Webhook[] {
    return [...this.webhooks];
  }
} 