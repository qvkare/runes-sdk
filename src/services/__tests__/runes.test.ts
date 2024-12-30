import { jest } from '@jest/globals';
import { RunesService } from '../runes.service';
import { RunesBatchService } from '../runes.batch.service';
import { RunesHistoryService } from '../runes.history.service';
import { RunesSecurityService } from '../runes.security.service';
import { RunesValidator } from '../../utils/runes.validator';
import { Logger } from '../../utils/logger';
import { RPCClient } from '../../utils/rpc.client';
import { CreateRuneParams, TransferRuneParams, RuneHistory } from '../../types';
import {
  createMockLogger,
  createMockRpcClient,
  createMockValidator,
  createMockBatchService,
  createMockHistoryService,
  createMockSecurityService,
} from '../../utils/__tests__/test.utils';

describe('RunesService', () => {
  let service: RunesService;
  let mockLogger: jest.Mocked<Logger>;
  let mockRpcClient: jest.Mocked<RPCClient>;
  let mockValidator: jest.Mocked<RunesValidator>;
  let mockBatchService: jest.Mocked<RunesBatchService>;
  let mockHistoryService: jest.Mocked<RunesHistoryService>;
  let mockSecurityService: jest.Mocked<RunesSecurityService>;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockRpcClient = createMockRpcClient();
    mockValidator = createMockValidator();
    mockBatchService = createMockBatchService();
    mockHistoryService = createMockHistoryService();
    mockSecurityService = createMockSecurityService();

    service = new RunesService(
      mockRpcClient,
      mockValidator,
      mockBatchService,
      mockHistoryService,
      mockSecurityService,
      mockLogger
    );
  });

  describe('createRune', () => {
    const createParams: CreateRuneParams = {
      symbol: 'TEST',
      decimals: 8,
      supply: 1000000,
      limit: 2000000,
      description: 'Test rune',
      address: 'addr123',
    };

    it('should create a rune successfully', async () => {
      mockSecurityService.validateRuneCreation.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockBatchService.createRune.mockResolvedValueOnce({ txId: 'txid123' });

      const result = await service.createRune(createParams);

      expect(result).toEqual({ txId: 'txid123' });
      expect(mockSecurityService.validateRuneCreation).toHaveBeenCalledWith(createParams);
      expect(mockBatchService.createRune).toHaveBeenCalledWith(createParams);
    });

    it('should throw error if validation fails', async () => {
      mockSecurityService.validateRuneCreation.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid symbol'],
      });

      await expect(service.createRune(createParams)).rejects.toThrow('Invalid symbol');
      expect(mockBatchService.createRune).not.toHaveBeenCalled();
    });

    it('should handle batch service errors', async () => {
      mockSecurityService.validateRuneCreation.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockBatchService.createRune.mockRejectedValueOnce(new Error('Creation failed'));

      await expect(service.createRune(createParams)).rejects.toThrow('Creation failed');
    });
  });

  describe('transferRune', () => {
    const transferParams: TransferRuneParams = {
      runeId: 'rune123',
      amount: 100,
      fromAddress: 'addr1',
      toAddress: 'addr2',
    };

    it('should transfer rune successfully', async () => {
      mockSecurityService.validateRuneTransfer.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockBatchService.transferRune.mockResolvedValueOnce({ txId: 'txid123' });

      const result = await service.transferRune(transferParams);

      expect(result).toEqual({ txId: 'txid123' });
      expect(mockSecurityService.validateRuneTransfer).toHaveBeenCalledWith(transferParams);
      expect(mockBatchService.transferRune).toHaveBeenCalledWith(transferParams);
    });

    it('should throw error if validation fails', async () => {
      mockSecurityService.validateRuneTransfer.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid amount'],
      });

      await expect(service.transferRune(transferParams)).rejects.toThrow('Invalid amount');
      expect(mockBatchService.transferRune).not.toHaveBeenCalled();
    });

    it('should handle batch service errors', async () => {
      mockSecurityService.validateRuneTransfer.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockBatchService.transferRune.mockRejectedValueOnce(new Error('Transfer failed'));

      await expect(service.transferRune(transferParams)).rejects.toThrow('Transfer failed');
    });
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
      mockHistoryService.getRuneHistory.mockResolvedValueOnce(mockHistory);

      const result = await service.getRuneHistory(runeId);

      expect(result).toEqual(mockHistory);
      expect(mockValidator.validateRuneId).toHaveBeenCalledWith(runeId);
      expect(mockHistoryService.getRuneHistory).toHaveBeenCalledWith(runeId);
    });

    it('should throw error if validation fails', async () => {
      mockValidator.validateRuneId.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid rune ID'],
      });

      await expect(service.getRuneHistory(runeId)).rejects.toThrow('Invalid rune ID');
      expect(mockHistoryService.getRuneHistory).not.toHaveBeenCalled();
    });
  });

  describe('getRuneBalance', () => {
    const runeId = 'rune123';
    const address = 'addr123';

    it('should get rune balance successfully', async () => {
      mockValidator.validateRuneId.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockValidator.validateAddress.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockBatchService.getRuneBalance.mockResolvedValueOnce(1000);

      const result = await service.getRuneBalance(runeId, address);

      expect(result).toBe(1000);
      expect(mockValidator.validateRuneId).toHaveBeenCalledWith(runeId);
      expect(mockValidator.validateAddress).toHaveBeenCalledWith(address);
      expect(mockBatchService.getRuneBalance).toHaveBeenCalledWith(runeId, address);
    });

    it('should throw error if validation fails', async () => {
      mockValidator.validateRuneId.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid rune ID'],
      });

      await expect(service.getRuneBalance(runeId, address)).rejects.toThrow('Invalid rune ID');
      expect(mockBatchService.getRuneBalance).not.toHaveBeenCalled();
    });

    it('should handle batch service errors', async () => {
      mockValidator.validateRuneId.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockValidator.validateAddress.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockBatchService.getRuneBalance.mockRejectedValueOnce(new Error('Balance failed'));

      await expect(service.getRuneBalance(runeId, address)).rejects.toThrow('Balance failed');
    });
  });
});
