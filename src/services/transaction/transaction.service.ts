import { RpcClient } from '../../types/rpc.types';
import { Logger } from '../../types/logger.types';
import { Transaction } from '../../types/transaction.types';

export class TransactionService {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly logger: Logger
  ) {}

  async sendTransaction(tx: Transaction): Promise<string> {
    try {
      const txid = await this.rpcClient.sendTransaction(tx);
      this.logger.info(`Transaction sent successfully: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error('Error sending transaction:', error);
      throw error;
    }
  }

  async getTransaction(txid: string): Promise<Transaction> {
    try {
      const tx = await this.rpcClient.getTransaction(txid);
      return tx;
    } catch (error) {
      this.logger.error(`Error getting transaction ${txid}:`, error);
      throw error;
    }
  }
}
