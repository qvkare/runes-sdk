import { RunesService } from '../runes.service';
import { RPCClient } from '../../utils/rpc.client';
import { Logger } from '../../utils/logger';
import { RunesValidator } from '../../utils/runes.validator';
import { createMockLogger, createMockRpcClient } from '../../utils/__tests__/test.utils';

describe('RunesService', () => {
  let runesService: RunesService;
  let mockRpcClient: jest.Mocked<RPCClient>;
  let mockLogger: jest.Mocked<Logger>;
  let mockValidator: jest.Mocked<RunesValidator>;

  beforeEach(() => {
    mockLogger = createMockLogger('RunesService');
    mockRpcClient = createMockRpcClient(mockLogger);
    mockValidator = {
      validateTransfer: jest.fn(),
      validateAddress: jest.fn(),
      validateRuneId: jest.fn(),
      isValidAmount: jest.fn(),
      logger: mockLogger,
      rpcClient: mockRpcClient
    } as unknown as jest.Mocked<RunesValidator>;
    runesService = new RunesService(mockRpcClient, mockLogger, mockValidator);
  });

  describe('getRuneInfo', () => {
    const runeId = 'rune123';

    it('should get rune info successfully', async () => {
      const mockStats = {
        volume24h: 1000,
        price24h: 1.5,
        transactions24h: 100,
        holders: 50,
        marketCap: 1500000
      };

      const mockResponse = {
        result: mockStats
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await runesService.getRuneInfo(runeId);
      expect(result).toEqual(mockStats);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getruneinfo', [runeId]);
    });

    it('should handle RPC errors', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(runesService.getRuneInfo(runeId)).rejects.toThrow('Failed to get rune info');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('transferRune', () => {
    const transfer = {
      runeId: 'rune123',
      amount: '100',
      fromAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      toAddress: '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX'
    };

    it('should transfer rune successfully', async () => {
      mockValidator.validateTransfer.mockResolvedValueOnce({
        isValid: true,
        errors: [],
        warnings: []
      });

      const mockResponse = {
        result: {
          txId: 'tx123'
        }
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await runesService.transferRune(transfer);
      expect(result).toEqual(mockResponse.result);
      expect(mockValidator.validateTransfer).toHaveBeenCalledWith(transfer);
      expect(mockRpcClient.call).toHaveBeenCalledWith('transferrune', [
        transfer.runeId,
        transfer.amount,
        transfer.fromAddress,
        transfer.toAddress
      ]);
    });

    it('should handle validation errors', async () => {
      mockValidator.validateTransfer.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid amount'],
        warnings: []
      });

      await expect(runesService.transferRune(transfer)).rejects.toThrow('Invalid amount');
      expect(mockRpcClient.call).not.toHaveBeenCalled();
    });

    it('should handle RPC errors', async () => {
      mockValidator.validateTransfer.mockResolvedValueOnce({
        isValid: true,
        errors: [],
        warnings: []
      });

      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(runesService.transferRune(transfer)).rejects.toThrow('Failed to transfer rune');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
}); 