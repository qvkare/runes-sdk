import { jest } from '@jest/globals';
import { RunesHistoryService } from '../runes.history.service';
import { RunesValidator } from '../../utils/runes.validator';
import { RPCClient } from '../../utils/rpc.client';
import { Logger } from '../../utils/logger';
import { RuneHistory } from '../../types/history.types';
import {
  createMockLogger,
  createMockRpcClient,
  createMockValidator,
} from '../../utils/__tests__/test.utils';

describe('RunesHistoryService', () => {
  let service: RunesHistoryService;
  let mockLogger: jest.Mocked<Logger>;
  let mockRpcClient: jest.Mocked<RPCClient>;
  let mockValidator: jest.Mocked<RunesValidator>;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockRpcClient = createMockRpcClient();
    mockValidator = createMockValidator();

    service = new RunesHistoryService(mockRpcClient, mockValidator, mockLogger);
  });

  describe('getRuneHistory', () => {
    const runeId = 'rune123';
    const mockHistory: RuneHistory = {
      transactions: [
        {
          txid: 'tx1',
          type: 'transfer',
          timestamp: Date.now(),
          details: {
            runeId: 'rune123',
            amount: 100,
            from: 'addr1',
            to: 'addr2',
          },
        },
      ],
      total: 1,
    };

    it('should get rune history successfully', async () => {
      mockValidator.validateRuneId.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockRpcClient.call.mockResolvedValueOnce(mockHistory);

      const result = await service.getRuneHistory(runeId);

      expect(result).toEqual(mockHistory);
      expect(mockValidator.validateRuneId).toHaveBeenCalledWith(runeId);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getrunehistory', [runeId]);
    });

    it('should throw error if validation fails', async () => {
      mockValidator.validateRuneId.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid rune ID'],
      });

      await expect(service.getRuneHistory(runeId)).rejects.toThrow('Invalid rune ID');
      expect(mockRpcClient.call).not.toHaveBeenCalled();
    });

    it('should handle RPC errors', async () => {
      mockValidator.validateRuneId.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(service.getRuneHistory(runeId)).rejects.toThrow('RPC error');
    });
  });

  describe('getAddressHistory', () => {
    const address = 'addr123';
    const mockHistory: RuneHistory = {
      transactions: [
        {
          txid: 'tx1',
          type: 'transfer',
          timestamp: Date.now(),
          details: {
            runeId: 'rune123',
            amount: 100,
            from: 'addr1',
            to: 'addr2',
          },
        },
      ],
      total: 1,
    };

    it('should get address history successfully', async () => {
      mockValidator.validateAddress.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockRpcClient.call.mockResolvedValueOnce(mockHistory);

      const result = await service.getAddressHistory(address);

      expect(result).toEqual(mockHistory);
      expect(mockValidator.validateAddress).toHaveBeenCalledWith(address);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getaddresshistory', [address]);
    });

    it('should throw error if validation fails', async () => {
      mockValidator.validateAddress.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid address'],
      });

      await expect(service.getAddressHistory(address)).rejects.toThrow('Invalid address');
      expect(mockRpcClient.call).not.toHaveBeenCalled();
    });

    it('should handle RPC errors', async () => {
      mockValidator.validateAddress.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(service.getAddressHistory(address)).rejects.toThrow('RPC error');
    });
  });
});
