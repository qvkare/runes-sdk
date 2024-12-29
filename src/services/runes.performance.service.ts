import { RPCClient } from '../utils/rpc.client';
import { Logger } from '../utils/logger';
import { RunePerformanceStats } from '../types';

interface PerformanceMetrics {
  price: string;
  volume24h: string;
  marketCap: string;
  priceChange24h: string;
}

export class RunesPerformanceService {
  constructor(
    private readonly rpcClient: RPCClient,
    private readonly logger: Logger
  ) {}

  public async getPerformanceMetrics(runeId: string): Promise<PerformanceMetrics> {
    try {
      const response = await this.rpcClient.call<PerformanceMetrics>('getperformancemetrics', [runeId]);
      if (!response.result) {
        throw new Error('Empty response received');
      }
      return response.result;
    } catch (error) {
      this.logger.error('Failed to get performance metrics:', error);
      throw new Error('Failed to get performance metrics');
    }
  }

  public async getStats(runeId: string): Promise<RunePerformanceStats> {
    this.logger.info(`Fetching performance stats for rune: ${runeId}`);
    try {
      const response = await this.rpcClient.call<RunePerformanceStats>('getrunestats', [runeId]);
      if (!response.result) {
        throw new Error('Empty response received');
      }
      return response.result;
    } catch (error) {
      this.logger.error('Failed to get rune stats:', error);
      throw new Error('Failed to get rune stats');
    }
  }
} 