import { RpcClient } from '../../types/rpc.types';
import { Logger } from '../../types/logger.types';
import { Transaction } from '../../types/transaction.types';

export class RunesService {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly logger: Logger
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

  async createRune(name: string, supply: string): Promise<string> {
    try {
      const response = await this.rpcClient.call('createrune', [name, supply]);
      return response.runeId;
    } catch (error) {
      this.logger.error('Error creating rune:', error);
      throw new Error(`Failed to create rune: ${error}`);
    }
  }

  async transferRune(runeId: string, recipient: string, amount: string): Promise<string> {
    try {
      const response = await this.rpcClient.call('transferrune', [runeId, recipient, amount]);
      return response.txid;
    } catch (error) {
      this.logger.error('Error transferring rune:', error);
      throw new Error(`Failed to transfer rune: ${error}`);
    }
  }

  async getRuneBalance(runeId: string, address: string): Promise<string> {
    try {
      const response = await this.rpcClient.call('getrunebalance', [runeId, address]);
      return response.balance;
    } catch (error) {
      this.logger.error('Error getting rune balance:', error);
      throw new Error(`Failed to get rune balance: ${error}`);
    }
  }

  async getRuneInfo(runeId: string): Promise<{
    name: string;
    supply: string;
    creator: string;
  }> {
    try {
      const response = await this.rpcClient.call('getruneinfo', [runeId]);
      return response;
    } catch (error) {
      this.logger.error('Error getting rune info:', error);
      throw new Error(`Failed to get rune info: ${error}`);
    }
  }
}
