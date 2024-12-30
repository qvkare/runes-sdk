import { jest } from '@jest/globals';
import { RunesLiquidityService } from '../runes.liquidity.service';
import { RPCClient } from '../../utils/rpc.client';
import { RunesValidator } from '../../utils/runes.validator';
import { Logger } from '../../utils/logger';
import { LiquidityPool, ProviderLiquidity } from '../../types';

describe('RunesLiquidityService', () => {
  let service: RunesLiquidityService;
  let mockRpcClient: jest.Mocked<RPCClient>;
  let mockValidator: jest.Mocked<RunesValidator>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockRpcClient = {
      call: jest.fn(),
    } as any;

    mockValidator = {
      validateRuneSymbol: jest.fn(),
      validateRuneAmount: jest.fn(),
      validateAddress: jest.fn(),
    } as any;

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as any;

    service = new RunesLiquidityService(mockRpcClient, mockValidator, mockLogger);
  });

  describe('addLiquidity', () => {
    const runeId = 'rune123';
    const amount = 100;

    it('should add liquidity successfully', async () => {
      mockValidator.validateRuneSymbol.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockValidator.validateRuneAmount.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockRpcClient.call.mockResolvedValueOnce(true);

      const result = await service.addLiquidity(runeId, amount);

      expect(result).toBe(true);
      expect(mockRpcClient.call).toHaveBeenCalledWith('addliquidity', [runeId, amount]);
    });

    it('should throw error for invalid rune symbol', async () => {
      mockValidator.validateRuneSymbol.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid rune symbol'],
      });

      await expect(service.addLiquidity(runeId, amount)).rejects.toThrow('Invalid rune symbol');
    });

    it('should throw error for invalid amount', async () => {
      mockValidator.validateRuneSymbol.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockValidator.validateRuneAmount.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid amount'],
      });

      await expect(service.addLiquidity(runeId, amount)).rejects.toThrow('Invalid amount');
    });
  });

  describe('removeLiquidity', () => {
    const runeId = 'rune123';
    const amount = 100;

    it('should remove liquidity successfully', async () => {
      mockValidator.validateRuneSymbol.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockValidator.validateRuneAmount.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockRpcClient.call.mockResolvedValueOnce(true);

      const result = await service.removeLiquidity(runeId, amount);

      expect(result).toBe(true);
      expect(mockRpcClient.call).toHaveBeenCalledWith('removeliquidity', [runeId, amount]);
    });

    it('should throw error for invalid rune symbol', async () => {
      mockValidator.validateRuneSymbol.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid rune symbol'],
      });

      await expect(service.removeLiquidity(runeId, amount)).rejects.toThrow('Invalid rune symbol');
    });

    it('should throw error for invalid amount', async () => {
      mockValidator.validateRuneSymbol.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockValidator.validateRuneAmount.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid amount'],
      });

      await expect(service.removeLiquidity(runeId, amount)).rejects.toThrow('Invalid amount');
    });
  });

  describe('getLiquidityPool', () => {
    const runeId = 'rune123';
    const mockPool: LiquidityPool = {
      runeId: 'rune123',
      totalLiquidity: 1000,
      price: 1.5,
      volume24h: 5000,
    };

    it('should get liquidity pool info successfully', async () => {
      mockValidator.validateRuneSymbol.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockRpcClient.call.mockResolvedValueOnce(mockPool);

      const result = await service.getLiquidityPool(runeId);

      expect(result).toEqual(mockPool);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getliquiditypool', [runeId]);
    });

    it('should throw error for invalid rune symbol', async () => {
      mockValidator.validateRuneSymbol.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid rune symbol'],
      });

      await expect(service.getLiquidityPool(runeId)).rejects.toThrow('Invalid rune symbol');
    });
  });

  describe('getProviderLiquidity', () => {
    const runeId = 'rune123';
    const address = 'addr123';
    const mockProviderLiquidity: ProviderLiquidity = {
      runeId: 'rune123',
      address: 'addr123',
      amount: 500,
      share: 0.25,
    };

    it('should get provider liquidity successfully', async () => {
      mockValidator.validateRuneSymbol.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockValidator.validateAddress.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockRpcClient.call.mockResolvedValueOnce(mockProviderLiquidity);

      const result = await service.getProviderLiquidity(runeId, address);

      expect(result).toEqual(mockProviderLiquidity);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getproviderliquidity', [runeId, address]);
    });

    it('should throw error for invalid rune symbol', async () => {
      mockValidator.validateRuneSymbol.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid rune symbol'],
      });

      await expect(service.getProviderLiquidity(runeId, address)).rejects.toThrow(
        'Invalid rune symbol'
      );
    });

    it('should throw error for invalid address', async () => {
      mockValidator.validateRuneSymbol.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockValidator.validateAddress.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid address'],
      });

      await expect(service.getProviderLiquidity(runeId, address)).rejects.toThrow(
        'Invalid address'
      );
    });
  });
});
