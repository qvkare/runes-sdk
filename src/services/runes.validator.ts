import { Logger, LogLevel } from '../utils/logger';
import { RPCClient } from '../utils/rpc.client';
import { ValidationResult, Transfer } from '../types';

export class RunesValidator implements Logger {
  constructor(
    private readonly rpcClient: RPCClient,
    private readonly logger: Logger
  ) {}

  // Logger interface implementation
  get level() { return this.logger.level; }
  get context() { return this.logger.context; }
  info(message: string) { this.logger.info(message); }
  warn(message: string) { this.logger.warn(message); }
  error(message: string) { this.logger.error(message); }
  debug(message: string) { this.logger.debug(message); }
  shouldLog(level: LogLevel) { return this.logger.shouldLog(level); }

  // Validation methods
  async validateAddress(address: string): Promise<ValidationResult> {
    try {
      const response = await this.rpcClient.call<{ isvalid: boolean }>('validateaddress', [address]);
      return { isValid: response.isvalid };
    } catch (error) {
      const errorMessage = `Failed to validate address: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.logger.error(errorMessage);
      return { isValid: false, error: errorMessage };
    }
  }

  async validateTransfer(params: Transfer): Promise<ValidationResult> {
    try {
      const [fromValid, toValid, runeValid] = await Promise.all([
        this.validateAddress(params.from),
        this.validateAddress(params.to),
        this.validateRuneExists(params.runeId)
      ]);

      if (!fromValid.isValid) {
        return { isValid: false, error: 'Invalid sender address' };
      }

      if (!toValid.isValid) {
        return { isValid: false, error: 'Invalid recipient address' };
      }

      if (!runeValid.isValid) {
        return { isValid: false, error: 'Invalid rune ID' };
      }

      if (params.amount <= 0) {
        return { isValid: false, error: 'Invalid amount' };
      }

      return { isValid: true };
    } catch (error) {
      const errorMessage = `Failed to validate transfer: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.logger.error(errorMessage);
      return { isValid: false, error: errorMessage };
    }
  }

  async validateAmount(amount: number): Promise<ValidationResult> {
    if (typeof amount !== 'number' || amount <= 0) {
      return { isValid: false, error: 'Invalid amount' };
    }
    return { isValid: true };
  }

  validateRuneId(runeId: string): ValidationResult {
    if (!runeId || typeof runeId !== 'string' || runeId.length !== 64) {
      return { isValid: false, error: 'Invalid rune ID format' };
    }
    return { isValid: true };
  }

  async validateRuneExists(runeId: string): Promise<ValidationResult> {
    try {
      const exists = await this.rpcClient.call<boolean>('runeexists', [runeId]);
      return { isValid: exists };
    } catch (error) {
      const errorMessage = `Failed to validate rune existence: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.logger.error(errorMessage);
      return { isValid: false, error: errorMessage };
    }
  }
} 