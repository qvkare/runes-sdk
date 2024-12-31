export interface BatchResult {
  successful: number;
  failed: number;
  transactions: Array<{
    txid?: string;
    error?: string;
    status?: string;
  }>;
}

export interface BatchTransfer {
  from: string;
  to: string;
  amount: bigint;
}

export interface BatchResultItem {
  index: number;
  success: boolean;
  txid?: string;
  error?: string;
}

export interface BatchProcessResult {
  txid: string;
  status: string;
  results: BatchResultItem[];
} 