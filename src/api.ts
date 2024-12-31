import { RPCClient } from './utils/rpc.client';
import { Logger } from './utils/logger';
import { RunesValidator } from './utils/runes.validator';
import { RuneInfo, RuneTransaction, RuneTransfer } from './types/rune.types';

export class RunesAPI {
  constructor(
    private readonly rpcClient: RPCClient,
    private readonly validator: RunesValidator,
    private readonly logger: Logger
  ) {}

  async createRune(params: {
    name: string;
    symbol: string;
    totalSupply: string;
    decimals: number;
    owner: string;
    metadata?: Record<string, any>;
  }): Promise<RuneInfo> {
    try {
      const response = await this.rpcClient.call('createrune', [params]);
      return response as RuneInfo;
    } catch (error) {
      const errorMessage = `Failed to create rune: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async transferRune(params: RuneTransfer): Promise<RuneTransaction> {
    try {
      const validationResult = await this.validator.validateTransfer({
        from: params.from,
        to: params.to,
        amount: params.amount
      });
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(', '));
      }

      const response = await this.rpcClient.call('transferrune', [params]);
      return response as RuneTransaction;
    } catch (error) {
      const errorMessage = `Failed to transfer rune: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async getRuneInfo(runeId: string): Promise<RuneInfo> {
    try {
      const response = await this.rpcClient.call('getruneinfo', [runeId]);
      return response as RuneInfo;
    } catch (error) {
      const errorMessage = `Failed to get rune info: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async getRuneBalance(runeId: string, address: string): Promise<string> {
    try {
      const response = await this.rpcClient.call('getrunebalance', [runeId, address]);
      return response.balance;
    } catch (error) {
      const errorMessage = `Failed to get rune balance: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
} 