import { Logger } from '../utils/logger';
import { RPCClient } from '../utils/rpc.client';

interface Metrics {
  avgBlockTime: number;
  transactions: number;
  volume: string;
  timestamp: number;
  tps: number;
  blockHeight: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface RunePerformance {
  runeId: string;
  throughput: number;
  latency: number;
  errorRate: number;
  lastUpdated: number;
  successRate: number;
  avgResponseTime: number;
  peakThroughput: number;
}

export class RunesPerformanceService {
  constructor(
    private readonly rpcClient: RPCClient,
    private readonly logger: Logger
  ) {}

  async getMetrics(): Promise<Metrics> {
    try {
      const response = await this.rpcClient.call('getmetrics', []);
      if (!response || typeof response.avgBlockTime !== 'number') {
        throw new Error('Invalid response from RPC');
      }

      return {
        avgBlockTime: response.avgBlockTime,
        transactions: response.transactions,
        volume: response.volume,
        timestamp: response.timestamp,
        tps: response.tps,
        blockHeight: response.blockHeight,
        memoryUsage: response.memoryUsage,
        cpuUsage: response.cpuUsage
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to get metrics: ${error.message}`);
        throw new Error(`Failed to get metrics: ${error.message}`);
      } else {
        this.logger.error('Failed to get metrics: Unknown error');
        throw new Error('Failed to get metrics: Unknown error');
      }
    }
  }

  async getRunePerformance(runeId: string): Promise<RunePerformance> {
    try {
      if (!runeId) {
        throw new Error('Rune ID is required');
      }

      const response = await this.rpcClient.call('getruneperformance', [runeId]);
      if (!response || typeof response.throughput !== 'number') {
        throw new Error('Invalid response from RPC');
      }

      return {
        runeId,
        throughput: response.throughput,
        latency: response.latency,
        errorRate: response.errorRate,
        lastUpdated: response.lastUpdated,
        successRate: response.successRate || 100 - response.errorRate,
        avgResponseTime: response.avgResponseTime || response.latency,
        peakThroughput: response.peakThroughput || response.throughput
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to get rune performance: ${error.message}`);
        throw new Error(`Failed to get rune performance: ${error.message}`);
      } else {
        this.logger.error('Failed to get rune performance: Unknown error');
        throw new Error('Failed to get rune performance: Unknown error');
      }
    }
  }
} 