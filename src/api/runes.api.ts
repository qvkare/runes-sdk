import { RpcClient as IRpcClient } from '../types/rpc.types';
import { Logger } from '../types/logger.types';

export class RunesApi {
  constructor(
    private readonly rpcClient: IRpcClient,
    private readonly logger: Logger
  ) {}

  async validateTransaction(txid: string): Promise<boolean> {
    try {
      const isValid = await this.rpcClient.validateTransaction(txid);
      if (isValid) {
        this.logger.info('Transaction validated successfully:', txid);
      }
      return isValid;
    } catch (error) {
      this.logger.error('Error validating transaction:', error as Error);
      throw error;
    }
  }
}
