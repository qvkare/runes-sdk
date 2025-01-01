import { RpcClient } from '../../../utils/rpc.client';
import { Logger } from '../../../types/logger.types';

interface PerformanceMetrics {
  transactionsPerSecond: number;
  averageBlockTime: number;
  averageFee: string;
  networkHashrate: number;
}

interface RunePerformance {
  id: string;
  volume24h: string;
  price24h: string;
  holders: number;
  transactions24h: number;
}

export class RunesPerformanceService {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly logger: Logger
  ) {}

  async getMetrics(): Promise<PerformanceMetrics> {
    try {
      const [tps, blockTime, fee, hashrate] = await Promise.all([
        this.getTransactionsPerSecond(),
        this.getAverageBlockTime(),
        this.getAverageFee(),
        this.getNetworkHashrate(),
      ]);

      return {
        transactionsPerSecond: tps,
        averageBlockTime: blockTime,
        averageFee: fee,
        networkHashrate: hashrate,
      };
    } catch (error) {
      this.logger.error(`Failed to get performance metrics: ${error}`);
      throw error;
    }
  }

  async getRunePerformance(runeId: string): Promise<RunePerformance> {
    try {
      const response = await this.rpcClient.call('getruneperformance', [runeId]);
      return {
        id: runeId,
        volume24h: response.volume || '0',
        price24h: response.price || '0',
        holders: response.holders || 0,
        transactions24h: response.transactions || 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get rune performance: ${error}`);
      throw error;
    }
  }

  private async getTransactionsPerSecond(): Promise<number> {
    try {
      const response = await this.rpcClient.call('gettxspersecond', []);
      return Number(response);
    } catch (error) {
      this.logger.error(`Failed to get transactions per second: ${error}`);
      throw error;
    }
  }

  private async getAverageBlockTime(): Promise<number> {
    try {
      const response = await this.rpcClient.call('getaverageblocktime', []);
      return Number(response);
    } catch (error) {
      this.logger.error(`Failed to get average block time: ${error}`);
      throw error;
    }
  }

  private async getAverageFee(): Promise<string> {
    try {
      const response = await this.rpcClient.call('getaveragefee', []);
      return response;
    } catch (error) {
      this.logger.error(`Failed to get average fee: ${error}`);
      throw error;
    }
  }

  private async getNetworkHashrate(): Promise<number> {
    try {
      const response = await this.rpcClient.call('getnetworkhashps', []);
      return Number(response);
    } catch (error) {
      this.logger.error(`Failed to get network hashrate: ${error}`);
      throw error;
    }
  }
}
