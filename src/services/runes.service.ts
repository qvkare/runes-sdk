import { RpcClient } from '../types/rpc.types';
import { Logger } from '../types/logger.types';
import { validateRuneTransfer } from '../utils/runes.validator';
import { RuneTransfer } from '../types/rune.types';

export class RunesService {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly logger: Logger
  ) {}

  async transfer(params: RuneTransfer): Promise<string> {
    try {
      validateRuneTransfer(params);
      const result = await this.rpcClient.call('transfer', [params]);
      return result;
    } catch (error) {
      this.logger.error('Error transferring runes:', error);
      throw error;
    }
  }
}
