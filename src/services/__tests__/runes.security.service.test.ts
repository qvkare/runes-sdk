import { jest } from '@jest/globals';
import { RunesSecurityService } from '../runes.security.service';
import { RunesValidator } from '../../utils/runes.validator';
import { RPCClient } from '../../utils/rpc.client';
import { Logger } from '../../utils/logger';
import { BitcoinCoreService } from '../bitcoin-core.service';
import { CreateRuneParams, TransferRuneParams } from '../../types/validation.types';
import {
  createMockLogger,
  createMockRpcClient,
  createMockValidator,
  createMockBitcoinCore,
} from '../../utils/__tests__/test.utils';

describe('RunesSecurityService', () => {
  let service: RunesSecurityService;
  let mockLogger: jest.Mocked<Logger>;
  let mockRpcClient: jest.Mocked<RPCClient>;
  let mockValidator: jest.Mocked<RunesValidator>;
  let mockBitcoinCore: jest.Mocked<BitcoinCoreService>;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockRpcClient = createMockRpcClient();
    mockValidator = createMockValidator();
    mockBitcoinCore = createMockBitcoinCore();

    service = new RunesSecurityService(mockRpcClient, mockValidator, mockBitcoinCore, mockLogger);
  });

  describe('validateRuneCreation', () => {
    const createParams: CreateRuneParams = {
      symbol: 'TEST',
      decimals: 8,
      supply: 1000000,
      limit: 2000000,
      description: 'Test rune',
      address: 'addr123',
    };

    it('should validate rune creation successfully', async () => {
      mockValidator.validateRuneSymbol.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockValidator.validateRuneDecimals.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockValidator.validateRuneSupply.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockValidator.validateRuneLimit.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockValidator.validateAddress.mockResolvedValueOnce({ isValid: true, errors: [] });

      const result = await service.validateRuneCreation(createParams);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(mockValidator.validateRuneSymbol).toHaveBeenCalledWith(createParams.symbol);
      expect(mockValidator.validateRuneDecimals).toHaveBeenCalledWith(createParams.decimals);
      expect(mockValidator.validateRuneSupply).toHaveBeenCalledWith(createParams.supply);
      expect(mockValidator.validateRuneLimit).toHaveBeenCalledWith(createParams.limit);
      expect(mockValidator.validateAddress).toHaveBeenCalledWith(createParams.address);
    });

    it('should return validation errors', async () => {
      mockValidator.validateRuneSymbol.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid symbol'],
      });
      mockValidator.validateRuneDecimals.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockValidator.validateRuneSupply.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockValidator.validateRuneLimit.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockValidator.validateAddress.mockResolvedValueOnce({ isValid: true, errors: [] });

      const result = await service.validateRuneCreation(createParams);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid symbol');
    });
  });

  describe('validateRuneTransfer', () => {
    const transferParams: TransferRuneParams = {
      runeId: 'rune123',
      amount: 100,
      fromAddress: 'addr1',
      toAddress: 'addr2',
    };

    it('should validate rune transfer successfully', async () => {
      mockValidator.validateRuneId.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockValidator.validateRuneAmount.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockValidator.validateAddress.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockValidator.validateAddress.mockResolvedValueOnce({ isValid: true, errors: [] });

      const result = await service.validateRuneTransfer(transferParams);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(mockValidator.validateRuneId).toHaveBeenCalledWith(transferParams.runeId);
      expect(mockValidator.validateRuneAmount).toHaveBeenCalledWith(transferParams.amount);
      expect(mockValidator.validateAddress).toHaveBeenCalledWith(transferParams.fromAddress);
      expect(mockValidator.validateAddress).toHaveBeenCalledWith(transferParams.toAddress);
    });

    it('should return validation errors', async () => {
      mockValidator.validateRuneId.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid rune ID'],
      });
      mockValidator.validateRuneAmount.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockValidator.validateAddress.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockValidator.validateAddress.mockResolvedValueOnce({ isValid: true, errors: [] });

      const result = await service.validateRuneTransfer(transferParams);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid rune ID');
    });
  });
});
