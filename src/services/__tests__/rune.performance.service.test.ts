import { RunePerformanceService } from '../rune.performance.service';
import { RPCClient } from '../../utils/rpc.client';

jest.mock('../../utils/rpc.client');

describe('RunePerformanceService', () => {
  let performanceService: RunePerformanceService;
  let mockRpcClient: jest.Mocked<RPCClient>;

  beforeEach(() => {
    mockRpcClient = new RPCClient({
      rpcUrl: 'http://localhost:8332',
      username: 'test',
      password: 'test',
      network: 'regtest'
    }) as jest.Mocked<RPCClient>;

    performanceService = new RunePerformanceService(mockRpcClient);
  });

  describe('caching', () => {
    it('should cache and retrieve data', async () => {
      const testData = { test: 'data' };
      await performanceService.cacheResponse('test-key', testData);
      const cached = performanceService.getCachedResponse('test-key');
      expect(cached).toEqual(testData);
    });

    it('should return null for non-existent cache key', () => {
      const cached = performanceService.getCachedResponse('non-existent');
      expect(cached).toBeNull();
    });
  });

  describe('metrics', () => {
    it('should record and retrieve metrics', async () => {
      mockRpcClient.call.mockResolvedValueOnce({ connections: 10 });

      performanceService.recordMetrics('test-op', 100, true);
      const metrics = await performanceService.getMetrics('test-op');

      expect(metrics.averageResponseTime).toBe(100);
      expect(metrics.successRate).toBeGreaterThan(0);
      expect(metrics.activeConnections).toBe(10);
    });

    it('should handle empty metrics', async () => {
      mockRpcClient.call.mockResolvedValueOnce({ connections: 5 });

      const metrics = await performanceService.getMetrics('non-existent');

      expect(metrics.averageResponseTime).toBe(0);
      expect(metrics.successRate).toBe(0);
      expect(metrics.activeConnections).toBe(5);
    });
  });

  describe('batch optimization', () => {
    it('should optimize batches correctly', async () => {
      const transfers = Array(150).fill({
        txid: 'tx1',
        amount: '1000'
      });

      const batches = await performanceService.optimizeBatches(transfers);
      expect(batches.length).toBeGreaterThan(1);
      expect(batches[0].length).toBeLessThanOrEqual(100);
    });
  });

  describe('connection optimization', () => {
    it('should optimize connections', async () => {
      mockRpcClient.call
        .mockResolvedValueOnce({ connections: 20 })
        .mockResolvedValueOnce(true);

      await performanceService.optimizeConnections(10);

      expect(mockRpcClient.call).toHaveBeenCalledWith('setmaxconnections', [10]);
    });

    it('should handle optimization errors', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('Failed'));

      await expect(performanceService.optimizeConnections(10))
        .rejects.toThrow('Failed to optimize connections');
    });
  });

  describe('batch stats', () => {
    it('should track batch statistics', () => {
      performanceService.recordMetrics('batch_processing', 100, true);
      performanceService.recordMetrics('batch_processing', 150, false);
      performanceService.recordMetrics('batch_processing', 200, true);

      const stats = performanceService.getBatchStats();
      expect(stats.totalBatches).toBe(3);
      expect(stats.successfulBatches).toBe(2);
      expect(stats.failedBatches).toBe(1);
      expect(stats.averageProcessingTime).toBeCloseTo(150);
    });
  });

  describe('cache cleanup', () => {
    it('should cleanup expired cache entries', async () => {
      const testData = { test: 'data' };
      await performanceService.cacheResponse('test-key', testData);
      
      // Manipulate cache timestamp to simulate expiration
      const cache = (performanceService as any).cache;
      const entry = cache.get('test-key');
      entry.timestamp = Date.now() - 70000; // Expired by 10 seconds
      
      // Trigger cleanup
      (performanceService as any).cleanupCache();
      
      expect(performanceService.getCachedResponse('test-key')).toBeNull();
    });

    it('should handle cache size limits', async () => {
      const originalMaxSize = (performanceService as any).cacheConfig.maxSize;
      (performanceService as any).cacheConfig.maxSize = 2;

      await performanceService.cacheResponse('key1', 'data1');
      await performanceService.cacheResponse('key2', 'data2');
      await performanceService.cacheResponse('key3', 'data3');

      expect(performanceService.getCachedResponse('key1')).toBeNull();
      expect(performanceService.getCachedResponse('key2')).not.toBeNull();
      expect(performanceService.getCachedResponse('key3')).not.toBeNull();

      // Restore original max size
      (performanceService as any).cacheConfig.maxSize = originalMaxSize;
    });
  });

  describe('performance calculations', () => {
    it('should calculate error rate', async () => {
      performanceService.recordMetrics('test-op', 100, true);
      performanceService.recordMetrics('test-op', 150, false);
      performanceService.recordMetrics('test-op', 200, true);

      const metrics = await performanceService.getMetrics('test-op');
      expect(metrics.errorRate).toBeCloseTo(0.33, 1);
    });

    it('should calculate throughput', async () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockImplementation(() => now);

      performanceService.recordMetrics('test-op', 100, true);
      performanceService.recordMetrics('test-op', 150, true);
      
      // Move time forward by 1 second
      jest.spyOn(Date, 'now').mockImplementation(() => now + 1000);
      
      const metrics = await performanceService.getMetrics('test-op');
      expect(metrics.throughput).toBeCloseTo(2);

      jest.restoreAllMocks();
    });

    it('should handle network metrics errors', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('Network error'));

      const metrics = await performanceService.getMetrics('test-op');
      expect(metrics.activeConnections).toBe(0);
    });
  });
}); 