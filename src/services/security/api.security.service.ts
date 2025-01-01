import { SecurityConfig, APIKey } from '../../types/security.types';
import { Logger } from '../../types/logger.types';

export class APISecurityService {
  private apiKeys: Map<string, APIKey> = new Map();
  private userKeyCount: Map<string, number> = new Map();

  constructor(
    private readonly config: SecurityConfig,
    private readonly logger: Logger
  ) {}

  generateAPIKey(userId: string): APIKey {
    // Check max keys per user limit
    const currentCount = this.userKeyCount.get(userId) || 0;
    if (currentCount >= this.config.maxKeysPerUser) {
      throw new Error('Maximum number of API keys reached for user');
    }

    const key = this.generateRandomKey();
    const now = Date.now();
    const createdAt = new Date(now).toISOString();
    const expiresAt = new Date(now + this.config.keyExpirationTime).toISOString();

    const apiKey: APIKey = {
      id: `${userId}-${now}`,
      key,
      userId,
      createdAt,
      expiresAt,
      isActive: true,
    };

    this.apiKeys.set(key, apiKey);
    this.userKeyCount.set(userId, currentCount + 1);
    this.logger.info(`API key generated for user: ${userId}`);
    return apiKey;
  }

  validateAPIKey(key: string): boolean {
    const apiKey = this.apiKeys.get(key);
    if (!apiKey) {
      this.logger.warn(`Invalid API key attempt: ${key}`);
      return false;
    }

    if (!apiKey.isActive) {
      this.logger.warn(`Inactive API key used: ${key}`);
      return false;
    }

    if (new Date(apiKey.expiresAt) < new Date()) {
      this.logger.warn(`Expired API key used: ${key}`);
      return false;
    }

    return true;
  }

  deactivateAPIKey(key: string): boolean {
    const apiKey = this.apiKeys.get(key);
    if (apiKey) {
      apiKey.isActive = false;
      this.apiKeys.set(key, apiKey);

      // Decrease user key count
      const currentCount = this.userKeyCount.get(apiKey.userId) || 0;
      this.userKeyCount.set(apiKey.userId, Math.max(0, currentCount - 1));

      this.logger.info(`API key deactivated: ${key}`);
      return true;
    }
    return false;
  }

  private generateRandomKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < this.config.maxKeyLength; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }
}
