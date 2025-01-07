import { SDKConfig } from '../types';

export class ConfigValidator {
  validateConfig(config: SDKConfig): void {
    if (!config) {
      throw new Error('Configuration is required');
    }

    if (!config.host) {
      throw new Error('RPC host is required');
    }

    if (!config.username) {
      throw new Error('RPC username is required');
    }

    if (!config.password) {
      throw new Error('RPC password is required');
    }

    if (config.rateLimitConfig) {
      this.validateRateLimitConfig(config.rateLimitConfig);
    }

    if (config.validationConfig) {
      this.validateValidationConfig(config.validationConfig);
    }
  }

  private validateRateLimitConfig(config: any): void {
    if (config.maxRequestsPerMinute && typeof config.maxRequestsPerMinute !== 'number') {
      throw new Error('maxRequestsPerMinute must be a number');
    }

    if (config.maxRequestsPerHour && typeof config.maxRequestsPerHour !== 'number') {
      throw new Error('maxRequestsPerHour must be a number');
    }

    if (config.maxRequestsPerDay && typeof config.maxRequestsPerDay !== 'number') {
      throw new Error('maxRequestsPerDay must be a number');
    }
  }

  private validateValidationConfig(config: any): void {
    if (config.maxTransactionSize && typeof config.maxTransactionSize !== 'number') {
      throw new Error('maxTransactionSize must be a number');
    }

    if (config.requiredConfirmations && typeof config.requiredConfirmations !== 'number') {
      throw new Error('requiredConfirmations must be a number');
    }

    if (config.validateSignatures && typeof config.validateSignatures !== 'boolean') {
      throw new Error('validateSignatures must be a boolean');
    }

    if (config.validateFees && typeof config.validateFees !== 'boolean') {
      throw new Error('validateFees must be a boolean');
    }

    if (config.minFee && typeof config.minFee !== 'number') {
      throw new Error('minFee must be a number');
    }
  }
}
