import { Logger } from '../../types/logger.types';
import { WebhookConfig, WebhookEventType, WebhookNotificationResult } from '../../types/webhook.types';

export class WebhookService {
    private webhooks: Map<string, WebhookConfig> = new Map();

    constructor(
        private readonly logger: Logger,
        private readonly defaultConfig: WebhookConfig
    ) {}

    registerWebhook(webhookId: string, config: Partial<WebhookConfig>): void {
        const fullConfig = {
            ...this.defaultConfig,
            ...config
        };
        this.webhooks.set(webhookId, fullConfig);
        this.logger.info('Webhook registered successfully:', webhookId);
    }

    async notify(eventType: WebhookEventType, data: any): Promise<WebhookNotificationResult[]> {
        const results: WebhookNotificationResult[] = [];

        for (const [webhookId, config] of this.webhooks.entries()) {
            if (!config.events.includes(eventType)) {
                continue;
            }

            try {
                const response = await fetch(config.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        eventType,
                        data,
                        timestamp: Date.now()
                    })
                });

                const success = response.ok;
                const error = success ? undefined : `HTTP ${response.status}`;

                results.push({
                    webhookId,
                    success,
                    statusCode: response.status,
                    error
                });

                if (success) {
                    this.logger.info('Webhook notification sent successfully:', webhookId);
                } else {
                    this.logger.error('Webhook notification failed:', webhookId);
                }
            } catch (error: unknown) {
                this.logger.error('Error sending webhook notification:', error);
                results.push({
                    webhookId,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        return results;
    }
}
