import { RPCClient } from './rpc.client';
import { Logger } from './logger';
import { ValidationResult } from '../types';

export interface Transfer {
  runeId: string;
  amount: string;
  fromAddress: string;
  toAddress: string;
}

export class RunesValidator {
  constructor(
    private readonly rpcClient: RPCClient,
    private readonly logger: Logger
  ) {}

  async validateTransfer(transfer: Transfer): Promise<ValidationResult> {
    try {
      this.logger.info('Validating transfer:', transfer);
      const response = await this.rpcClient.call<{
        valid: boolean;
        errors: string[];
        warnings: string[];
      }>('validatetransfer', [transfer]);

      if (!response.result) {
        this.logger.error('Invalid response from RPC');
        throw new Error('Invalid response from RPC');
      }

      return {
        isValid: response.result.valid,
        errors: response.result.errors || [],
        warnings: response.result.warnings || []
      };
    } catch (error) {
      this.logger.error('Failed to validate transfer:', error);
      if (error instanceof Error && error.message === 'Invalid response from RPC') {
        throw error;
      }
      throw new Error('Failed to validate transfer');
    }
  }

  async validateAddress(address: string): Promise<ValidationResult> {
    try {
      this.logger.info('Validating address:', address);
      const response = await this.rpcClient.call<{ isvalid: boolean }>('validateaddress', [address]);

      if (!response.result) {
        this.logger.error('Invalid response from RPC');
        throw new Error('Invalid response from RPC');
      }

      const isValid = response.result.isvalid ?? false;
      return {
        isValid,
        errors: isValid ? [] : ['Invalid address'],
        warnings: []
      };
    } catch (error) {
      this.logger.error('Failed to validate address:', error);
      if (error instanceof Error && error.message === 'Invalid response from RPC') {
        throw error;
      }
      throw new Error('Failed to validate address');
    }
  }

  async validateRuneId(runeId: string): Promise<ValidationResult> {
    try {
      this.logger.info('Validating rune ID:', runeId);
      const response = await this.rpcClient.call<{ exists: boolean }>('validateruneid', [runeId]);

      if (!response.result) {
        this.logger.error('Invalid response from RPC');
        throw new Error('Invalid response from RPC');
      }

      const exists = response.result.exists ?? false;
      return {
        isValid: exists,
        errors: exists ? [] : ['Invalid rune ID'],
        warnings: []
      };
    } catch (error) {
      this.logger.error('Failed to validate rune ID:', error);
      if (error instanceof Error && error.message === 'Invalid response from RPC') {
        throw error;
      }
      throw new Error('Failed to validate rune ID');
    }
  }

  isValidAmount(amount: string): boolean {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount > 0;
  }
} 