import { jest } from '@jest/globals';
import { RunesHistoryService } from '../service';
import { RpcClient } from '../../../../types/rpc.types';
import { Logger } from '../../../../types/logger.types';
import { createMockRpcClient, createMockLogger } from '../../../../utils/test.utils';
import { Transaction } from '../../../../types/transaction.types';

describe('RunesHistoryService', () => {
  let service: RunesHistoryService;
  let mockRpcClient: jest.Mocked<RpcClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockRpcClient = createMockRpcClient();
    mockLogger = createMockLogger();
    service = new RunesHistoryService(mockRpcClient, mockLogger);
  });

  describe('getTransactionDetails', () => {
    it('should get transaction details successfully', async () => {
      const txId = 'test-txid';
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

      mockRpcClient.getTransaction.mockResolvedValueOnce(mockTransaction);

      const result = await service.getTransactionDetails(txId);
      expect(result).toEqual(mockTransaction);
      expect(mockRpcClient.getTransaction).toHaveBeenCalledWith(txId);
    });

    it('should handle error when getting transaction details', async () => {
      const txId = 'test-txid';
      const error = new Error('Failed to get transaction details');
      mockRpcClient.getTransaction.mockRejectedValueOnce(error);

      await expect(service.getTransactionDetails(txId)).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get transaction details:', error);
    });
  });
});
