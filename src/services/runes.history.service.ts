import { RPCClient } from '../utils/rpc.client';
import { Logger } from '../utils/logger';
import { TransactionHistory } from '../types';

export class RunesHistoryService {
  constructor(
    private readonly rpcClient: RPCClient,
    private readonly logger: Logger
  ) {}

  async getTransactionHistory(runeId: string): Promise<TransactionHistory[]> {
    try {
      this.logger.info('Getting transaction history for rune:', runeId);
      const response = await this.rpcClient.call<TransactionHistory[]>('gettransactionhistory', [runeId]);

      if (!response.result) {
        throw new Error('Invalid response from RPC');
      }

      return response.result;
    } catch (error) {
      this.logger.error('Failed to get transaction history:', error);
      throw new Error('Failed to get transaction history');
    }
  }
} 