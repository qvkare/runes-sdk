import { Logger } from './utils/logger';

export interface RPCClientConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  maxRetries?: number;
  logger?: Logger;
}

export interface RPCResponse<T> {
  result: T;
  error: {
    code: number;
    message: string;
  } | null;
  id: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface BatchOperation {
  type: 'create' | 'transfer';
  symbol?: string;
  amount: number;
  recipient: string;
}

export interface BatchResult {
  success: {
    type: string;
    symbol?: string;
    txId: string;
  }[];
  failed: {
    type: string;
    symbol?: string;
    error: string;
  }[];
}

export interface LiquidityPool {
  runeId: string;
  totalLiquidity: number;
  price: number;
  volume24h: number;
}

export interface ProviderLiquidity {
  runeId: string;
  address: string;
  amount: number;
  share: number;
}

export interface RuneHistory {
  transactions: {
    txid: string;
    type: 'create' | 'transfer';
    timestamp: number;
    details: {
      runeId: string;
      amount: number;
      from?: string;
      to?: string;
    };
  }[];
}
