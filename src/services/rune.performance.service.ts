import { RPCClient } from '../utils/rpc.client';
import { RuneTransfer } from '../types/rune.types';
import { RPCError } from '../utils/errors';
import { Logger } from '../utils/logger';

interface CacheConfig {
  maxSize: number;
  ttl: number; // milliseconds
}

interface PerformanceMetrics {
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  throughput: number;
  activeConnections: number;
}

interface BatchStats {
  totalBatches: number;
  averageBatchSize: number;
  successfulBatches: number;
  failedBatches: number;
  averageProcessingTime: number;
}

interface MetricEntry {
  duration: number;
  success: boolean;
  timestamp: number;
}

export class RunePerformanceService {
  private cache: Map<string, { data: any; timestamp: number }>;
  private metrics: Map<string, MetricEntry[]>;
  private batchStats: BatchStats;
  private readonly cacheConfig: CacheConfig;
  private readonly logger: Logger;

  constructor(
    private readonly rpcClient: RPCClient,
    config?: Partial<CacheConfig>
  ) {
    this.cacheConfig = {
      maxSize: 1000,
      ttl: 60000, // 1 minute
      ...config
    };

    this.cache = new Map();
    this.metrics = new Map();
    this.batchStats = {
      totalBatches: 0,
      averageBatchSize: 0,
      successfulBatches: 0,
      failedBatches: 0,
      averageProcessingTime: 0
    };
    this.logger = new Logger('RunePerformanceService');

    // Start periodic cache cleanup
    setInterval(() => this.cleanupCache(), this.cacheConfig.ttl);
  }

