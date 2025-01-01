import { jest } from '@jest/globals';
import { RunesApi } from '../../api/runes.api';
import { RpcClient } from '../../types/rpc.types';
import { Logger } from '../../types/logger.types';
import { createMockRpcClient, createMockLogger } from '../../utils/test.utils';
import { Transaction } from '../../types/transaction.types';

describe('RunesApi', () => {
  let api: RunesApi;
  let mockRpcClient: jest.Mocked<RpcClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockRpcClient = createMockRpcClient();
    mockLogger = createMockLogger();
    api = new RunesApi(mockRpcClient, mockLogger);
  });

  describe('validateTransaction', () => {
    it('should validate transaction successfully', async () => {
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

      const result = await api.validateTransaction(mockTransaction.txid);
      expect(result).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('Transaction validated successfully:', mockTransaction.txid);
    });

    it('should handle validation error', async () => {
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

      const error = new Error('Validation failed');
      mockRpcClient.validateTransaction.mockRejectedValueOnce(error);

      await expect(api.validateTransaction(mockTransaction.txid)).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error validating transaction:', error);
    });
  });
});
