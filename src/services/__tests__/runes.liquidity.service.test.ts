import { RunesLiquidityService } from '../runes.liquidity.service';
import { RPCClient } from '../../utils/rpc.client';
import { Logger } from '../../utils/logger';
import { createMockLogger } from '../../utils/test.utils';

jest.mock('../../utils/rpc.client');
jest.mock('../../utils/logger');

describe('RunesLiquidityService', () => {
  let liquidityService: RunesLiquidityService;
  let mockRpcClient: jest.Mocked<RPCClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockRpcClient = new RPCClient('url', 'user', 'pass', undefined) as jest.Mocked<RPCClient>;
    mockLogger = createMockLogger() as jest.Mocked<Logger>;
    liquidityService = new RunesLiquidityService(mockRpcClient, mockLogger);
    jest.clearAllMocks();
  });

  describe('createPool', () => {
    const poolParams = {
      runeId: 'rune123',
      initialLiquidity: 1000,
      initialPrice: 1.5
    };

    it('should create pool successfully', async () => {
      const mockResponse = {
        poolId: 'pool123',
        runeId: 'rune123',
        liquidity: 1000,
        price: 1.5,
        volume24h: 0,
        timestamp: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await liquidityService.createPool(poolParams);
      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('createpool', [poolParams]);
    });

    it('should handle invalid RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce(null);

      await expect(liquidityService.createPool(poolParams))
        .rejects
        .toThrow('Failed to create pool: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create pool: Invalid response from RPC');
    });

    it('should handle RPC error', async () => {
      const error = new Error('Network error');
      mockRpcClient.call.mockRejectedValueOnce(error);

      await expect(liquidityService.createPool(poolParams))
        .rejects
        .toThrow('Failed to create pool: Network error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create pool: Network error');
    });

    it('should handle unknown RPC error', async () => {
      mockRpcClient.call.mockRejectedValueOnce('Unknown error');

      await expect(liquidityService.createPool(poolParams))
        .rejects
        .toThrow('Failed to create pool: Unknown error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create pool: Unknown error');
    });

    it('should handle RPC response without poolId', async () => {
      const invalidResponse = {
        runeId: 'rune123',
        liquidity: 1000,
        price: 1.5,
        volume24h: 0,
        timestamp: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(invalidResponse);

      await expect(liquidityService.createPool(poolParams))
        .rejects
        .toThrow('Failed to create pool: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create pool: Invalid response from RPC');
    });
  });

  describe('addLiquidity', () => {
    const liquidityParams = {
      poolId: 'pool123',
      amount: 500
    };

    it('should add liquidity successfully', async () => {
      const mockResponse = {
        poolId: 'pool123',
        runeId: 'rune123',
        liquidity: 1500,
        price: 1.6,
        volume24h: 1000,
        timestamp: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await liquidityService.addLiquidity(liquidityParams);
      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('addliquidity', [liquidityParams]);
    });

    it('should handle invalid RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce(null);

      await expect(liquidityService.addLiquidity(liquidityParams))
        .rejects
        .toThrow('Failed to add liquidity: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to add liquidity: Invalid response from RPC');
    });

    it('should handle RPC error', async () => {
      const error = new Error('Network error');
      mockRpcClient.call.mockRejectedValueOnce(error);

      await expect(liquidityService.addLiquidity(liquidityParams))
        .rejects
        .toThrow('Failed to add liquidity: Network error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to add liquidity: Network error');
    });

    it('should handle unknown RPC error', async () => {
      mockRpcClient.call.mockRejectedValueOnce('Unknown error');

      await expect(liquidityService.addLiquidity(liquidityParams))
        .rejects
        .toThrow('Failed to add liquidity: Unknown error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to add liquidity: Unknown error');
    });

    it('should handle RPC response without poolId', async () => {
      const invalidResponse = {
        runeId: 'rune123',
        liquidity: 1500,
        price: 1.6,
        volume24h: 1000,
        timestamp: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(invalidResponse);

      await expect(liquidityService.addLiquidity(liquidityParams))
        .rejects
        .toThrow('Failed to add liquidity: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to add liquidity: Invalid response from RPC');
    });
  });

  describe('getPool', () => {
    const poolId = 'pool123';

    it('should get pool successfully', async () => {
      const mockResponse = {
        poolId: 'pool123',
        runeId: 'rune123',
        liquidity: 1500,
        price: 1.6,
        volume24h: 1000,
        timestamp: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await liquidityService.getPool(poolId);
      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getpool', [poolId]);
    });

    it('should handle invalid RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce(null);

      await expect(liquidityService.getPool(poolId))
        .rejects
        .toThrow('Failed to get pool: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get pool: Invalid response from RPC');
    });

    it('should handle RPC error', async () => {
      const error = new Error('Network error');
      mockRpcClient.call.mockRejectedValueOnce(error);

      await expect(liquidityService.getPool(poolId))
        .rejects
        .toThrow('Failed to get pool: Network error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get pool: Network error');
    });

    it('should handle unknown RPC error', async () => {
      mockRpcClient.call.mockRejectedValueOnce('Unknown error');

      await expect(liquidityService.getPool(poolId))
        .rejects
        .toThrow('Failed to get pool: Unknown error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get pool: Unknown error');
    });

    it('should handle RPC response without poolId', async () => {
      const invalidResponse = {
        runeId: 'rune123',
        liquidity: 1500,
        price: 1.6,
        volume24h: 1000,
        timestamp: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(invalidResponse);

      await expect(liquidityService.getPool(poolId))
        .rejects
        .toThrow('Failed to get pool: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get pool: Invalid response from RPC');
    });
  });
}); 