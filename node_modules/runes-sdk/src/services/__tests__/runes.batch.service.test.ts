import { RunesBatchService } from '../runes.batch.service';
import { Logger } from '../../utils/logger';
import { RPCClient } from '../../utils/rpc.client';
import { createMockLogger, createMockRpcClient } from '../../utils/__tests__/test.utils';
import { RunesValidator } from '../../utils/runes.validator';

interface Transfer {
  runeId: string;
  amount: string;
  fromAddress: string;
  toAddress: string;
}

describe('RunesBatchService', () => {
  let batchService: RunesBatchService;
  let mockRpcClient: jest.Mocked<RPCClient>;
  let mockLogger: jest.Mocked<Logger>;
  let mockValidator: jest.Mocked<RunesValidator>;

  beforeEach(() => {
    mockLogger = createMockLogger('RunesBatchService');
    mockRpcClient = createMockRpcClient(mockLogger);
    mockValidator = {
      validateTransfer: jest.fn(),
      validateTransaction: jest.fn(),
      validateAddress: jest.fn(),
      validateRuneId: jest.fn(),
      isValidAmount: jest.fn(),
      logger: mockLogger,
      rpcClient: mockRpcClient
    } as unknown as jest.Mocked<RunesValidator>;
    batchService = new RunesBatchService(mockRpcClient, mockLogger, mockValidator);
  });

  describe('submitBatch', () => {
    const transfers: Transfer[] = [
      {
        runeId: 'rune123',
        amount: '100',
        fromAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        toAddress: '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX'
      },
      {
        runeId: 'rune456',
        amount: '200',
        fromAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        toAddress: '1HLoD9E4SDFFPDiYfNYnkBLQ85Y51J3Zb1'
      }
    ];

    it('should submit batch successfully', async () => {
      mockValidator.validateTransfer.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: []
      });

      const mockResponse = {
        result: {
          batchId: 'batch123',
          status: 'submitted',
          timestamp: '2024-01-01T00:00:00Z'
        }
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await batchService.submitBatch(transfers);
      expect(result).toEqual(mockResponse.result);
      expect(mockValidator.validateTransfer).toHaveBeenCalledTimes(2);
      expect(mockRpcClient.call).toHaveBeenCalledWith('submitbatch', [transfers]);
    });

    it('should handle validation errors', async () => {
      mockValidator.validateTransfer.mockResolvedValue({
        isValid: false,
        errors: ['Invalid amount'],
        warnings: []
      });

      await expect(batchService.submitBatch(transfers)).rejects.toThrow('Invalid amount');
      expect(mockRpcClient.call).not.toHaveBeenCalled();
    });

    it('should handle RPC errors', async () => {
      mockValidator.validateTransfer.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: []
      });

      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(batchService.submitBatch(transfers)).rejects.toThrow('Failed to submit batch');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle invalid RPC response in submitBatch', async () => {
      mockValidator.validateTransfer.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: []
      });

      mockRpcClient.call.mockResolvedValueOnce({ result: null });

      await expect(batchService.submitBatch(transfers)).rejects.toThrow('Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Invalid response from RPC');
    });
  });

  describe('getBatchStatus', () => {
    it('should get batch status successfully', async () => {
      const batchId = 'batch123';
      const mockResponse = {
        result: {
          batchId: 'batch123',
          status: 'completed',
          timestamp: '2024-01-01T00:00:00Z'
        }
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await batchService.getBatchStatus(batchId);
      expect(result).toEqual(mockResponse.result);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getbatchstatus', [batchId]);
    });

    it('should handle RPC errors', async () => {
      const batchId = 'invalid_batch';
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(batchService.getBatchStatus(batchId)).rejects.toThrow('Failed to get batch status');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle invalid RPC response in getBatchStatus', async () => {
      const batchId = 'batch123';
      mockRpcClient.call.mockResolvedValueOnce({ result: null });

      await expect(batchService.getBatchStatus(batchId)).rejects.toThrow('Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Invalid response from RPC');
    });
  });
}); 