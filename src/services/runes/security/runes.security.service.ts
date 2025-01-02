import { RpcClient } from '../../../utils/rpc.client';
import { Logger } from '../../../types/logger.types';
import { Transaction } from '../../../types/transaction.types';

interface SecurityCheck {
  isValid: boolean;
  errors: string[];
}

export class RunesSecurityService {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly logger: Logger
  ) {}

  async verifyTransaction(txid: string): Promise<SecurityCheck> {
    try {
      const tx = await this.rpcClient.getTransaction(txid);
      const errors: string[] = [];

      // Check confirmations
      if (tx.confirmations < 6) {
        errors.push('Insufficient confirmations');
      }

      // Verify transaction signature
      const isValid = await this.rpcClient.validateTransaction(txid);
      if (!isValid) {
        errors.push('Invalid transaction signature');
      }

      // Check transaction size
      if (tx.size && tx.size > 100000) {
        errors.push('Transaction size too large');
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      this.logger.error(`Failed to verify transaction: ${error}`);
      throw error;
    }
  }

  async checkRuneSecurity(runeId: string): Promise<SecurityCheck> {
    try {
      const tx = await this.rpcClient.getTransaction(runeId);
      const errors: string[] = [];

      // Check if rune exists
      if (!tx) {
        errors.push('Rune not found');
      }

      // Check if rune is active
      if (tx && tx.type !== 'rune_create') {
        errors.push('Invalid rune type');
      }

      // Check if rune has sufficient confirmations
      if (tx && tx.confirmations < 100) {
        errors.push('Insufficient confirmations for rune');
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      this.logger.error(`Failed to check rune security: ${error}`);
      throw error;
    }
  }
}
