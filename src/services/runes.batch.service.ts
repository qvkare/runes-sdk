import { RunesService } from './runes.service';
import { RunesTransfer } from '../types/runes.types';
import { Logger } from '../utils/logger';

interface BatchServiceOptions {
  maxBatchSize?: number;
  maxRetries?: number;
  retryDelay?: number;
}

interface BatchResult {
  successful: RunesTransfer[];
  failed: RunesTransfer[];
  totalProcessed: number;
  successRate: number;
}

export class RunesBatchService extends Logger {
  private readonly runesService: RunesService;
  private readonly maxBatchSize: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(runesService: RunesService, options?: BatchServiceOptions) {
    super('RunesBatchService');
    this.runesService = runesService;
    this.maxBatchSize = options?.maxBatchSize || 100;
    this.maxRetries = options?.maxRetries || 3;
    this.retryDelay = options?.retryDelay || 1000;
  }

  async processBatch(transfers: RunesTransfer[]): Promise<BatchResult> {
    if (!transfers.length) {
      return {
        successful: [],
        failed: [],
        totalProcessed: 0,
        successRate: 0
      };
    }

    const batches = this.splitIntoBatches(transfers);
    const results = await Promise.all(
      batches.map(batch => this.processBatchWithRetry(batch))
    );

    const successful = results.flatMap(r => r.successful);
    const failed = results.flatMap(r => r.failed);
    const totalProcessed = successful.length + failed.length;
    const successRate = totalProcessed > 0 ? successful.length / totalProcessed : 0;

    return {
      successful,
      failed,
      totalProcessed,
      successRate
    };
  }

  private splitIntoBatches(transfers: RunesTransfer[]): RunesTransfer[][] {
    const batches: RunesTransfer[][] = [];
    for (let i = 0; i < transfers.length; i += this.maxBatchSize) {
      batches.push(transfers.slice(i, i + this.maxBatchSize));
    }
    return batches;
  }

  private async processBatchWithRetry(batch: RunesTransfer[]): Promise<BatchResult> {
    let retries = 0;
    let lastError: Error | null = null;

    while (retries < this.maxRetries) {
      try {
        return await this.processOneBatch(batch);
      } catch (error) {
        lastError = error as Error;
        retries++;
        if (retries < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    }

    this.error(`Failed to process batch after ${this.maxRetries} retries:`, lastError);
    return {
      successful: [],
      failed: batch,
      totalProcessed: batch.length,
      successRate: 0
    };
  }

  private async processOneBatch(batch: RunesTransfer[]): Promise<BatchResult> {
    const successful: RunesTransfer[] = [];
    const failed: RunesTransfer[] = [];

    await Promise.all(
      batch.map(async transfer => {
        try {
          const validationResult = await this.runesService.validateTransfer(
            transfer.from,
            transfer.to,
            BigInt(transfer.amount)
          );
          
          if (validationResult.isValid) {
            successful.push(transfer);
          } else {
            this.error(`Validation failed for transfer ${transfer.txid}:`, validationResult.errors);
            failed.push(transfer);
          }
        } catch (error) {
          this.error(`Failed to process transfer ${transfer.txid}:`, error);
          failed.push(transfer);
        }
      })
    );

    const totalProcessed = successful.length + failed.length;
    const successRate = totalProcessed > 0 ? successful.length / totalProcessed : 0;

    return {
      successful,
      failed,
      totalProcessed,
      successRate
    };
  }
} 