import { Logger } from '../utils/logger';
import { RPCClient } from '../utils/rpc.client';
import { RuneTransaction } from '../types/rune.types';

export class RunesHistoryService {
  private readonly rpcClient: RPCClient;
  private readonly logger: Logger;

  constructor(rpcClient: RPCClient, logger: Logger) {
    this.rpcClient = rpcClient;
    this.logger = logger;
  }

  async getTransactionHistory(address: string, limit?: number, offset?: number): Promise<RuneTransaction[]> {
    try {
      const params = [address];
      if (limit !== undefined) params.push(limit.toString());
      if (offset !== undefined) params.push(offset.toString());

      const response = await this.rpcClient.call('gettransactionhistory', params);
      return response as RuneTransaction[];
    } catch (error) {
      const errorMessage = `Failed to get transaction history: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async getTransaction(txid: string): Promise<RuneTransaction> {
    try {
      const response = await this.rpcClient.call('gettransaction', [txid]);
      return response as RuneTransaction;
    } catch (error) {
      const errorMessage = `Failed to get transaction: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
} 