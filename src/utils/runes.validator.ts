import { BitcoinCoreService } from '../services/bitcoin-core.service';
import { Logger } from './logger';
import { ValidationResult } from '../types/validation.types';
import { CreateRuneParams, TransferRuneParams } from '../types';
import { BatchOperation, BatchValidationResult } from '../types/batch.types';

export class RunesValidator {
  constructor(
    private readonly bitcoinCore: BitcoinCoreService,
    private readonly logger: Logger
  ) {}

  async validateRuneCreation(params: CreateRuneParams): Promise<ValidationResult> {
    try {
      if (!this.isValidSymbol(params.symbol)) {
        return {
          isValid: false,
          errors: ['Invalid rune symbol'],
        };
      }

      if (!this.isValidDecimals(params.decimals)) {
        return {
          isValid: false,
          errors: ['Invalid decimals'],
        };
      }

      if (!this.isValidSupply(params.supply)) {
        return {
          isValid: false,
          errors: ['Invalid supply'],
        };
      }

      if (!this.isValidLimit(params.limit)) {
        return {
          isValid: false,
          errors: ['Invalid limit'],
        };
      }

      return {
        isValid: true,
        errors: [],
      };
    } catch (error) {
      this.logger.error('Error validating rune creation:', error);
      return {
        isValid: false,
        errors: ['Failed to validate rune creation'],
      };
    }
  }

  async validateTransfer(params: TransferRuneParams): Promise<ValidationResult> {
    try {
      if (!this.isValidRuneId(params.runeId)) {
        return {
          isValid: false,
          errors: ['Invalid rune ID'],
        };
      }

      if (!this.isValidAmount(params.amount)) {
        return {
          isValid: false,
          errors: ['Invalid amount'],
        };
      }

      return {
        isValid: true,
        errors: [],
      };
    } catch (error) {
      this.logger.error('Error validating transfer:', error);
      return {
        isValid: false,
        errors: ['Failed to validate transfer'],
      };
    }
  }

  async validateRuneId(runeId: string): Promise<ValidationResult> {
    try {
      if (!this.isValidRuneId(runeId)) {
        return {
          isValid: false,
          errors: ['Invalid rune ID format'],
        };
      }

      return {
        isValid: true,
        errors: [],
      };
    } catch (error) {
      this.logger.error('Error validating rune ID:', error);
      return {
        isValid: false,
        errors: ['Failed to validate rune ID'],
      };
    }
  }

  async validateAddress(address: string): Promise<ValidationResult> {
    try {
      const isValid = await this.bitcoinCore.validateAddress(address);
      if (!isValid) {
        return {
          isValid: false,
          errors: ['Invalid address'],
        };
      }

      return {
        isValid: true,
        errors: [],
      };
    } catch (error) {
      this.logger.error('Error validating address:', error);
      return {
        isValid: false,
        errors: ['Failed to validate address'],
      };
    }
  }

  async validateRuneSymbol(symbol: string): Promise<ValidationResult> {
    try {
      if (!this.isValidSymbol(symbol)) {
        return {
          isValid: false,
          errors: ['Invalid rune symbol'],
        };
      }

      return {
        isValid: true,
        errors: [],
      };
    } catch (error) {
      this.logger.error('Error validating rune symbol:', error);
      return {
        isValid: false,
        errors: ['Failed to validate rune symbol'],
      };
    }
  }

  async validateRuneDecimals(decimals: number): Promise<ValidationResult> {
    try {
      if (!this.isValidDecimals(decimals)) {
        return {
          isValid: false,
          errors: ['Invalid decimals'],
        };
      }

      return {
        isValid: true,
        errors: [],
      };
    } catch (error) {
      this.logger.error('Error validating decimals:', error);
      return {
        isValid: false,
        errors: ['Failed to validate decimals'],
      };
    }
  }

  async validateRuneAmount(amount: number): Promise<ValidationResult> {
    try {
      if (!this.isValidAmount(amount)) {
        return {
          isValid: false,
          errors: ['Invalid amount'],
        };
      }

      return {
        isValid: true,
        errors: [],
      };
    } catch (error) {
      this.logger.error('Error validating amount:', error);
      return {
        isValid: false,
        errors: ['Failed to validate amount'],
      };
    }
  }

  async validateRuneTransaction(txId: string): Promise<ValidationResult> {
    try {
      const tx = await this.bitcoinCore.getRawTransaction(txId);
      if (!tx) {
        return {
          isValid: false,
          errors: ['Transaction not found'],
        };
      }

      return {
        isValid: true,
        errors: [],
      };
    } catch (error) {
      this.logger.error('Error validating transaction:', error);
      return {
        isValid: false,
        errors: ['Failed to validate transaction'],
      };
    }
  }

  async validateRuneSupply(supply: number): Promise<ValidationResult> {
    try {
      if (!this.isValidSupply(supply)) {
        return {
          isValid: false,
          errors: ['Invalid supply'],
        };
      }

      return {
        isValid: true,
        errors: [],
      };
    } catch (error) {
      this.logger.error('Error validating supply:', error);
      return {
        isValid: false,
        errors: ['Failed to validate supply'],
      };
    }
  }

  async validateRuneLimit(limit: number): Promise<ValidationResult> {
    try {
      if (!this.isValidLimit(limit)) {
        return {
          isValid: false,
          errors: ['Invalid limit'],
        };
      }

      return {
        isValid: true,
        errors: [],
      };
    } catch (error) {
      this.logger.error('Error validating limit:', error);
      return {
        isValid: false,
        errors: ['Failed to validate limit'],
      };
    }
  }

  async validateBatchOperation(operation: BatchOperation): Promise<BatchValidationResult> {
    const errors: string[] = [];

    if (!operation.id) {
      errors.push('Operation ID is required');
    }

    if (!operation.type) {
      errors.push('Operation type is required');
    }

    if (!operation.params) {
      errors.push('Operation params are required');
    }

    if (operation.type === 'create') {
      if (!operation.params.symbol) {
        errors.push('Symbol is required for create operation');
      }
      if (!operation.params.decimals) {
        errors.push('Decimals is required for create operation');
      }
      if (!operation.params.supply) {
        errors.push('Supply is required for create operation');
      }
      if (!operation.params.limit) {
        errors.push('Limit is required for create operation');
      }
    } else if (operation.type === 'transfer') {
      if (!operation.params.runeId) {
        errors.push('Rune ID is required for transfer operation');
      }
      if (!operation.params.amount) {
        errors.push('Amount is required for transfer operation');
      }
      if (!operation.params.fromAddress) {
        errors.push('From address is required for transfer operation');
      }
      if (!operation.params.toAddress) {
        errors.push('To address is required for transfer operation');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private isValidRuneId(runeId: string): boolean {
    return typeof runeId === 'string' && runeId.length === 64;
  }

  private isValidSymbol(symbol: string): boolean {
    return typeof symbol === 'string' && symbol.length > 0 && symbol.length <= 8;
  }

  private isValidDecimals(decimals: number): boolean {
    return Number.isInteger(decimals) && decimals >= 0 && decimals <= 18;
  }

  private isValidSupply(supply: number): boolean {
    return Number.isFinite(supply) && supply > 0;
  }

  private isValidLimit(limit: number): boolean {
    return Number.isFinite(limit) && limit > 0;
  }

  private isValidAmount(amount: number): boolean {
    return Number.isFinite(amount) && amount > 0;
  }
}
