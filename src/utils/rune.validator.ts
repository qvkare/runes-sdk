import { RuneValidationResult } from '../types/validation.types';
import { Logger } from './logger';

export class RuneValidator extends Logger {
  constructor() {
    super('RuneValidator');
  }

  private _validateAddress(address: string): boolean {
    return Boolean(address && typeof address === 'string' && address.length >= 26 && address.length <= 35);
  }

  async validateTransfer(from: string, to: string, amount: bigint): Promise<RuneValidationResult> {
    try {
      const errors: string[] = [];

      if (!this._validateAddress(from)) {
        errors.push('Invalid sender address');
      }

      if (!this._validateAddress(to)) {
        errors.push('Invalid recipient address');
      }

      if (!amount || amount <= BigInt(0)) {
        errors.push('Invalid amount');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      this.error('Failed to validate transfer:', error);
      throw error;
    }
  }
} 