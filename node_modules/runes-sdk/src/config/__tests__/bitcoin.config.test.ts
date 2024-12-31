import { BitcoinConfig, defaultBitcoinConfig, validateBitcoinConfig } from '../bitcoin.config';

describe('Bitcoin Configuration', () => {
  const validConfig: BitcoinConfig = {
    rpcUrl: 'http://localhost:8332',
    network: 'regtest',
    username: 'test',
    password: 'test'
  };

  describe('defaultBitcoinConfig', () => {
    it('should have default timeout value', () => {
      expect(defaultBitcoinConfig.timeout).toBe(30000);
    });

    it('should have default maxRetries value', () => {
      expect(defaultBitcoinConfig.maxRetries).toBe(3);
    });
  });

  describe('validateBitcoinConfig', () => {
    it('should validate complete config', () => {
      const config = validateBitcoinConfig(validConfig);
      expect(config).toEqual({
        ...defaultBitcoinConfig,
        ...validConfig
      });
    });

    it('should throw error for missing rpcUrl', () => {
      const invalidConfig = { ...validConfig, rpcUrl: undefined };
      expect(() => validateBitcoinConfig(invalidConfig)).toThrow('Bitcoin RPC URL is required');
    });

    it('should throw error for missing network', () => {
      const invalidConfig = { ...validConfig, network: undefined };
      expect(() => validateBitcoinConfig(invalidConfig)).toThrow('Bitcoin network type is required');
    });

    it('should throw error for missing credentials', () => {
      const invalidConfig = { ...validConfig, username: undefined, password: undefined };
      expect(() => validateBitcoinConfig(invalidConfig)).toThrow('Bitcoin RPC credentials are required');
    });

    it('should merge default values with provided config', () => {
      const partialConfig = {
        rpcUrl: 'http://localhost:8332',
        network: 'regtest' as const,
        username: 'test',
        password: 'test'
      };

      const config = validateBitcoinConfig(partialConfig);
      expect(config.timeout).toBe(defaultBitcoinConfig.timeout);
      expect(config.maxRetries).toBe(defaultBitcoinConfig.maxRetries);
    });
  });
}); 