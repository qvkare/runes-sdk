import { Logger } from '../../types/logger.types';
import { Transaction, BatchTransactionResult } from '../../types/transaction.types';
import { TransactionService } from './transaction.service';

interface BatchResult {
  successful: BatchTransactionResult[];
  failed: Error[];
}

export class BatchHandler {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly logger: Logger
  ) {}

  async processBatch(transactions: Transaction[]): Promise<BatchResult> {
    const successful: BatchTransactionResult[] = [];
    const failed: Error[] = [];

    this.logger.info('Processing batch of', transactions.length, 'transactions');

    for (const tx of transactions) {
      try {
        const result = await this.transactionService.processTransaction(tx);
        successful.push(result);
        this.logger.info('Transaction processed successfully:', tx.txid);
      } catch (error) {
        failed.push(error as Error);
        this.logger.error('Failed to process transaction:', error);
      }
    }

    if (failed.length > 0) {
      this.logger.warn(`Failed to process ${failed.length} transactions`);
    }

    return { successful, failed };
  }
} 