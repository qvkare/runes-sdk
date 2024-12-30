import { RPCClient } from '../utils/rpc.client';
import { RunesValidator } from '../utils/runes.validator';
import { Logger } from '../utils/logger';
import { LiquidityPool, ProviderLiquidity } from '../types';

export class RunesLiquidityService {
  constructor(
    private readonly rpcClient: RPCClient,
    private readonly validator: RunesValidator,
    private readonly logger: Logger
  ) {}

  async addLiquidity(runeId: string, amount: number): Promise<boolean> {
    try {
      const validationResult = await this.validator.validateRuneSymbol(runeId);
      if (!validationResult.isValid) {
        throw new Error('Invalid rune symbol');
      }

      const amountValidation = await this.validator.validateRuneAmount(amount);
      if (!amountValidation.isValid) {
        throw new Error('Invalid amount');
      }

      // Call RPC method to add liquidity
      await this.rpcClient.call('addliquidity', [runeId, amount]);
      return true;
    } catch (error) {
      this.logger.error('Error adding liquidity:', error);
      throw error;
    }
  }

  async removeLiquidity(runeId: string, amount: number): Promise<boolean> {
    try {
      const validationResult = await this.validator.validateRuneSymbol(runeId);
      if (!validationResult.isValid) {
        throw new Error('Invalid rune symbol');
      }

      const amountValidation = await this.validator.validateRuneAmount(amount);
      if (!amountValidation.isValid) {
        throw new Error('Invalid amount');
      }

      // Call RPC method to remove liquidity
      await this.rpcClient.call('removeliquidity', [runeId, amount]);
      return true;
    } catch (error) {
      this.logger.error('Error removing liquidity:', error);
      throw error;
    }
  }

  async getLiquidityPool(runeId: string): Promise<LiquidityPool> {
    try {
      const validationResult = await this.validator.validateRuneSymbol(runeId);
      if (!validationResult.isValid) {
        throw new Error('Invalid rune symbol');
      }

      // Call RPC method to get liquidity pool info
      const response = await this.rpcClient.call('getliquiditypool', [runeId]);
      return response as LiquidityPool;
    } catch (error) {
      this.logger.error('Error getting liquidity pool:', error);
      throw error;
    }
  }

  async getProviderLiquidity(runeId: string, address: string): Promise<ProviderLiquidity> {
    try {
      const runeValidation = await this.validator.validateRuneSymbol(runeId);
      if (!runeValidation.isValid) {
        throw new Error('Invalid rune symbol');
      }

      const addressValidation = await this.validator.validateAddress(address);
      if (!addressValidation.isValid) {
        throw new Error('Invalid address');
      }

      // Call RPC method to get provider liquidity
      const response = await this.rpcClient.call('getproviderliquidity', [runeId, address]);
      return response as ProviderLiquidity;
    } catch (error) {
      this.logger.error('Error getting provider liquidity:', error);
      throw error;
    }
  }
}
