import { RPCClient } from '../utils/rpc.client';
import { Logger } from '../utils/logger';
import { LiquidityPool } from '../types';

export class RunesLiquidityService {
  constructor(
    private readonly rpcClient: RPCClient,
    private readonly logger: Logger
  ) {}

  async getPoolInfo(runeId: string): Promise<LiquidityPool> {
    try {
      this.logger.info('Getting liquidity pool info for rune:', runeId);
      const response = await this.rpcClient.call<LiquidityPool>('getpoolinfo', [runeId]);

      if (!response.result) {
        this.logger.error('Invalid response from RPC');
        throw new Error('Invalid response from RPC');
      }

      return response.result;
    } catch (error) {
      this.logger.error('Failed to get pool info:', error);
      if (error instanceof Error && error.message === 'Invalid response from RPC') {
        throw error;
      }
      throw new Error('Failed to get pool info');
    }
  }

  async addLiquidity(runeId: string, amount: string): Promise<{ txId: string }> {
    try {
      this.logger.info('Adding liquidity to pool:', { runeId, amount });
      const response = await this.rpcClient.call<{ txId: string }>('addliquidity', [runeId, amount]);

      if (!response.result) {
        this.logger.error('Invalid response from RPC');
        throw new Error('Invalid response from RPC');
      }

      return response.result;
    } catch (error) {
      this.logger.error('Failed to add liquidity:', error);
      if (error instanceof Error && error.message === 'Invalid response from RPC') {
        throw error;
      }
      throw new Error('Failed to add liquidity');
    }
  }
} 