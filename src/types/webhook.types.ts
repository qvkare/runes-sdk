import { Transaction } from './transaction.types';

export interface WebhookConfig {
  url: string;
  events: WebhookEventType[];
  timeout?: number;
}

export enum WebhookEventType {
  TRANSFER = 'transfer',
  MINT = 'mint',
  BURN = 'burn',
  TRANSACTION_CONFIRMED = 'transaction_confirmed'
}

export interface WebhookEvent {
  type: WebhookEventType;
  data: any;
  timestamp: number;
}

export interface WebhookResult {
  success: boolean;
  error?: string;
}

export interface WebhookNotificationResult {
  webhookId: string;
  success: boolean;
  statusCode?: number;
  error?: string;
}
