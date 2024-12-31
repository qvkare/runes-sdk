import { RuneTransaction } from './rune.types';

export type WebhookEventType = 'deposit' | 'withdrawal' | 'transfer';
export type WebhookEventStatus = 'pending' | 'confirmed' | 'failed';

export interface WebhookEvent {
  type: WebhookEventType;
  status: WebhookEventStatus;
  transaction: {
    txid: string;
    from: string;
    to: string;
    amount: number;
    confirmations: number;
    timestamp: number;
    runeTransaction?: RuneTransaction;
  };
  metadata: {
    userId?: string;
    exchangeOrderId?: string;
    riskScore?: number;
  };
}

export interface WebhookConfig {
  url: string;
  secret: string;
  events: WebhookEventType[];
  retryCount?: number;
  timeoutMs?: number;
}

export interface WebhookDeliveryResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  timestamp: number;
  retryCount: number;
} 