export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationOptions {
  strict?: boolean;
  allowZero?: boolean;
  maxDecimals?: number;
}

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

export interface RuneHistory {
  transactions: Array<{
    txid: string;
    type: 'create' | 'transfer';
    timestamp: number;
    details: {
      runeId: string;
      amount: number;
      from?: string;
      to: string;
    };
  }>;
  total: number;
}
