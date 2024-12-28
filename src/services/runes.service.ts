import { RPCClient } from '../utils/rpc.client';
import { RunesValidator } from '../utils/runes.validator';
import { Logger } from '../utils/logger';

export class RunesService extends Logger {
  private validator: RunesValidator;

  constructor(private rpcClient: RPCClient) {
    super('RunesService');
    this.validator = new RunesValidator();
  }

  async validateTransfer(from: string, to: string, amount: bigint): Promise<{ isValid: boolean; errors: string[] }> {
    return this.validator.validateTransfer(from, to, amount);
  }

  async createTransfer(from: string, to: string, amount: bigint): Promise<string> {
    const validationResult = await this.validator.validateTransfer(from, to, amount);

    if (!validationResult.isValid) {
      const error = new Error('Runes transfer validation failed');
      this.error('Failed to create transfer:', error);
      throw error;
    }

    const response = await this.rpcClient.call('createtransfer', [from, to, amount.toString()]);

    if (!response?.txid) {
      const error = new Error('Failed to create transfer');
      this.error('Failed to create transfer:', error);
      throw error;
    }

    return response.txid;
  }

  async getTransferStatus(txid: string): Promise<string> {
    try {
      const response = await this.rpcClient.call('gettransferstatus', [txid]);
      return response.status;
    } catch (error) {
      this.error('Failed to get transfer status:', error);
      throw error;
    }
  }
} 