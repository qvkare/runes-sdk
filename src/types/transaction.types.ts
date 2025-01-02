export interface Transaction {
  id: string;
  type: string;
  txid: string;
  blockhash?: string;
  blockHash: string;
  blockHeight: number;
  blocktime?: number;
  amount: string;
  fee: string;
  confirmations: number;
  timestamp: number;
  sender: string;
  recipient: string;
  size: number;
  time: number;
  token?: string;
  price?: string;
  version: number;
  status?: string;
}

export enum TransactionType {
  TRANSFER = 'transfer',
  ORDER = 'order',
  LIQUIDITY = 'liquidity',
  BATCH = 'batch',
}

export interface TransactionValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
}

export interface ValidationError {
  code: string;
  message: string;
}
