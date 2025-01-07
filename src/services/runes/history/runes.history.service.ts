import { RpcClient } from '../../../types/rpc.types';
import { Logger } from '../../../types/logger.types';
import { Transaction } from '../../../types/transaction.types';

export class RunesHistoryService {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly logger: Logger
  ) {}

  async getTransactionHistory(address: string, limit: number = 10): Promise<Transaction[]> {
    try {
      const response = await this.rpcClient.call('getaddresshistory', [address, limit]);

      return response.map((tx: any) => ({
        id: tx.id,
        txid: tx.txid,
        type: tx.type,
        amount: tx.amount,
        fee: tx.fee,
        sender: tx.sender,
        recipient: tx.recipient,
        confirmations: tx.confirmations,
        blockhash: tx.blockhash,
        blocktime: tx.blocktime,
        time: tx.time,
        size: tx.size,
      }));
    } catch (error) {
      this.logger.error('Error getting transaction history:', error);
      throw error;
    }
  }

  async getTransaction(txid: string): Promise<Transaction> {
    try {
      const tx = await this.rpcClient.getTransaction(txid);
      if (!tx) {
        throw new Error('Transaction not found');
      }
      return tx;
    } catch (error) {
      this.logger.error(`Failed to get transaction: ${error}`);
      throw error;
    }
  }

  async getAddressBalance(address: string): Promise<string> {
    try {
      const balance = await this.rpcClient.getBalance(address);
      return balance.toString();
    } catch (error) {
      this.logger.error(`Failed to get address balance: ${error}`);
      throw error;
    }
  }
}
