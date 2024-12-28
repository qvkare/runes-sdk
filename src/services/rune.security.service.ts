import { Logger } from '../utils/logger';
import { RuneTransfer } from '../types';

interface SecurityConfig {
  maxTransferAmount: number;
  maxBlockUsage: number;
  blacklistedAddresses: string[];
  allowedAddresses: string[];
}

interface SecurityCheck {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface TransferRisk {
  level: 'low' | 'medium' | 'high';
  factors: string[];
  recommendations?: string[];
}

/**
 * Service for handling security related operations for Rune transactions
 */
export class RuneSecurityService {
  private logger: Logger;
  private config: SecurityConfig;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.logger = new Logger('RuneSecurityService');
    this.config = {
      maxTransferAmount: config.maxTransferAmount || 1000000,
      maxBlockUsage: config.maxBlockUsage || 0.75,
      blacklistedAddresses: config.blacklistedAddresses || [],
      allowedAddresses: config.allowedAddresses || []
    };
  }

  /**
   * Validates a transfer request against security rules
   * @param transfer The transfer request to validate
   * @returns Validation result with status and any errors/warnings
   */
  async validateTransfer(transfer: RuneTransfer): Promise<SecurityCheck> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check transfer amount
    const amount = parseInt(transfer.amount);
    if (amount > this.config.maxTransferAmount) {
      errors.push(`Transfer amount exceeds maximum limit of ${this.config.maxTransferAmount}`);
    }

    // Check addresses
    try {
      await Promise.all([
        this._validateAddress(transfer.from),
        this._validateAddress(transfer.to)
      ]);
    } catch (error) {
      if (error instanceof Error) {
        errors.push(`Invalid address: ${error.message}`);
      } else {
        errors.push('Invalid address: Unknown error');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Assesses the risk level of addresses involved in a transfer
   * @param from Source address
   * @param to Destination address
   * @returns Risk assessment result
   */
  public async assessAddressRisk(from: string, to: string): Promise<TransferRisk> {
    const factors: string[] = [];
    let level: 'low' | 'medium' | 'high' = 'low';

    // Check address age and transaction history
    const fromAge = await this._getAddressAge(from);
    const toAge = await this._getAddressAge(to);

    if (fromAge < 7 || toAge < 7) {
      level = 'high';
      factors.push('New address with limited history');
    } else if (fromAge < 30 || toAge < 30) {
      level = 'medium';
      factors.push('Address has moderate history');
    }

    return {
      level,
      factors,
      recommendations: this._getRecommendations(level)
    };
  }

  private _getRecommendations(riskLevel: 'low' | 'medium' | 'high'): string[] {
    switch (riskLevel) {
      case 'high':
        return [
          'Wait for more transaction history',
          'Start with small amounts',
          'Verify address ownership'
        ];
      case 'medium':
        return [
          'Monitor transaction patterns',
          'Consider transaction limits'
        ];
      case 'low':
        return [];
    }
  }

  private async _validateAddress(address: string): Promise<boolean> {
    // Mock implementation
    if (address === 'invalid') {
      throw new Error(`Invalid address format: ${address}`);
    }
    return true;
  }

  private async _getAddressAge(address: string): Promise<number> {
    // Mock implementation
    if (address.includes('new')) {
      return 1; // 1 day old
    } else if (address.includes('medium')) {
      return 15; // 15 days old
    }
    return 100; // 100 days old
  }
} 