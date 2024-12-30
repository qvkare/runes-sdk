import { jest } from '@jest/globals';
import { RunesBatchService } from '../runes.batch.service';
import { RunesValidator } from '../../utils/runes.validator';
import { RPCClient } from '../../utils/rpc.client';
import { Logger } from '../../utils/logger';
import { BatchOperation, BatchResult } from '../../types/batch.types';
import {
  createMockLogger,
  createMockRpcClient,
  createMockValidator,
} from '../../utils/__tests__/test.utils';

describe('RunesBatchService', () => {
  let service: RunesBatchService;
  let mockLogger: jest.Mocked<Logger>;
  let mockRpcClient: jest.Mocked<RPCClient>;
  let mockValidator: jest.Mocked<RunesValidator>;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockRpcClient = createMockRpcClient();
    mockValidator = createMockValidator();

    service = new RunesBatchService(mockRpcClient, mockValidator, mockLogger);
  });

  describe('executeBatch', () => {
    const mockOperations: BatchOperation[] = [
      {
        id: '1',
        type: 'create',
        params: {
          symbol: 'TEST',
          decimals: 8,
          supply: 1000000,
          limit: 2000000,
        },
        status: 'pending',
        timestamp: Date.now(),
      },
      {
        id: '2',
        type: 'transfer',
        params: {
          runeId: 'rune123',
          amount: 100,
          fromAddress: 'addr1',
          toAddress: 'addr2',
        },
        status: 'pending',
        timestamp: Date.now(),
      },
    ];

    it('should execute batch operations successfully', async () => {
      mockValidator.validateBatchOperation.mockResolvedValue({ isValid: true, errors: [] });
      mockRpcClient.call.mockResolvedValue({ txId: 'txid123' });

      const result = await service.executeBatch(mockOperations);

      expect(result).toBeDefined();
      expect(mockValidator.validateBatchOperation).toHaveBeenCalledTimes(mockOperations.length);
      expect(mockRpcClient.call).toHaveBeenCalledTimes(mockOperations.length);
    });

    it('should throw error if validation fails', async () => {
      mockValidator.validateBatchOperation.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid operation'],
      });

      await expect(service.executeBatch(mockOperations)).rejects.toThrow('Invalid operation');
    });

    it('should throw error if batch is empty', async () => {
      await expect(service.executeBatch([])).rejects.toThrow('Batch operations cannot be empty');
    });

    it('should handle RPC errors', async () => {
      mockValidator.validateBatchOperation.mockResolvedValue({ isValid: true, errors: [] });
      mockRpcClient.call.mockRejectedValue(new Error('RPC error'));

      await expect(service.executeBatch(mockOperations)).rejects.toThrow('RPC error');
    });
  });

  describe('getBatchStatus', () => {
    const batchId = 'batch123';
    const mockBatchResult: BatchResult = {
      operations: [
        {
          id: '1',
          type: 'create',
          params: {
            symbol: 'TEST',
            decimals: 8,
            supply: 1000000,
            limit: 2000000,
          },
          status: 'completed',
          timestamp: Date.now(),
        },
      ],
      totalOperations: 1,
      completedOperations: 1,
      failedOperations: 0,
      pendingOperations: 0,
    };

    it('should get batch status successfully', async () => {
      mockRpcClient.call.mockResolvedValue(mockBatchResult);

      const result = await service.getBatchStatus(batchId);

      expect(result).toEqual(mockBatchResult);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getbatchstatus', [batchId]);
    });

    it('should handle RPC errors', async () => {
      mockRpcClient.call.mockRejectedValue(new Error('Invalid batch ID'));

      await expect(service.getBatchStatus(batchId)).rejects.toThrow('Invalid batch ID');
    });
  });
});
