import { RunesPerformanceService } from '../runes.performance.service';
import { RPCClient } from '../../utils/rpc.client';
import { jest } from '@jest/globals';
import { PerformanceMetrics, TransactionMetrics } from '../../types/metrics.types';

jest.mock('../../utils/rpc.client');

describe('RunesPerformanceService', () => {
  let performanceService: RunesPerformanceService;
  let mockRpcClient: jest.Mocked<RPCClient>;

  beforeEach(() => {
    mockRpcClient = new RPCClient({
      baseUrl: 'http://localhost:8332',
    }) as jest.Mocked<RPCClient>;
    performanceService = new RunesPerformanceService(mockRpcClient);
  });

  describe('getPerformanceMetrics', () => {
    it('should get performance metrics', async () => {
      const mockResponse: PerformanceMetrics = {
        transactionsPerSecond: 100,
        averageResponseTime: 150,
        successRate: 0.98,
        errorRate: 0.02,
        totalTransactions: 1000,
      };

      mockRpcClient.call.mockResolvedValue(mockResponse);

      const result = await performanceService.getPerformanceMetrics();

      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getperformancemetrics', []);
    });

    it('should handle performance metrics errors', async () => {
      mockRpcClient.call.mockRejectedValue(new Error('Failed to get metrics'));

      await expect(performanceService.getPerformanceMetrics()).rejects.toThrow('Failed to get metrics');
    });
  });

  describe('getTransactionMetrics', () => {
    it('should get transaction metrics', async () => {
      const mockResponse: TransactionMetrics = {
        totalCount: 1000,
        successCount: 980,
        failureCount: 20,
        averageAmount: '1000',
        totalVolume: '1000000',
      };

      mockRpcClient.call.mockResolvedValue(mockResponse);

      const result = await performanceService.getTransactionMetrics();

      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('gettransactionmetrics', []);
    });

    it('should handle transaction metrics errors', async () => {
      mockRpcClient.call.mockRejectedValue(new Error('Failed to get transaction metrics'));

      await expect(performanceService.getTransactionMetrics()).rejects.toThrow('Failed to get transaction metrics');
    });
  });
}); 