import { Logger } from './logger';
import { RunesValidationResult } from '../types/validation.types';

export class RunesValidator extends Logger {
  constructor() {
    super('RunesValidator');
  }

  async validateTransfer(from: string, to: string, amount: bigint): Promise<RunesValidationResult> {
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

  private _validateAddress(address: string): boolean {
    return Boolean(address && typeof address === 'string' && address.length >= 26 && address.length <= 35);
  }
} 