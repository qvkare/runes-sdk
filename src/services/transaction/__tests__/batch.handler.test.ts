import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { BatchHandler } from '../batch.handler';
import { TransactionService } from '../transaction.service';
import { Logger } from '../../../types/logger.types';
import { Transaction, TransactionResult } from '../../../types/transaction.types';

describe('BatchHandler', () => {
  let batchHandler: BatchHandler;
  let mockTransactionService: jest.Mocked<TransactionService>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockTransactionService = {
      processTransaction: jest.fn()
    } as any;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    } as any;

    batchHandler = new BatchHandler(mockTransactionService, mockLogger);
  });

  describe('processBatch', () => {
    it('should process multiple transactions successfully', async () => {
      const transactions: Transaction[] = [
        {
          id: 'tx1',
          type: 'mint',
          data: {},
          timestamp: Date.now()
        },
        {
          id: 'tx2',
          type: 'transfer',
          data: {},
          timestamp: Date.now()
        }
      ];

      const mockResults: TransactionResult[] = [
        { txid: 'tx1', success: true },
        { txid: 'tx2', success: true }
      ];

      mockTransactionService.processTransaction
        .mockResolvedValueOnce(mockResults[0])
        .mockResolvedValueOnce(mockResults[1]);

      const result = await batchHandler.processBatch(transactions);

      expect(result.successful).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
      expect(mockLogger.info).toHaveBeenCalledWith('Processing batch of', transactions.length, 'transactions');
    });

    it('should handle failed transactions', async () => {
      const transactions: Transaction[] = [
        {
          id: 'tx1',
          type: 'mint',
          data: {},
          timestamp: Date.now()
        }
      ];

      mockTransactionService.processTransaction.mockRejectedValueOnce(
        new Error('Processing failed')
      );

      const result = await batchHandler.processBatch(transactions);

      expect(result.successful).toHaveLength(0);
      expect(result.failed).toHaveLength(1);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should group transactions by type', async () => {
      const transactions: Transaction[] = [
        {
          id: 'tx1',
          type: 'mint',
          data: {},
          timestamp: Date.now()
        },
        {
          id: 'tx2',
          type: 'mint',
          data: {},
          timestamp: Date.now()
        }
      ];

      mockTransactionService.processTransaction
        .mockResolvedValueOnce({ txid: 'tx1', success: true })
        .mockResolvedValueOnce({ txid: 'tx2', success: true });

      await batchHandler.processBatch(transactions);

      expect(mockTransactionService.processTransaction).toHaveBeenCalledTimes(2);
    });
  });
}); 