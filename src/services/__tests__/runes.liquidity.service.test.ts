import { RunesLiquidityService } from '../runes.liquidity.service';
import { RPCClient } from '../../utils/rpc.client';
import { Logger } from '../../utils/logger';
import { createMockLogger, createMockRpcClient } from '../../utils/__tests__/test.utils';

describe('RunesLiquidityService', () => {
  let liquidityService: RunesLiquidityService;
  let mockRpcClient: jest.Mocked<RPCClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = createMockLogger('RunesLiquidityService');
    mockRpcClient = createMockRpcClient(mockLogger);
    liquidityService = new RunesLiquidityService(mockRpcClient, mockLogger);
  });

  describe('getPoolInfo', () => {
    const runeId = 'rune123';

    it('should get pool info successfully', async () => {
      const mockResponse = {
        result: {
          runeId: 'rune123',
          totalLiquidity: 1000,
          price: 1.5,
          volume24h: 5000
        }
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await liquidityService.getPoolInfo(runeId);
      expect(result).toEqual(mockResponse.result);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getpoolinfo', [runeId]);
    });

    it('should handle RPC errors', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(liquidityService.getPoolInfo(runeId)).rejects.toThrow('Failed to get pool info');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle invalid RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce({ result: null });

      await expect(liquidityService.getPoolInfo(runeId)).rejects.toThrow('Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Invalid response from RPC');
    });
  });

  describe('addLiquidity', () => {
    const runeId = 'rune123';
    const amount = '100';

    it('should add liquidity successfully', async () => {
      const mockResponse = {
        result: {
          txId: 'tx123'
        }
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await liquidityService.addLiquidity(runeId, amount);
      expect(result).toEqual(mockResponse.result);
      expect(mockRpcClient.call).toHaveBeenCalledWith('addliquidity', [runeId, amount]);
    });

    it('should handle RPC errors', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(liquidityService.addLiquidity(runeId, amount)).rejects.toThrow('Failed to add liquidity');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle invalid RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce({ result: null });

      await expect(liquidityService.addLiquidity(runeId, amount)).rejects.toThrow('Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Invalid response from RPC');
    });
  });
}); 