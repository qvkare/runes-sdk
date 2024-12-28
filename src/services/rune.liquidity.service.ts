import { RPCClient } from '../utils/rpc.client';
import { LiquidityPool } from '../types/liquidity.types';
import { Logger } from '../utils/logger';

interface RPCLiquidityPool {
  id: string;
  rune: string;
  totalLiquidity: string;
  providers: Array<{
    address: string;
    amount: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export class RuneLiquidityService extends Logger {
  constructor(private readonly rpcClient: RPCClient) {
    super('RuneLiquidityService');
  }

  async getPool(poolId: string): Promise<LiquidityPool | null> {
    try {
      const response = await this.rpcClient.call<RPCLiquidityPool>('getpool', [poolId]);
      if (!response) return null;

      return {
        id: response.id,
        rune: response.rune,
        totalLiquidity: BigInt(response.totalLiquidity),
        providers: response.providers.map(p => ({
          address: p.address,
          amount: BigInt(p.amount)
        })),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt)
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