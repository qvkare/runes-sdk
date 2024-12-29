import { RPCClient } from '../../utils/rpc.client';
import { RunesPerformanceService } from '../runes.performance.service';
import { Logger } from '../../utils/logger';
import { RunePerformanceStats } from '../../types';
import { createMockLogger, createMockRpcClient, createMockRpcResponse } from '../../utils/__tests__/test.utils';

describe('RunesPerformanceService', () => {
  let runesPerformanceService: RunesPerformanceService;
  let mockRpcClient: jest.Mocked<RPCClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = createMockLogger('RunesPerformanceService');
    mockRpcClient = createMockRpcClient(mockLogger);
    runesPerformanceService = new RunesPerformanceService(mockRpcClient, mockLogger);
  });

  describe('getStats', () => {
    it('should fetch performance stats successfully', async () => {
      const runeId = 'test_rune';
      const mockStats: RunePerformanceStats = {
        volume24h: 1000000,
        price24h: 1.5,
        transactions24h: 500,
        holders: 1000,
        marketCap: 10000000
      };

      mockRpcClient.call.mockResolvedValueOnce(createMockRpcResponse(mockStats));

      const result = await runesPerformanceService.getStats(runeId);
      expect(result).toEqual(mockStats);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getrunestats', [runeId]);
    });

    it('should handle RPC errors', async () => {
      const runeId = 'test_rune';
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(runesPerformanceService.getStats(runeId)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle empty response', async () => {
      const runeId = 'test_rune';
      mockRpcClient.call.mockResolvedValueOnce(createMockRpcResponse(null));

      await expect(runesPerformanceService.getStats(runeId)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should log info message before fetching stats', async () => {
      const runeId = 'test_rune';
      const mockStats: RunePerformanceStats = {
        volume24h: 1000000,
        price24h: 1.5,
        transactions24h: 500,
        holders: 1000,
        marketCap: 10000000
      };

      mockRpcClient.call.mockResolvedValueOnce(createMockRpcResponse(mockStats));

      await runesPerformanceService.getStats(runeId);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining(runeId)
      );
    });

    it('should handle specific error message', async () => {
      const runeId = 'test_rune';
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(runesPerformanceService.getStats(runeId)).rejects.toThrow('Failed to get rune stats');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to get rune stats:',
        expect.any(Error)
      );
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should fetch performance metrics successfully', async () => {
      const runeId = 'test_rune';
      const mockMetrics = {
        price: '1.5',
        volume24h: '1000000',
        marketCap: '10000000',
        priceChange24h: '5.2'
      };

      mockRpcClient.call.mockResolvedValueOnce(createMockRpcResponse(mockMetrics));

      const result = await runesPerformanceService.getPerformanceMetrics(runeId);
      expect(result).toEqual(mockMetrics);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getperformancemetrics', [runeId]);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle RPC errors', async () => {
      const runeId = 'test_rune';
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(runesPerformanceService.getPerformanceMetrics(runeId)).rejects.toThrow('Failed to get performance metrics');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle empty response', async () => {
      const runeId = 'test_rune';
      mockRpcClient.call.mockResolvedValueOnce(createMockRpcResponse(null));

      await expect(runesPerformanceService.getPerformanceMetrics(runeId)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
}); 