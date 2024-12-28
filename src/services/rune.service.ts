import { RPCClient } from '../utils/rpc.client';
import { RuneValidator } from '../utils/rune.validator';
import { RuneValidationResult } from '../types/validation.types';
import { Logger } from '../utils/logger';

export class RuneService extends Logger {
  private readonly validator: RuneValidator;

  constructor(private readonly rpcClient: RPCClient) {
    super('RuneService');
    this.validator = new RuneValidator();
  }

  async validateTransfer(from: string, to: string, amount: bigint): Promise<RuneValidationResult> {
    try {
      const result = await this.validator.validateTransfer(from, to, amount);
      return result;
    } catch (error) {
      this.error('Failed to validate transfer:', error);
      throw error;
    }
  }

  async createTransfer(from: string, to: string, amount: bigint): Promise<string> {
    try {
      const validationResult = await this.validateTransfer(from, to, amount);
      if (!validationResult.isValid) {
        throw new Error('Rune transfer validation failed');
      }

      const response = await this.rpcClient.call('createtransfer', [from, to, amount.toString()]);
      if (!response || !response.txid) {
        throw new Error('Failed to create transfer');
      }

      return response.txid;
    } catch (error) {
      this.error('Failed to create transfer:', error);
      throw error;
    }
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