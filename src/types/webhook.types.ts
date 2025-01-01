import { Transaction } from './transaction.types';

export interface WebhookConfig {
  url: string;
  events: WebhookEventType[];
  retryCount: number;
  timeout: number;
}

export enum WebhookEventType {
  TRANSFER = 'TRANSFER',
  MINT = 'MINT',
  BURN = 'BURN',
  TRANSACTION_CONFIRMED = 'TRANSACTION_CONFIRMED'
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
