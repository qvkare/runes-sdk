import { BatchOperation } from '../../types/batch.types';
import { BatchService } from '../batch';

describe('BatchService', () => {
  let service: BatchService;
  let mockValidator: jest.Mock;
  let mockProcessor: jest.Mock;

  beforeEach(() => {
    mockValidator = jest.fn();
    mockProcessor = jest.fn();
    service = new BatchService(mockValidator, mockProcessor);
  });

  describe('validateOperation', () => {
    it('should validate create operation', async () => {
      const operation: BatchOperation = {
        type: 'create',
        params: {
          symbol: 'TEST',
          decimals: 8,
          supply: 1000,
          limit: 1000,
        },
      };

      mockValidator.mockResolvedValueOnce(true);
      const result = await service.validateOperation(operation);
      expect(result).toBe(true);
      expect(mockValidator).toHaveBeenCalledWith(operation);
    });

    it('should validate transfer operation', async () => {
      const operation: BatchOperation = {
        type: 'transfer',
        params: {
          runeId: 'rune123',
          amount: 100,
          fromAddress: 'addr1',
          toAddress: 'addr2',
        },
      };

      mockValidator.mockResolvedValueOnce(true);
      const result = await service.validateOperation(operation);
      expect(result).toBe(true);
      expect(mockValidator).toHaveBeenCalledWith(operation);
    });

    it('should reject invalid operation', async () => {
      const operation: BatchOperation = {
        type: 'create',
        params: {},
      };

      mockValidator.mockResolvedValueOnce(false);
      const result = await service.validateOperation(operation);
      expect(result).toBe(false);
    });
  });

  describe('processBatch', () => {
    it('should process batch operations', async () => {
      const operations: BatchOperation[] = [
        {
          type: 'create',
          params: {
            symbol: 'TEST1',
            decimals: 8,
            supply: 1000,
            limit: 1000,
          },
        },
        {
          type: 'transfer',
          params: {
            runeId: 'rune123',
            amount: 100,
            fromAddress: 'addr1',
            toAddress: 'addr2',
          },
        },
      ];

      mockValidator.mockResolvedValue(true);
      mockProcessor.mockResolvedValue({ success: true, txId: 'txid123' });

      const results = await service.processBatch(operations);
      expect(results).toHaveLength(2);
      expect(mockProcessor).toHaveBeenCalledTimes(2);
    });

    it('should handle empty batch', async () => {
      await expect(service.processBatch([])).rejects.toThrow('Batch operations cannot be empty');
    });

    it('should handle processing errors', async () => {
      const operations: BatchOperation[] = [
        {
          type: 'create',
          params: {
            symbol: 'TEST',
            decimals: 8,
            supply: 1000,
            limit: 1000,
          },
        },
      ];

      mockValidator.mockResolvedValue(true);
      mockProcessor.mockRejectedValue(new Error('Processing failed'));

      const results = await service.processBatch(operations);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBeDefined();
    });
  });
});
