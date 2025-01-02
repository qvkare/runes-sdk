import { RpcClient } from '../../utils/rpc.client';
import { Logger } from '../../types/logger.types';

export class RunesLiquidityService {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly logger: Logger
  ) {}

  async createPool(params: {
    runeId: string;
    initialLiquidity: number;
    initialPrice: number;
  }): Promise<any> {
    try {
      return await this.rpcClient.call('createpool', [params]);
    } catch (error) {
      this.logger.error(`Failed to create pool: ${error}`);
      throw new Error(`Failed to create pool: ${error}`);
    }
  }

  async addLiquidity(params: { poolId: string; amount: number }): Promise<any> {
    try {
      return await this.rpcClient.call('addliquidity', [params]);
    } catch (error) {
      this.logger.error(`Failed to add liquidity: ${error}`);
      throw new Error(`Failed to add liquidity: ${error}`);
    }
  }

  async getPool(poolId: string): Promise<any> {
    try {
      return await this.rpcClient.call('getpool', [poolId]);
    } catch (error) {
      this.logger.error(`Failed to get pool: ${error}`);
      throw new Error(`Failed to get pool: ${error}`);
    }
  }
}