  /**
   * Caches RPC response data
   * @param key Cache key
   * @param data Data to cache
   */
  async cacheResponse(key: string, data: any): Promise<void> {
    // Implement LRU cache eviction if needed
    if (this.cache.size >= this.cacheConfig.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Gets cached response if available
   * @param key Cache key
   * @returns Cached data or null
   */
  getCachedResponse(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cached data is still valid
    if (Date.now() - cached.timestamp > this.cacheConfig.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Optimizes batch processing of transfers
   * @param transfers Transfers to process
   * @returns Optimized batches
   */
  async optimizeBatches(transfers: RuneTransfer[]): Promise<RuneTransfer[][]> {
    const maxBatchSize = 100;
    let currentBatch: RuneTransfer[] = [];
    let currentBatchSize = 0;
    let currentBatchVolume = '0';
    const maxBatchVolume = '1000000'; // 1M runes per batch
    const batches: RuneTransfer[][] = [];

    for (const transfer of transfers) {
      // Check if adding this transfer would exceed batch limits
      if (currentBatchSize >= maxBatchSize ||
          BigInt(currentBatchVolume) + BigInt(transfer.amount) > BigInt(maxBatchVolume)) {
        // Add current batch to batches array
        batches.push([...currentBatch]);
        
        // Reset batch
        currentBatch = [];
        currentBatchSize = 0;
        currentBatchVolume = '0';
      }

      // Add to current batch
      currentBatch.push(transfer);
      currentBatchSize++;
      currentBatchVolume = (BigInt(currentBatchVolume) + BigInt(transfer.amount)).toString();
    }

    // Add remaining transfers
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  /**
   * Process a batch of transfers
   * @param batch Batch of transfers to process
   */
  private async _processBatch(batch: RuneTransfer[]): Promise<void> {
    // Implementation of batch processing
    for (const transfer of batch) {
      try {
        await this.rpcClient.call('processrunetransfer', [transfer]);
      } catch (error) {
        this.logger.error(`Failed to process transfer ${transfer.txid}:`, error);
      }
    }
  }

  /**
   * Records performance metrics
   * @param operation Operation name
   * @param duration Operation duration in milliseconds
   * @param success Whether operation was successful
   */
  recordMetrics(operation: string, duration: number, success: boolean): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }

    const operationMetrics = this.metrics.get(operation)!;
    operationMetrics.push({
      duration: success ? duration : -duration,
      success,
      timestamp: Date.now()
    });

    // Keep only last 1000 measurements
    if (operationMetrics.length > 1000) {
      operationMetrics.shift();
    }

    // Update batch stats if this was a batch operation
    if (operation === 'batch_processing') {
      this.updateBatchStats(duration, success);
    }
  }

  /**
   * Gets performance metrics for an operation
   * @param operation Operation name
   * @returns Performance metrics
   */
  async getMetrics(operation: string): Promise<PerformanceMetrics> {
    const operationMetrics = this.metrics.get(operation) || [];
    const total = operationMetrics.length;

    if (total === 0) {
      const networkMetrics = await this.getNetworkMetrics();
      return {
        averageResponseTime: 0,
        successRate: 0,
        errorRate: 0,
        throughput: 0,
        activeConnections: networkMetrics.activeConnections
      };
    }

    const sum = operationMetrics.reduce((a, b) => a + Math.abs(b.duration), 0);
    const average = sum / total;

    // Get network metrics
    const networkMetrics = await this.getNetworkMetrics();

    return {
      averageResponseTime: average,
      successRate: this.calculateSuccessRate(operation),
      errorRate: this.calculateErrorRate(operation),
      throughput: this.calculateThroughput(operation),
      activeConnections: networkMetrics.activeConnections
    };
  }

  /**
   * Gets batch processing statistics
   * @returns Batch statistics
   */
  getBatchStats(): BatchStats {
    return { ...this.batchStats };
  }

  /**
   * Optimizes RPC connection pool
   * @param maxConnections Maximum number of connections
   */
  async optimizeConnections(maxConnections: number): Promise<void> {
    try {
      const networkInfo = await this.rpcClient.call('getnetworkinfo', []);
      const currentConnections = networkInfo.connections;

      if (currentConnections > maxConnections) {
        // Implement connection pool optimization
        await this.rpcClient.call('setmaxconnections', [maxConnections]);
      }
    } catch (error) {
      throw new RPCError('Failed to optimize connections');
    }
  }

  /**
   * Cleans up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheConfig.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Updates batch processing statistics
   * @param duration Processing duration
   * @param success Whether batch was successful
   */
  private updateBatchStats(duration: number, success: boolean): void {
    this.batchStats.totalBatches++;
    if (success) {
      this.batchStats.successfulBatches++;
    } else {
      this.batchStats.failedBatches++;
    }

    // Update average processing time
    const totalTime = this.batchStats.averageProcessingTime * (this.batchStats.totalBatches - 1);
    this.batchStats.averageProcessingTime = (totalTime + duration) / this.batchStats.totalBatches;
  }

  /**
   * Calculates success rate for an operation
   * @param operation Operation name
   * @returns Success rate percentage
   */
  private calculateSuccessRate(operation: string): number {
    const metrics = this.metrics.get(operation) || [];
    if (metrics.length === 0) return 0;

    const successCount = metrics.filter(m => m.success).length;
    return (successCount / metrics.length) * 100;
  }

  /**
   * Calculates error rate for an operation
   * @param operation Operation name
   * @returns Error rate percentage
   */
  private calculateErrorRate(operation: string): number {
    const metrics = this.metrics.get(operation) || [];
    if (metrics.length === 0) return 0;

    const errorCount = metrics.filter(m => !m.success).length;
    return errorCount / metrics.length;
  }

  /**
   * Calculates throughput for an operation
   * @param operation Operation name
   * @returns Operations per second
   */
  private calculateThroughput(operation: string): number {
    const metrics = this.metrics.get(operation) || [];
    if (metrics.length === 0) return 0;

    // Son 1 saniye içindeki işlem sayısını hesapla
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    const recentMetrics = metrics.filter(m => m.timestamp >= oneSecondAgo);
    return recentMetrics.length;
  }

  /**
   * Gets current network metrics
   * @returns Network metrics
   */
  private async getNetworkMetrics(): Promise<{ activeConnections: number }> {
    try {
      const response = await this.rpcClient.call('getconnectioninfo', []);
      return {
        activeConnections: response.connections || 0
      };
    } catch {
      return {
        activeConnections: 0
      };
    }
  }
} 