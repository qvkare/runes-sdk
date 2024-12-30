import { isValidBitcoinAddress } from '../utils/helpers';

describe('Helper Functions', () => {
  describe('isValidBitcoinAddress', () => {
    it('should validate correct Bitcoin addresses', () => {
      const validAddresses = [
        'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
        '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
        '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      ];

      validAddresses.forEach((address) => {
        expect(isValidBitcoinAddress(address)).toBe(true);
      });
    });

    it('should reject invalid Bitcoin addresses', () => {
      const invalidAddresses = [
        '',
        'invalid',
        'bc1invalid',
        '1234567890',
        'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4invalid',
        'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4!@#$%',
        '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2invalid',
        '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLyinvalid',
      ];

      for (const address of invalidAddresses) {
        const result = isValidBitcoinAddress(address);
        expect(result).toBe(false);
      }
    });
  });
});
