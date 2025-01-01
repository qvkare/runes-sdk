import { RpcClient } from '../../types/rpc.types';
import { Logger } from '../../types/logger.types';
import { Transaction } from '../../types/transaction.types';

export class MempoolService {
  constructor(private rpcClient: RpcClient, private logger: Logger) {}

  async getMempool(): Promise<Transaction[]> {
    try {
      const transactions = await this.rpcClient.call('getrawmempool', [true]);
      return transactions;
    } catch (error) {
      this.logger.error('Failed to get mempool:', error);
      throw new Error('Failed to get mempool');
    }
  }

  async addTransaction(transaction: Transaction): Promise<string> {
    try {
      return await this.rpcClient.sendTransaction(transaction);
    } catch (error) {
      this.logger.error('Failed to add transaction to mempool:', error);
      throw new Error('Failed to add transaction');
    }
  }

  async removeTransaction(txid: string): Promise<void> {
    try {
      await this.rpcClient.call('removetxfrommempool', [txid]);
    } catch (error) {
      this.logger.error('Failed to remove transaction from mempool:', error);
      throw new Error('Failed to remove transaction');
    }
  }

  async getTransaction(txid: string): Promise<Transaction> {
    try {
      const tx = await this.rpcClient.getTransaction(txid);
      return tx;
    } catch (error) {
      this.logger.error('Failed to get transaction:', error);
      throw error;
    }
  }
}
