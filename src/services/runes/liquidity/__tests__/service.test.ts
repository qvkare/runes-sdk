import { jest } from '@jest/globals';
import { RunesLiquidityService } from '../service';
import { createMockLogger, createMockRpcClient } from '../../../../utils/test.utils';

describe('RunesLiquidityService', () => {
  let service: RunesLiquidityService;
  let mockRpcClient: jest.Mocked<any>;
  let mockLogger: jest.Mocked<any>;

  beforeEach(() => {
    mockRpcClient = createMockRpcClient();
    mockLogger = createMockLogger();
    service = new RunesLiquidityService(mockRpcClient, mockLogger);
  });

  describe('createPool', () => {
    it('should create pool successfully', async () => {
      const runeId = 'rune1';
      const initialLiquidity = '1000';

      mockRpcClient.call.mockResolvedValue(true);

      const result = await service.createPool(runeId, initialLiquidity);
      expect(result).toBe(true);
      expect(mockRpcClient.call).toHaveBeenCalledWith('createrunepool', [runeId, initialLiquidity]);
    });

    it('should handle error when creating pool', async () => {
      const runeId = 'rune1';
      const initialLiquidity = '1000';

      mockRpcClient.call.mockRejectedValue(new Error('Failed to create pool'));

      await expect(service.createPool(runeId, initialLiquidity)).rejects.toThrow(
        'Failed to create rune pool'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create rune pool:',
        expect.any(Error)
      );
    });
  });

  describe('addLiquidity', () => {
    it('should add liquidity successfully', async () => {
      const runeId = 'rune1';
      const amount = '500';

      mockRpcClient.call.mockResolvedValue(true);

      const result = await service.addLiquidity(runeId, amount);
      expect(result).toBe(true);
      expect(mockRpcClient.call).toHaveBeenCalledWith('addruneliquidity', [runeId, amount]);
    });

    it('should handle error when adding liquidity', async () => {
      const runeId = 'rune1';
      const amount = '500';

      mockRpcClient.call.mockRejectedValue(new Error('Failed to add liquidity'));

      await expect(service.addLiquidity(runeId, amount)).rejects.toThrow(
        'Failed to add rune liquidity'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to add rune liquidity:',
        expect.any(Error)
      );
    });
  });

  describe('getPool', () => {
    it('should get pool info successfully', async () => {
      const runeId = 'rune1';
      const mockPool = {
        runeId: 'rune1',
        liquidity: '1500',
        lastUpdated: Date.now(),
      };

      mockRpcClient.call.mockResolvedValue(mockPool);

      const result = await service.getPool(runeId);
      expect(result).toEqual(mockPool);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getrunepool', [runeId]);
    });

    it('should handle error when getting pool info', async () => {
      const runeId = 'rune1';

      mockRpcClient.call.mockRejectedValue(new Error('Failed to get pool'));

      await expect(service.getPool(runeId)).rejects.toThrow('Failed to get rune pool');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get rune pool:', expect.any(Error));
    });
  });
});
