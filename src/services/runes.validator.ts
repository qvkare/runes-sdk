import { BitcoinCoreService } from './bitcoin-core.service';
import { Logger } from '../utils/logger';
import { CreateRuneParams, TransferRuneParams, ValidationResult } from '../types';
import { RunesError } from '../errors';

export class RunesValidator {
  constructor(
    private readonly bitcoinCore: BitcoinCoreService,
    private readonly logger: Logger
  ) {}

  async validateRuneCreation(params: CreateRuneParams): Promise<ValidationResult> {
    try {
      const errors: string[] = [];

      if (!this.isValidSymbol(params.symbol)) {
        errors.push('Invalid symbol format');
      }

      if (!this.isValidDecimals(params.decimals)) {
        errors.push('Invalid decimals value');
      }

      if (!this.isValidSupply(params.supply)) {
        errors.push('Invalid supply value');
      }

      if (params.limit !== undefined && !this.isValidLimit(params.limit)) {
        errors.push('Invalid limit value');
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      this.logger.error(`Failed to validate rune creation: ${error}`);
      throw new RunesError(`Failed to validate rune creation: ${error}`, 'VALIDATION_ERROR');
    }
  }

  async validateTransfer(params: TransferRuneParams): Promise<ValidationResult> {
    try {
      const errors: string[] = [];

      if (!this.isValidRuneId(params.runeId)) {
        errors.push('Invalid rune ID format');
      }

      if (!this.isValidAmount(params.amount)) {
        errors.push('Invalid amount value');
      }

      const isValidAddress = await this.bitcoinCore.validateAddress(params.recipient);
      if (!isValidAddress) {
        errors.push('Invalid recipient address');
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      this.logger.error(`Failed to validate transfer: ${error}`);
      throw new RunesError(`Failed to validate transfer: ${error}`, 'VALIDATION_ERROR');
    }
  }

  async validateRuneId(runeId: string): Promise<ValidationResult> {
    try {
      const errors: string[] = [];

      if (!this.isValidRuneId(runeId)) {
        errors.push('Invalid rune ID format');
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      this.logger.error(`Failed to validate rune ID: ${error}`);
      throw new RunesError(`Failed to validate rune ID: ${error}`, 'VALIDATION_ERROR');
    }
  }

  async validateAddress(address: string): Promise<ValidationResult> {
    try {
      const errors: string[] = [];

      const isValid = await this.bitcoinCore.validateAddress(address);
      if (!isValid) {
        errors.push('Invalid Bitcoin address');
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      this.logger.error(`Failed to validate address: ${error}`);
      throw new RunesError(`Failed to validate address: ${error}`, 'VALIDATION_ERROR');
    }
  }

  private isValidSymbol(symbol: string): boolean {
    return /^[A-Z0-9]{1,8}$/.test(symbol);
  }

  private isValidDecimals(decimals: number): boolean {
    return Number.isInteger(decimals) && decimals >= 0 && decimals <= 8;
  }

  private isValidSupply(supply: number): boolean {
    return Number.isFinite(supply) && supply > 0;
  }

  private isValidLimit(limit: number): boolean {
    return Number.isFinite(limit) && limit > 0;
  }

  private isValidRuneId(runeId: string): boolean {
    return /^[a-zA-Z0-9]{1,64}$/.test(runeId);
  }

  private isValidAmount(amount: number): boolean {
    return Number.isFinite(amount) && amount > 0;
  }
}
