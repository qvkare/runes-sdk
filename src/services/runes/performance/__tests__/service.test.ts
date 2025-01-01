import { jest } from '@jest/globals';
import { RunesPerformanceService } from '../service';
import { createMockLogger, createMockRpcClient } from '../../../../utils/test.utils';
import { RuneMetrics } from '../../../../types/rune.types';

describe('RunesPerformanceService', () => {
  let service: RunesPerformanceService;
  let mockRpcClient: jest.Mocked<any>;
  let mockLogger: jest.Mocked<any>;

  beforeEach(() => {
    mockRpcClient = createMockRpcClient();
    mockLogger = createMockLogger();
    service = new RunesPerformanceService(mockRpcClient, mockLogger);
  });

  describe('getPerformanceMetrics', () => {
    it('should get performance metrics successfully', async () => {
      const runeId = 'rune1';
      const mockMetrics: RuneMetrics = {
        runeId: 'rune1',
        totalTransfers: 100,
        uniqueHolders: 50,
        averageTransferAmount: '150',
        largestTransfer: '1000',
        lastTransferTimestamp: Date.now(),
      };

      mockRpcClient.call.mockResolvedValue(mockMetrics);

      const result = await service.getPerformanceMetrics(runeId);
      expect(result).toEqual(mockMetrics);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getruneperformancemetrics', [runeId]);
    });

    it('should handle error when getting metrics', async () => {
      const runeId = 'rune1';

      mockRpcClient.call.mockRejectedValue(new Error('Failed to get metrics'));

      await expect(service.getPerformanceMetrics(runeId)).rejects.toThrow('Failed to get performance metrics');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get performance metrics:', expect.any(Error));
    });
  });

  describe('getNetworkStats', () => {
    it('should get network stats successfully', async () => {
      const mockStats = {
        totalNodes: 100,
        activeNodes: 95,
        averageLatency: 50,
        networkThroughput: 1000,
        lastUpdated: Date.now(),
      };

      mockRpcClient.call.mockResolvedValue(mockStats);

      const result = await service.getNetworkStats();
      expect(result).toEqual(mockStats);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getnetworkstats');
    });

    it('should handle error when getting network stats', async () => {
      mockRpcClient.call.mockRejectedValue(new Error('Failed to get stats'));

      await expect(service.getNetworkStats()).rejects.toThrow('Failed to get network stats');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get network stats:', expect.any(Error));
    });
  });

  describe('getSystemResources', () => {
    it('should get system resources successfully', async () => {
      const mockResources = {
        cpuUsage: 50,
        memoryUsage: 70,
        diskUsage: 60,
        networkBandwidth: 1000,
        lastUpdated: Date.now(),
      };

      mockRpcClient.call.mockResolvedValue(mockResources);

      const result = await service.getSystemResources();
      expect(result).toEqual(mockResources);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getsystemresources');
    });

    it('should handle error when getting system resources', async () => {
      mockRpcClient.call.mockRejectedValue(new Error('Failed to get resources'));

      await expect(service.getSystemResources()).rejects.toThrow('Failed to get system resources');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get system resources:', expect.any(Error));
    });
  });
});
