import { Logger } from './logger';
import { RPCClient } from './rpc.client';
import { ValidationResult, RuneTransfer } from '../types/rune.types';

export class RunesValidator {
  private readonly rpcClient: RPCClient;
  private readonly logger: Logger;

  constructor(rpcClient: RPCClient, logger: Logger) {
    this.rpcClient = rpcClient;
    this.logger = logger;
  }

  validateTransfer(params: RuneTransfer): ValidationResult {
    const errors: string[] = [];

    if (!params.from) {
      errors.push('From address is required');
    }

    if (!params.to) {
      errors.push('To address is required');
    }

    if (!params.amount) {
      errors.push('Amount is required');
    } else {
      const amount = Number(params.amount);
      if (isNaN(amount)) {
        errors.push('Amount must be a valid number');
      } else if (amount < 0) {
        errors.push('Amount must be a positive number');
      } else if (amount === 0) {
        errors.push('Amount must be greater than zero');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      operations: errors.length === 0 ? [{ type: 'transfer', ...params }] : []
    };
  }
} 