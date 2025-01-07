import { RpcClient } from '../../utils/rpc.client';
import { Logger } from '../../types/logger.types';

export class RunesPerformanceService {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly logger: Logger
  ) {}

  async getMetrics(): Promise<any> {
    try {
      return await this.rpcClient.call('getmetrics', []);
    } catch (error) {
      this.logger.error(`Failed to get metrics: ${error}`);
      throw new Error(`Failed to get metrics: ${error}`);
    }
  }

  async getRunePerformance(runeId: string): Promise<any> {
    try {
      const response = await this.rpcClient.call('getruneperformance', [runeId]);
      return {
        runeId,
        ...response,
      };
    } catch (error) {
      this.logger.error(`Failed to get rune performance: ${error}`);
      throw new Error(`Failed to get rune performance: ${error}`);
    }
  }
}
