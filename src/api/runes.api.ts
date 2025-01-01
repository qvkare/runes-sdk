import { RpcClient } from '../types/rpc.types';
import { Logger } from '../types/logger.types';
import { Transaction } from '../types/transaction.types';

export class RunesApi {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly logger: Logger
  ) {}

  async validateTransaction(txid: string): Promise<boolean> {
    try {
      const result = await this.rpcClient.validateTransaction(txid);
      this.logger.info('Transaction validated successfully:', txid);
      return result;
    } catch (error) {
      this.logger.error('Error validating transaction:', error);
      throw error;
    }
  }
} 