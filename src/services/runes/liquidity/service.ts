import { RpcClient } from '../../../types/rpc.types';
import { Logger } from '../../../types/logger.types';

export class RunesLiquidityService {
  constructor(private rpcClient: RpcClient, private logger: Logger) {}

  async createPool(runeId: string, initialLiquidity: string): Promise<boolean> {
    try {
      const result = await this.rpcClient.call('createrunepool', [runeId, initialLiquidity]);
      return result;
    } catch (error) {
      this.logger.error('Failed to create rune pool:', error);
      throw new Error('Failed to create rune pool');
    }
  }

  async addLiquidity(runeId: string, amount: string): Promise<boolean> {
    try {
      const result = await this.rpcClient.call('addruneliquidity', [runeId, amount]);
      return result;
    } catch (error) {
      this.logger.error('Failed to add rune liquidity:', error);
      throw new Error('Failed to add rune liquidity');
    }
  }

  async getPool(runeId: string): Promise<any> {
    try {
      const pool = await this.rpcClient.call('getrunepool', [runeId]);
      return pool;
    } catch (error) {
      this.logger.error('Failed to get rune pool:', error);
      throw new Error('Failed to get rune pool');
    }
  }
}
