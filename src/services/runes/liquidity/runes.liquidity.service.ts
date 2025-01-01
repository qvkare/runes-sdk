import { RpcClient } from '../../../types/rpc.types';
import { Logger } from '../../../types/logger.types';
import { Transaction, TransactionType } from '../../../types/transaction.types';
import { v4 as uuidv4 } from 'uuid';

export class RunesLiquidityService {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly logger: Logger
  ) {}

  private createLiquidityTransaction(token: string, amount: string, sender: string, recipient: string): Transaction {
    const tx: Transaction = {
      id: uuidv4(),
      txid: uuidv4(),
      type: TransactionType.LIQUIDITY,
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
      version: 1
    };
    return tx;
  }

  async addLiquidity(params: { token: string, amount: string }): Promise<string> {
    try {
      const tx: Transaction = this.createLiquidityTransaction(params.token, params.amount, '', '');

      const txid = await this.rpcClient.sendTransaction(tx);
      this.logger.info(`Added liquidity: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error('Error adding liquidity:', error);
      throw error;
    }
  }

  async removeLiquidity(params: { token: string, amount: string }): Promise<string> {
    try {
      const tx: Transaction = this.createLiquidityTransaction(params.token, params.amount, '', '');

      const txid = await this.rpcClient.sendTransaction(tx);
      this.logger.info(`Removed liquidity: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error('Error removing liquidity:', error);
      throw error;
    }
  }

  async getLiquidityBalance(token: string, address: string): Promise<string> {
    try {
      const balance = await this.rpcClient.getBalance(address);
      return balance;
    } catch (error) {
      this.logger.error('Error getting liquidity balance:', error);
      throw error;
    }
  }
}
