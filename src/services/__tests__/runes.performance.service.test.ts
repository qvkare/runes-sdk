import { RunesPerformanceService } from '../runes.performance.service';
import { RPCClient } from '../../utils/rpc.client';
import { Logger } from '../../utils/logger';
import { createMockLogger } from '../../utils/test.utils';

jest.mock('../../utils/rpc.client');
jest.mock('../../utils/logger');

describe('RunesPerformanceService', () => {
  let performanceService: RunesPerformanceService;
  let mockRpcClient: jest.Mocked<RPCClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockRpcClient = new RPCClient('url', 'user', 'pass', undefined) as jest.Mocked<RPCClient>;
    mockLogger = createMockLogger() as jest.Mocked<Logger>;
    performanceService = new RunesPerformanceService(mockRpcClient, mockLogger);
    jest.clearAllMocks();
  });

  describe('getMetrics', () => {
    it('should get metrics successfully', async () => {
      const mockResponse = {
        avgBlockTime: 10,
        transactions: 1000,
        volume: '1000.00',
        timestamp: 1234567890,
        tps: 100,
        blockHeight: 12345,
        memoryUsage: 1024,
        cpuUsage: 50
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await performanceService.getMetrics();
      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getmetrics', []);
    });

    it('should handle invalid RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce(null);

      await expect(performanceService.getMetrics())
        .rejects
        .toThrow('Failed to get metrics: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get metrics: Invalid response from RPC');
    });

    it('should handle missing required fields', async () => {
      const invalidResponse = {
        transactions: 1000,
        volume: '1000.00'
      };

      mockRpcClient.call.mockResolvedValueOnce(invalidResponse);

      await expect(performanceService.getMetrics())
        .rejects
        .toThrow('Failed to get metrics: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get metrics: Invalid response from RPC');
    });

    it('should handle invalid avgBlockTime type', async () => {
      const invalidResponse = {
        avgBlockTime: '10',
        transactions: 1000,
        volume: '1000.00',
        timestamp: 1234567890,
        tps: 100,
        blockHeight: 12345,
        memoryUsage: 1024,
        cpuUsage: 50
      };

      mockRpcClient.call.mockResolvedValueOnce(invalidResponse);

      await expect(performanceService.getMetrics())
        .rejects
        .toThrow('Failed to get metrics: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get metrics: Invalid response from RPC');
    });

    it('should handle RPC error', async () => {
      const error = new Error('Network error');
      mockRpcClient.call.mockRejectedValueOnce(error);

      await expect(performanceService.getMetrics())
        .rejects
        .toThrow('Failed to get metrics: Network error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get metrics: Network error');
    });

    it('should handle unknown RPC error', async () => {
      mockRpcClient.call.mockRejectedValueOnce('Unknown error');

      await expect(performanceService.getMetrics())
        .rejects
        .toThrow('Failed to get metrics: Unknown error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get metrics: Unknown error');
    });
  });

  describe('getRunePerformance', () => {
    const runeId = 'rune123';

    it('should get rune performance successfully', async () => {
      const mockResponse = {
        throughput: 1000,
        latency: 50,
        errorRate: 0.1,
        lastUpdated: 1234567890,
        successRate: 99.9,
        avgResponseTime: 45,
        peakThroughput: 1500
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await performanceService.getRunePerformance(runeId);
      expect(result).toEqual({
        runeId,
        ...mockResponse
      });
      expect(mockRpcClient.call).toHaveBeenCalledWith('getruneperformance', [runeId]);
    });

    it('should handle missing runeId', async () => {
      await expect(performanceService.getRunePerformance(''))
        .rejects
        .toThrow('Failed to get rune performance: Rune ID is required');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get rune performance: Rune ID is required');
    });

    it('should handle invalid RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce(null);

      await expect(performanceService.getRunePerformance(runeId))
        .rejects
        .toThrow('Failed to get rune performance: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get rune performance: Invalid response from RPC');
    });

    it('should handle invalid throughput type', async () => {
      const invalidResponse = {
        throughput: '1000',
        latency: 50,
        errorRate: 0.1,
        lastUpdated: 1234567890,
        successRate: 99.9,
        avgResponseTime: 45,
        peakThroughput: 1500
      };

      mockRpcClient.call.mockResolvedValueOnce(invalidResponse);

      await expect(performanceService.getRunePerformance(runeId))
        .rejects
        .toThrow('Failed to get rune performance: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get rune performance: Invalid response from RPC');
    });

    it('should calculate missing fields', async () => {
      const mockResponse = {
        throughput: 1000,
        latency: 50,
        errorRate: 0.1,
        lastUpdated: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await performanceService.getRunePerformance(runeId);
      expect(result).toEqual({
        runeId,
        ...mockResponse,
        successRate: 99.9,
        avgResponseTime: 50,
        peakThroughput: 1000
      });
    });

    it('should handle RPC error', async () => {
      const error = new Error('Network error');
      mockRpcClient.call.mockRejectedValueOnce(error);

      await expect(performanceService.getRunePerformance(runeId))
        .rejects
        .toThrow('Failed to get rune performance: Network error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get rune performance: Network error');
    });

    it('should handle unknown RPC error', async () => {
      mockRpcClient.call.mockRejectedValueOnce('Unknown error');

      await expect(performanceService.getRunePerformance(runeId))
        .rejects
        .toThrow('Failed to get rune performance: Unknown error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get rune performance: Unknown error');
    });

    it('should handle missing required fields', async () => {
      const invalidResponse = {
        latency: 50,
        errorRate: 0.1,
        lastUpdated: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(invalidResponse);

      await expect(performanceService.getRunePerformance(runeId))
        .rejects
        .toThrow('Failed to get rune performance: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get rune performance: Invalid response from RPC');
    });
  });
}); 