import { BitcoinRpcConfig } from './bitcoin';

export interface RunesConfig {
  bitcoinRpc: BitcoinRpcConfig;
  network: 'mainnet' | 'testnet' | 'regtest';
  maxRetries?: number;
  retryDelay?: number;
  monitoringPort?: number;
  monitoring?: {
    enabled: boolean;
    port?: number;
    logLevel?: 'error' | 'warn' | 'info' | 'debug';
    metricsPath?: string;
    healthCheckPath?: string;
  };
}

export interface RunesTransaction {
  txid: string;
  symbol: string;
  type: 'mint' | 'transfer';
  amount: number;
  from?: string;
  to: string;
  confirmations: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface RunesBalance {
  symbol: string;
  amount: number;
  address: string;
  lastUpdated: number;
}

export interface RunesMetadata {
  symbol: string;
  supply: number;
  limit?: number;
  creator: string;
  createdAt: number;
  transactions: number;
  holders: number;
}

export interface RunesError extends Error {
  code: string;
  details?: any;
}

export interface RuneUtxo {
  txid: string;
  vout: number;
  address: string;
  amount: number;
  symbol: string;
  scriptPubKey: string;
  confirmations: number;
}

export interface RuneTransactionData {
  version: number;
  inputs: Array<{
    txid: string;
    vout: number;
    scriptSig: string;
    sequence: number;
  }>;
  outputs: Array<{
    value: number;
    scriptPubKey: string;
    runeData?: {
      symbol: string;
      amount: number;
      type: 'mint' | 'transfer';
    };
  }>;
  locktime: number;
}

export interface RuneValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  details: {
    symbol?: string;
    amount?: number;
    type?: 'mint' | 'transfer';
    inputTotal?: number;
    outputTotal?: number;
  };
}
