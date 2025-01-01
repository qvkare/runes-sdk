import { RpcClient } from '../../types/rpc.types';
import { Logger } from '../../types/logger.types';
import { Transaction } from '../../types/transaction.types';
import { ValidationConfig } from '../../types/validation.types';

export class TransactionValidatorService {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly logger: Logger,
    private readonly config: ValidationConfig
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
