import { APISecurityService } from '../api.security.service';
import { createMockLogger } from '../../../utils/test.utils';
import { SecurityConfig } from '../../../types/security.types';
import { Logger } from '../../../types/logger.types';

describe('APISecurityService', () => {
  let service: APISecurityService;
  let mockLogger: jest.Mocked<Logger>;

  const mockConfig: SecurityConfig = {
    keyExpirationTime: 3600000, // 1 hour
    maxKeyLength: 32,
    maxKeysPerUser: 5,
    requireSignature: false,
    ipWhitelistEnabled: false,
  };

  beforeEach(() => {
    mockLogger = createMockLogger();
    service = new APISecurityService(mockConfig, mockLogger);
  });

  describe('generateAPIKey', () => {
    it('should generate valid API key', () => {
      const userId = 'test-user';
      const apiKey = service.generateAPIKey(userId);

      expect(apiKey.key).toHaveLength(mockConfig.maxKeyLength);
      expect(apiKey.userId).toBe(userId);
      expect(apiKey.isActive).toBe(true);
      expect(new Date(apiKey.expiresAt).getTime()).toBeGreaterThan(Date.now());
      expect(new Date(apiKey.expiresAt).getTime()).toBe(
        new Date(apiKey.createdAt).getTime() + mockConfig.keyExpirationTime
      );
    });

    it('should log key generation', () => {
      const userId = 'test-user';
      service.generateAPIKey(userId);
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(userId));
    });

    it('should enforce max keys per user limit', () => {
      const userId = 'test-user';

      // Generate max allowed keys
      for (let i = 0; i < mockConfig.maxKeysPerUser; i++) {
        service.generateAPIKey(userId);
      }

      // Try to generate one more key
      expect(() => service.generateAPIKey(userId)).toThrow(
        'Maximum number of API keys reached for user'
      );
    });
  });

  describe('validateAPIKey', () => {
    it('should validate active and non-expired key', () => {
      const userId = 'test-user';
      const apiKey = service.generateAPIKey(userId);

      const isValid = service.validateAPIKey(apiKey.key);
      expect(isValid).toBe(true);
    });

    it('should reject invalid key', () => {
      const isValid = service.validateAPIKey('invalid-key');
      expect(isValid).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should reject deactivated key', () => {
      const userId = 'test-user';
      const apiKey = service.generateAPIKey(userId);

      service.deactivateAPIKey(apiKey.key);
      const isValid = service.validateAPIKey(apiKey.key);

      expect(isValid).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should reject expired key', () => {
      const userId = 'test-user';
      const apiKey = service.generateAPIKey(userId);

      // Expire the key
      const expiredKey = {
        ...apiKey,
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      };
      (service as any).apiKeys.set(apiKey.key, expiredKey);

      const isValid = service.validateAPIKey(apiKey.key);
      expect(isValid).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('deactivateAPIKey', () => {
    it('should deactivate existing key', () => {
      const userId = 'test-user';
      const apiKey = service.generateAPIKey(userId);

      const result = service.deactivateAPIKey(apiKey.key);
      expect(result).toBe(true);
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should return false for non-existing key', () => {
      const result = service.deactivateAPIKey('non-existing-key');
      expect(result).toBe(false);
    });
  });
});
