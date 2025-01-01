import { jest } from '@jest/globals';
import { RunesBatchService } from '../batch/runes.batch.service';
import { RpcClient } from '../../../types/rpc.types';
import { Logger } from '../../../types/logger.types';
import { createMockRpcClient, createMockLogger } from '../../../utils/test.utils';
import { Transaction } from '../../../types/transaction.types';

describe('RunesBatchService', () => {
  let service: RunesBatchService;
  let mockRpcClient: jest.Mocked<RpcClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockRpcClient = createMockRpcClient();
    mockLogger = createMockLogger();
    service = new RunesBatchService(mockRpcClient, mockLogger);
  });

  describe('processBatch', () => {
    it('should process batch successfully', async () => {
      const mockTransaction: Transaction = {
        id: 'test-id',
        txid: 'test-txid',
        type: 'transfer',
        blockHash: 'test-block-hash',
        blockHeight: 100,
        amount: '100',
        fee: '1000',
        confirmations: 1,
        timestamp: Date.now(),
        sender: 'test-sender',
        recipient: 'test-recipient',
        size: 100,
        time: Date.now(),
        version: 1
      };

      mockRpcClient.validateTransaction.mockResolvedValueOnce(true);
      mockRpcClient.sendTransaction.mockResolvedValueOnce('test-txid');

      const result = await service.processBatch([mockTransaction]);
      expect(result).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('Batch processed successfully');
    });

    it('should handle batch processing error', async () => {
      const mockTransaction: Transaction = {
        id: 'test-id',
        txid: 'test-txid',
        type: 'transfer',
        blockHash: 'test-block-hash',
        blockHeight: 100,
        amount: '100',
        fee: '1000',
        confirmations: 1,
        timestamp: Date.now(),
        sender: 'test-sender',
        recipient: 'test-recipient',
        size: 100,
        time: Date.now(),
        version: 1
      };

      const error = new Error('Batch processing failed');
      mockRpcClient.validateTransaction.mockRejectedValueOnce(error);

      await expect(service.processBatch([mockTransaction])).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error processing batch:', error);
    });
  });
});
