import { SecurityConfig, APIKey, SecurityValidation } from '../../types/security.types';
import { Logger } from '../../types/logger.types';
import { createHmac, randomBytes } from 'crypto';
import { KeyStore } from './key.store';

export class SecurityService implements SecurityValidation {
  private readonly keyStore: KeyStore;

  constructor(
    private readonly config: SecurityConfig,
    private readonly logger: Logger
  ) {
    this.keyStore = new KeyStore(logger);
  }

  async generateApiKey(userId: string, permissions: string[] = []): Promise<APIKey> {
    // Check user's current key count
    if (!(await this.checkUserKeyLimit(userId))) {
      throw new Error(`User ${userId} has reached maximum key limit`);
    }

    // Generate new API key and secret
    const key = randomBytes(32).toString('hex');
    const id = randomBytes(16).toString('hex');

    const apiKey: APIKey = {
      id,
      key,
      userId,
      permissions,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.config.keyExpirationTime).toISOString(),
      isActive: true,
    };

    // Save to KeyStore
    this.keyStore.addKey(apiKey);
    this.logger.info(`Generated new API key for user: ${userId}`);

    return apiKey;
  }

  validateAPIKey(key: string): boolean {
    if (!key) {
      this.logger.warn('API key is required');
      return false;
    }

    const apiKey = this.getApiKeyInfo(key);
    if (!apiKey) {
      this.logger.warn(`Invalid API key: ${key}`);
      return false;
    }

    if (!this.keyStore.isKeyValid(apiKey.id)) {
      this.logger.warn(`Expired or invalid API key: ${key}`);
      return false;
    }

    return true;
  }

  validateSignature(payload: string, signature: string, secret: string): boolean {
    if (!this.config.requireSignature) {
      return true;
    }

    const computedSignature = this.generateSignature(payload, secret);
    return signature === computedSignature;
  }

  validateIPAddress(ipAddress: string, whitelist?: string[]): boolean {
    if (!this.config.ipWhitelistEnabled || !whitelist || whitelist.length === 0) {
      return true;
    }

    return whitelist.includes(ipAddress);
  }

  private generateSignature(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('hex');
  }

  private getApiKeyInfo(key: string): APIKey | undefined {
    // Get all active keys and find the matching one
    return this.keyStore.getActiveKeys().find(apiKey => apiKey.key === key);
  }

  private async checkUserKeyLimit(userId: string): Promise<boolean> {
    const userKeys = this.keyStore.getActiveKeys().filter(key => key.userId === userId);
    return userKeys.length < this.config.maxKeysPerUser;
  }

  // Helper methods
  cleanupExpiredKeys(): void {
    this.keyStore.cleanupExpiredKeys();
  }

  getUserKeys(userId: string): APIKey[] {
    return this.keyStore.getActiveKeys().filter(key => key.userId === userId);
  }

  revokeKey(keyId: string): void {
    this.keyStore.removeKey(keyId);
    this.logger.info(`Revoked API key: ${keyId}`);
  }
}
