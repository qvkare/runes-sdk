import { RpcClient as IRpcClient } from '../../types/rpc.types';
import { Logger } from '../../types/logger.types';
import { Transaction } from '../../types/transaction.types';
import { ValidationConfig } from '../../types/validation.types';

export class ValidationService {
  constructor(
    private readonly rpcClient: IRpcClient,
    private readonly logger: Logger,
    private readonly config: ValidationConfig
  ) {}

  async validateTransaction(transaction: Transaction): Promise<boolean> {
    try {
      const result = await this.rpcClient.validateTransaction(transaction.txid);
      this.logger.info('Transaction validated successfully:', transaction.txid);
      return result;
    } catch (error) {
      this.logger.error('Error validating transaction:', error);
      throw error;
    }
  }
}
