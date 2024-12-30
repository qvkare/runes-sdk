import { RPCClient } from '../utils/rpc.client';
import { RunesValidator } from '../utils/runes.validator';
import { Logger } from '../utils/logger';
import { RuneHistory } from '../types';

export class RunesHistoryService {
  constructor(
    private readonly rpcClient: RPCClient,
    private readonly validator: RunesValidator,
    private readonly logger: Logger
  ) {}

  async getRuneHistory(runeId: string): Promise<RuneHistory> {
    const validationResult = await this.validator.validateRuneSymbol(runeId);
    if (!validationResult.isValid) {
      throw new Error('Invalid rune symbol');
    }

    try {
      const result = await this.rpcClient.call('getrunehistory', [runeId]);
      return result;
    } catch (error) {
      this.logger.error('Failed to get rune history:', error);
      throw error;
    }
  }

  async getAddressHistory(address: string): Promise<RuneHistory> {
    const validationResult = await this.validator.validateAddress(address);
    if (!validationResult.isValid) {
      throw new Error('Invalid address');
    }

    try {
      const result = await this.rpcClient.call('getaddresshistory', [address]);
      return result;
    } catch (error) {
      this.logger.error('Failed to get address history:', error);
      throw error;
    }
  }
}
