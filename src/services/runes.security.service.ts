import { BitcoinCoreService } from './bitcoin-core.service';
import { CreateRuneParams, TransferRuneParams, ValidationResult } from '../types';
import { Logger } from '../utils/logger';
import { RPCClient } from '../utils/rpc-client';
import { RunesValidator } from '../utils/runes-validator';

export class RunesSecurityService {
  constructor(
    private readonly rpcClient: RPCClient,
    private readonly validator: RunesValidator,
    private readonly bitcoinCore: BitcoinCoreService,
    private readonly logger: Logger
  ) {}

  async validateRuneCreation(params: CreateRuneParams): Promise<ValidationResult> {
    const errors: string[] = [];

    if (!this.isValidSymbol(params.symbol)) {
      errors.push('Invalid symbol');
    }

    if (!this.isValidDecimals(params.decimals)) {
      errors.push('Invalid decimals');
    }

    if (!this.isValidSupply(params.supply)) {
      errors.push('Invalid supply');
    }

    if (!this.isValidLimit(params.limit)) {
      errors.push('Invalid limit');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async validateRuneTransfer(params: TransferRuneParams): Promise<ValidationResult> {
    const errors: string[] = [];

    if (!(await this.isValidRuneId(params.runeId))) {
      errors.push('Invalid rune ID');
    }

    if (!this.isValidAmount(params.amount)) {
      errors.push('Invalid amount');
    }

    if (!(await this.bitcoinCore.validateAddress(params.recipient))) {
      errors.push('Invalid recipient address');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private isValidSymbol(symbol: string): boolean {
    return /^[A-Z0-9]{1,8}$/.test(symbol);
  }

  private isValidDecimals(decimals: number): boolean {
    return Number.isInteger(decimals) && decimals >= 0 && decimals <= 8;
  }

  private isValidSupply(supply: number): boolean {
    return Number.isInteger(supply) && supply > 0;
  }

  private isValidLimit(limit: number): boolean {
    return Number.isInteger(limit) && limit > 0;
  }

  private isValidAmount(amount: number): boolean {
    return Number.isInteger(amount) && amount > 0;
  }

  private async isValidRuneId(runeId: string): Promise<boolean> {
    try {
      const tx = await this.bitcoinCore.getRawTransaction(runeId);
      return !!tx;
    } catch {
      return false;
    }
  }
}
