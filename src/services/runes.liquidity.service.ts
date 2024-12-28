import { RPCClient } from '../utils/rpc.client';
import { Logger } from '../utils/logger';

interface LiquidityPool {
  id: string;
  runes: string;
  totalLiquidity: bigint;
  providers: Map<string, bigint>;
}

interface PoolResponse {
  id: string;
  runes: string;
  totalLiquidity: string;
  providers: Array<{
    address: string;
    amount: string;
  }>;
}

export class RunesLiquidityService extends Logger {
  constructor(private readonly rpcClient: RPCClient) {
    super('RunesLiquidityService');
  }

  async getPool(poolId: string): Promise<LiquidityPool> {
    try {
      const response = await this.rpcClient.call<PoolResponse>('getpool', [poolId]);
      return {
        id: response.id,
        runes: response.runes,
        totalLiquidity: BigInt(response.totalLiquidity),
        providers: new Map(
          response.providers.map(p => [p.address, BigInt(p.amount)])
        )
      };
    } catch (error) {
      this.error('Failed to get pool:', error);
      throw error;
    }
  }

  async addLiquidity(poolId: string, amount: bigint, address: string): Promise<boolean> {
    try {
      const result = await this.rpcClient.call('addliquidity', [poolId, amount.toString(), address]);
      return result === true;
    } catch (error) {
      this.error('Failed to add liquidity:', error);
      throw error;
    }
  }

  async removeLiquidity(poolId: string, amount: bigint, address: string): Promise<boolean> {
    try {
      const result = await this.rpcClient.call('removeliquidity', [poolId, amount.toString(), address]);
      return result === true;
    } catch (error) {
      this.error('Failed to remove liquidity:', error);
      throw error;
    }
  }
} 