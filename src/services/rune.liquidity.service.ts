import { RPCClient } from '../utils/rpc.client';
import { LiquidityPool, LiquidityProvider } from '../types/liquidity.types';
import { Logger } from '../utils/logger';

export class RuneLiquidityService extends Logger {
  constructor(private readonly rpcClient: RPCClient) {
    super('RuneLiquidityService');
  }

  async getPool(poolId: string): Promise<LiquidityPool | null> {
    try {
      const response = await this.rpcClient.call('getpool', [poolId]);
      if (!response) return null;

      const providers: LiquidityProvider[] = response.providers.map((provider: any) => ({
        address: provider.address,
        amount: BigInt(provider.amount)
      }));

      return {
        id: response.id,
        rune: response.rune,
        totalLiquidity: BigInt(response.totalLiquidity),
        providers,
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