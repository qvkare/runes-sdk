import { RuneService } from './rune.service';
import { BatchTransferResult } from '../types/rune.types';
import { Logger } from '../utils/logger';

export class RuneBatchService extends Logger {
  constructor(private readonly runeService: RuneService) {
    super('RuneBatchService');
  }

  async processBatchTransfers(transfers: { from: string; to: string; amount: bigint }[]): Promise<BatchTransferResult[]> {
    try {
      const results: BatchTransferResult[] = [];

      for (const transfer of transfers) {
        try {
          const txid = await this.runeService.createTransfer(
            transfer.from,
            transfer.to,
            transfer.amount
          );

          results.push({
            id: txid,
            txid: txid,
            status: 'success'
          });
        } catch (error) {
          results.push({
            id: '',
            txid: '',
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return results;
    } catch (error) {
      this.error('Failed to process batch transfers:', error);
      throw error;
    }
  }
} 