import { Logger } from '../utils/logger';
import { RPCClient } from '../utils/rpc.client';

interface Pool {
  poolId: string;
  runeId: string;
  liquidity: number;
  price: number;
  volume24h: number;
  timestamp: number;
}

interface PoolCreationParams {
  runeId: string;
  initialLiquidity: number;
  initialPrice: number;
}

export class RunesLiquidityService {
  constructor(
    private readonly rpcClient: RPCClient,
    private readonly logger: Logger
  ) {}

  async createPool(params: PoolCreationParams): Promise<Pool> {
    try {
      const response = await this.rpcClient.call('createpool', [params]);
      if (!response || !response.poolId) {
        throw new Error('Invalid response from RPC');
      }

      return {
        poolId: response.poolId,
        runeId: response.runeId,
        liquidity: response.liquidity,
        price: response.price,
        volume24h: response.volume24h,
        timestamp: response.timestamp
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to create pool: ${error.message}`);
        throw new Error(`Failed to create pool: ${error.message}`);
      } else {
        this.logger.error('Failed to create pool: Unknown error');
        throw new Error('Failed to create pool: Unknown error');
      }
    }
  }

  async addLiquidity(params: { poolId: string; amount: number }): Promise<Pool> {
    try {
      const response = await this.rpcClient.call('addliquidity', [params]);
      if (!response || !response.poolId) {
        throw new Error('Invalid response from RPC');
      }

      return {
        poolId: response.poolId,
        runeId: response.runeId,
        liquidity: response.liquidity,
        price: response.price,
        volume24h: response.volume24h,
        timestamp: response.timestamp
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to add liquidity: ${error.message}`);
        throw new Error(`Failed to add liquidity: ${error.message}`);
      } else {
        this.logger.error('Failed to add liquidity: Unknown error');
        throw new Error('Failed to add liquidity: Unknown error');
      }
    }
  }

  async getPool(poolId: string): Promise<Pool> {
    try {
      const response = await this.rpcClient.call('getpool', [poolId]);
      if (!response || !response.poolId) {
        throw new Error('Invalid response from RPC');
      }

      return {
        poolId: response.poolId,
        runeId: response.runeId,
        liquidity: response.liquidity,
        price: response.price,
        volume24h: response.volume24h,
        timestamp: response.timestamp
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to get pool: ${error.message}`);
        throw new Error(`Failed to get pool: ${error.message}`);
      } else {
        this.logger.error('Failed to get pool: Unknown error');
        throw new Error('Failed to get pool: Unknown error');
      }
    }
  }
} 