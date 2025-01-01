import { SecurityService } from '../security.service';
import { SecurityConfig } from '../../../types/security.types';
import { createMockLogger } from '../../../utils/test.utils';

describe('SecurityService', () => {
  let securityService: SecurityService;
  let mockLogger: ReturnType<typeof createMockLogger>;
  let config: SecurityConfig;

  beforeEach(() => {
    mockLogger = createMockLogger();
    config = {
      keyExpirationTime: 3600000, // 1 hour
      maxKeysPerUser: 5,
      maxKeyLength: 32,
      requireSignature: true,
      ipWhitelistEnabled: true,
    };
    securityService = new SecurityService(config, mockLogger);
  });

  describe('generateApiKey', () => {
    it('should generate a valid API key', async () => {
      const userId = 'test-user';
      const permissions = ['read', 'write'];

      const apiKey = await securityService.generateApiKey(userId, permissions);

      expect(apiKey).toBeDefined();
      expect(apiKey.userId).toBe(userId);
      expect(apiKey.permissions).toEqual(permissions);
      expect(apiKey.key).toBeDefined();
      expect(apiKey.id).toBeDefined();
      expect(apiKey.createdAt).toBeDefined();
      expect(apiKey.expiresAt).toBeDefined();
    });

    it('should throw error when user reaches key limit', async () => {
      const userId = 'test-user';

      // Generate maximum number of keys
      for (let i = 0; i < config.maxKeysPerUser; i++) {
        await securityService.generateApiKey(userId);
      }

      // Try to add one more
      await expect(securityService.generateApiKey(userId)).rejects.toThrow(
        `User ${userId} has reached maximum key limit`
      );
    });
  });

  describe('validateAPIKey', () => {
    it('should validate a valid API key', async () => {
      const apiKey = await securityService.generateApiKey('test-user');
      const isValid = securityService.validateAPIKey(apiKey.key);
      expect(isValid).toBe(true);
    });

    it('should reject an invalid API key', () => {
      const isValid = securityService.validateAPIKey('invalid-key');
      expect(isValid).toBe(false);
    });

    it('should reject an expired API key', async () => {
      // Temporarily reduce expiration time
      config.keyExpirationTime = -1;
      const apiKey = await securityService.generateApiKey('test-user');
      const isValid = securityService.validateAPIKey(apiKey.key);
      expect(isValid).toBe(false);
    });
  });

  describe('validateSignature', () => {
    it('should validate correct signature', () => {
      const payload = 'test-payload';
      const secret = 'test-secret';
      const signature = securityService['generateSignature'](payload, secret);

      const isValid = securityService.validateSignature(payload, signature, secret);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect signature', () => {
      const isValid = securityService.validateSignature(
        'test-payload',
        'wrong-signature',
        'test-secret'
      );
      expect(isValid).toBe(false);
    });

    it('should skip validation when not required', () => {
      config.requireSignature = false;
      const isValid = securityService.validateSignature(
        'test-payload',
        'wrong-signature',
        'test-secret'
      );
      expect(isValid).toBe(true);
    });
  });

  describe('validateIPAddress', () => {
    it('should validate whitelisted IP', () => {
      const whitelist = ['192.168.1.1', '10.0.0.1'];
      const isValid = securityService.validateIPAddress('192.168.1.1', whitelist);
      expect(isValid).toBe(true);
    });

    it('should reject non-whitelisted IP', () => {
      const whitelist = ['192.168.1.1', '10.0.0.1'];
      const isValid = securityService.validateIPAddress('192.168.1.2', whitelist);
      expect(isValid).toBe(false);
    });

    it('should skip validation when not enabled', () => {
      config.ipWhitelistEnabled = false;
      const whitelist = ['192.168.1.1'];
      const isValid = securityService.validateIPAddress('192.168.1.2', whitelist);
      expect(isValid).toBe(true);
    });
  });

  describe('key management', () => {
    it('should list user keys', async () => {
      const userId = 'test-user';
      await securityService.generateApiKey(userId);
      await securityService.generateApiKey(userId);

      const keys = securityService.getUserKeys(userId);
      expect(keys).toHaveLength(2);
      expect(keys[0].userId).toBe(userId);
      expect(keys[1].userId).toBe(userId);
    });

    it('should revoke key', async () => {
      const apiKey = await securityService.generateApiKey('test-user');
      expect(securityService.validateAPIKey(apiKey.key)).toBe(true);

      securityService.revokeKey(apiKey.id);
      expect(securityService.validateAPIKey(apiKey.key)).toBe(false);
    });

    it('should cleanup expired keys', async () => {
      // Temporarily reduce expiration time
      config.keyExpirationTime = -1;
      const apiKey = await securityService.generateApiKey('test-user');

      securityService.cleanupExpiredKeys();
      expect(securityService.validateAPIKey(apiKey.key)).toBe(false);
    });
  });
});
