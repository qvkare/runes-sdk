import { RpcClient } from '../../../types/rpc.types';
import { Logger } from '../../../types/logger.types';
import { Transaction } from '../../../types/transaction.types';
import { BatchTransfer } from '../../../types/rune.types';

export class RunesBatchService {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly logger: Logger
  ) {}

  async processBatch(transactions: Transaction[]): Promise<boolean> {
    try {
      for (const tx of transactions) {
        await this.rpcClient.validateTransaction(tx.txid);
        await this.rpcClient.sendTransaction(tx);
      }
      this.logger.info('Batch processed successfully');
      return true;
    } catch (error) {
      this.logger.error('Error processing batch:', error);
      throw error;
    }
  }

  async processBatchTransfer(transfers: BatchTransfer[]): Promise<string[]> {
    try {
      const txids = [];
      for (const transfer of transfers) {
        const tx: Transaction = {
          id: Math.random().toString(36).substring(7),
          type: 'transfer',
          txid: Math.random().toString(36).substring(7),
          blockHash: '',
          blockHeight: 0,
          amount: transfer.amount,
          fee: '0.00001',
          confirmations: 0,
          timestamp: Date.now(),
          sender: transfer.sender,
          recipient: transfer.recipient,
          size: 0,
          time: Date.now(),
          version: 1,
        };
        const txid = await this.rpcClient.sendTransaction(tx);
        txids.push(txid);
      }
      return txids;
    } catch (error) {
      this.logger.error('Error processing batch transfer:', error);
      throw error;
    }
  }
}
