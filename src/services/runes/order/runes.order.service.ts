import { RpcClient } from '../../../types/rpc.types';
import { Logger } from '../../../types/logger.types';
import { Transaction, TransactionType } from '../../../types/transaction.types';
import { v4 as uuidv4 } from 'uuid';

export class RunesOrderService {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly logger: Logger
  ) {}

  private createOrderTransaction(
    token: string,
    amount: string,
    price: string,
    sender: string,
    recipient: string
  ): Transaction {
    const tx: Transaction = {
      id: uuidv4(),
      txid: uuidv4(),
      type: TransactionType.ORDER,
      amount: amount,
      fee: '1000',
      sender: sender,
      recipient: recipient,
      confirmations: 0,
      blockHash: '',
      blockHeight: 0,
      timestamp: Date.now(),
      time: Date.now(),
      size: 0,
      token: token,
      price: price,
      version: 1,
    };
    return tx;
  }

  async createOrder(params: { token: string; amount: string; price: string }): Promise<string> {
    try {
      const tx: Transaction = this.createOrderTransaction(
        params.token,
        params.amount,
        params.price,
        '',
        ''
      );

      const txid = await this.rpcClient.sendTransaction(tx);
      this.logger.info(`Created order: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error('Error creating order:', error);
      throw error;
    }
  }

  async cancelOrder(orderId: string): Promise<string> {
    try {
      const tx: Transaction = {
        id: orderId,
        txid: uuidv4(),
        type: TransactionType.ORDER,
        amount: '0',
        fee: '1000',
        sender: '',
        recipient: '',
        confirmations: 0,
        blockHash: '',
        blockHeight: 0,
        timestamp: Date.now(),
        time: Date.now(),
        size: 0,
        version: 1,
      };

      const txid = await this.rpcClient.sendTransaction(tx);
      this.logger.info(`Cancelled order: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error('Error cancelling order:', error);
      throw error;
    }
  }
}
