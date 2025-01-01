import { RpcClient } from '../../../types/rpc.types';
import { Logger } from '../../../types/logger.types';
import { RuneMetrics, NetworkStats, SystemResources } from '../../../types/rune.types';

export class RunesPerformanceService {
  constructor(private rpcClient: RpcClient, private logger: Logger) {}

  async getPerformanceMetrics(runeId: string): Promise<RuneMetrics> {
    try {
      const metrics = await this.rpcClient.call('getruneperformancemetrics', [runeId]);
      return metrics;
    } catch (error) {
      this.logger.error('Failed to get performance metrics:', error);
      throw new Error('Failed to get performance metrics');
    }
  }

  async getNetworkStats(): Promise<NetworkStats> {
    try {
      const stats = await this.rpcClient.call('getnetworkstats');
      return stats;
    } catch (error) {
      this.logger.error('Failed to get network stats:', error);
      throw new Error('Failed to get network stats');
    }
  }

  async getSystemResources(): Promise<SystemResources> {
    try {
      const resources = await this.rpcClient.call('getsystemresources');
      return resources;
    } catch (error) {
      this.logger.error('Failed to get system resources:', error);
      throw new Error('Failed to get system resources');
    }
  }
}
