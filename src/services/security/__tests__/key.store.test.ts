import { KeyStore } from '../key.store';
import { APIKey } from '../../../types/security.types';
import { createMockLogger } from '../../../utils/test.utils';

describe('KeyStore', () => {
  let keyStore: KeyStore;
  const mockLogger = createMockLogger();

  beforeEach(() => {
    keyStore = new KeyStore(mockLogger);
  });

  const createMockKey = (id: string, expiresAt: number | string = Date.now() + 3600000): APIKey => ({
    id,
    key: 'test-key',
    userId: 'test-user',
    createdAt: Date.now(),
    expiresAt,
    isActive: true
  });

  describe('key management', () => {
    it('should add and get key', () => {
      const mockKey = createMockKey('key1');
      keyStore.addKey(mockKey);
      expect(keyStore.getKey('key1')).toEqual(mockKey);
    });

    it('should return undefined for non-existent key', () => {
      expect(keyStore.getKey('non-existent')).toBeUndefined();
    });

    it('should remove key', () => {
      const mockKey = createMockKey('key2');
      keyStore.addKey(mockKey);
      keyStore.removeKey('key2');
      expect(keyStore.getKey('key2')).toBeUndefined();
    });

    it('should handle removing non-existent key', () => {
      expect(() => keyStore.removeKey('non-existent')).not.toThrow();
    });
  });

  describe('key validation', () => {
    it('should validate existing non-expired key', () => {
      const mockKey = createMockKey('key3');
      keyStore.addKey(mockKey);
      expect(keyStore.isKeyValid('key3')).toBe(true);
    });

    it('should invalidate non-existent key', () => {
      expect(keyStore.isKeyValid('non-existent')).toBe(false);
    });

    it('should invalidate expired key with numeric expiration', () => {
      const mockKey = createMockKey('key4', Date.now() - 1000);
      keyStore.addKey(mockKey);
      expect(keyStore.isKeyValid('key4')).toBe(false);
    });

    it('should invalidate expired key with string expiration', () => {
      const mockKey = createMockKey('key5', new Date(Date.now() - 1000).toISOString());
      keyStore.addKey(mockKey);
      expect(keyStore.isKeyValid('key5')).toBe(false);
    });
  });

  describe('key cleanup', () => {
    it('should cleanup expired keys with numeric expiration', () => {
      const expiredKey = createMockKey('key6', Date.now() - 1000);
      const validKey = createMockKey('key7', Date.now() + 3600000);
      keyStore.addKey(expiredKey);
      keyStore.addKey(validKey);

      keyStore.cleanupExpiredKeys();

      expect(keyStore.getKey('key6')).toBeUndefined();
      expect(keyStore.getKey('key7')).toBeDefined();
      expect(mockLogger.debug).toHaveBeenCalledWith('Removed expired key: key6');
    });

    it('should cleanup expired keys with string expiration', () => {
      const expiredKey = createMockKey('key8', new Date(Date.now() - 1000).toISOString());
      const validKey = createMockKey('key9', new Date(Date.now() + 3600000).toISOString());
      keyStore.addKey(expiredKey);
      keyStore.addKey(validKey);

      keyStore.cleanupExpiredKeys();

      expect(keyStore.getKey('key8')).toBeUndefined();
      expect(keyStore.getKey('key9')).toBeDefined();
      expect(mockLogger.debug).toHaveBeenCalledWith('Removed expired key: key8');
    });
  });

  describe('key listing', () => {
    it('should get all keys', () => {
      const key1 = createMockKey('key10');
      const key2 = createMockKey('key11');
      keyStore.addKey(key1);
      keyStore.addKey(key2);

      const allKeys = keyStore.getAllKeys();
      expect(allKeys).toHaveLength(2);
      expect(allKeys).toContainEqual(key1);
      expect(allKeys).toContainEqual(key2);
    });

    it('should get only active keys', () => {
      const expiredKey = createMockKey('key12', Date.now() - 1000);
      const validKey = createMockKey('key13', Date.now() + 3600000);
      keyStore.addKey(expiredKey);
      keyStore.addKey(validKey);

      const activeKeys = keyStore.getActiveKeys();
      expect(activeKeys).toHaveLength(1);
      expect(activeKeys[0]).toEqual(validKey);
    });

    it('should handle string expiration dates in active keys', () => {
      const expiredKey = createMockKey('key14', new Date(Date.now() - 1000).toISOString());
      const validKey = createMockKey('key15', new Date(Date.now() + 3600000).toISOString());
      keyStore.addKey(expiredKey);
      keyStore.addKey(validKey);

      const activeKeys = keyStore.getActiveKeys();
      expect(activeKeys).toHaveLength(1);
      expect(activeKeys[0]).toEqual(validKey);
    });
  });
}); 