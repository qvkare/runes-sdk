// Export all type definitions from other files
export * from './batch.types';
export * from './validation.types';
export * from './rpc.types';
export * from './history.types';

// Core SDK Configuration Types
export interface SDKConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  logger?: Logger;
}

// RPC Client Configuration
export interface RPCClientConfig {
  url: string;
  auth: {
    username: string;
    password: string;
  };
}

// Rune Operation Types
export interface CreateRuneParams {
  symbol: string;
  decimals: number;
  supply: number;
  limit?: number;
  description?: string;
  address: string;
}

export interface TransferRuneParams {
  runeId: string;
  amount: number;
  fromAddress: string;
  toAddress: string;
}

// Operation Results
export interface OrderResult {
  txId: string;
  success: boolean;
}

// Transaction History Types
export interface RuneHistory {
  transactions: Array<{
    txid: string;
    type: 'create' | 'transfer';
    timestamp: number;
    details: {
      runeId: string;
      amount: number;
      from: string;
      to: string;
    };
  }>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface BatchOperationResult {
  success: boolean;
  txId?: string;
  error?: string;
}

export interface BatchResult {
  operations: BatchOperationResult[];
  success: BatchOperationResult[];
  failed: BatchOperationResult[];
  totalOperations: number;
  completedOperations: number;
  failedOperations: number;
  pendingOperations: number;
}
