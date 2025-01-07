import { Logger } from '../../types/logger.types';

export class WebhookService {
    private webhooks: Map<string, string> = new Map();

    constructor(private readonly logger: Logger) {}

    registerWebhook(webhookId: string, url: string): void {
        this.webhooks.set(webhookId, url);
        this.logger.info(`Registered webhook: ${webhookId} -> ${url}`);
    }

    unregisterWebhook(webhookId: string): void {
        if (this.webhooks.has(webhookId)) {
            this.webhooks.delete(webhookId);
            this.logger.info(`Unregistered webhook: ${webhookId}`);
        }
    }

    async notifyWebhook(webhookId: string, data: any): Promise<boolean> {
        try {
            const url = this.webhooks.get(webhookId);
            if (!url) {
                this.logger.warn(`Webhook not found: ${webhookId}`);
                return false;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.logger.info(`Successfully notified webhook: ${webhookId}`);
            return true;
        } catch (error) {
            this.logger.error('Webhook notification failed:', new Error(`Failed to notify webhook: ${webhookId}`));
            return false;
        }
    }
}
