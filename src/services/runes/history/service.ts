import { RpcClient } from '../../../types/rpc.types';
import { Logger } from '../../../types/logger.types';
import { Transaction } from '../../../types/transaction.types';

export class RunesHistoryService {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly logger: Logger
  ) {}

  async getTransactionDetails(txId: string): Promise<Transaction> {
    try {
      const transaction = await this.rpcClient.getTransaction(txId);
      return transaction;
    } catch (error) {
      this.logger.error('Failed to get transaction details:', error);
      throw error;
    }
  }
}
