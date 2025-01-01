export interface BatchTransfer {
  sender: string;
  recipient: string;
  amount: string;
  fee?: string;
  metadata?: Record<string, any>;
}

export interface BatchProcessResult {
  success: boolean;
  validTransfers: BatchTransfer[];
  invalidTransfers: BatchTransfer[];
  errors: string[];
}
