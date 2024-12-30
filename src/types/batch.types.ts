import { CreateRuneParams, TransferRuneParams } from './index';

export interface BatchOperation {
  id: string;
  type: 'create' | 'transfer';
  params: CreateRuneParams | TransferRuneParams;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
}

export interface BatchResult {
  operations: BatchOperation[];
  success: BatchOperation[];
  failed: BatchOperation[];
  totalOperations: number;
  completedOperations: number;
  failedOperations: number;
  pendingOperations: number;
}

export interface BatchValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface BatchOperationResult {
  success: boolean;
  txId?: string;
  error?: string;
}
