import { encodeRuneData, decodeRuneData } from '../runes-encoding';

describe('Runes Encoding', () => {
  describe('encodeRuneData', () => {
    it('should encode mint data correctly', () => {
      const data = {
        type: 'mint' as const,
        symbol: 'TEST',
        amount: 1000,
        limit: 1000,
      };

      const encoded = encodeRuneData(data);
      expect(encoded).toBeDefined();
      expect(typeof encoded).toBe('string');
    });

    it('should encode transfer data correctly', () => {
      const data = {
        type: 'transfer' as const,
        symbol: 'TEST',
        amount: 100,
      };

      const encoded = encodeRuneData(data);
      expect(encoded).toBeDefined();
      expect(typeof encoded).toBe('string');
    });

    it('should handle optional limit parameter', () => {
      const data = {
        type: 'mint' as const,
        symbol: 'TEST',
        amount: 1000,
      };

      const encoded = encodeRuneData(data);
      expect(encoded).toBeDefined();
      expect(typeof encoded).toBe('string');
    });
  });

  describe('decodeRuneData', () => {
    it('should decode mint data correctly', () => {
      const original = {
        type: 'mint' as const,
        symbol: 'TEST',
        amount: 1000,
        limit: 1000,
      };

      const encoded = encodeRuneData(original);
      const decoded = decodeRuneData(encoded);

      expect(decoded).toEqual(original);
    });

    it('should decode transfer data correctly', () => {
      const original = {
        type: 'transfer' as const,
        symbol: 'TEST',
        amount: 100,
      };

      const encoded = encodeRuneData(original);
      const decoded = decodeRuneData(encoded);

      expect(decoded).toEqual(original);
    });

    it('should handle invalid encoded data', () => {
      expect(() => decodeRuneData('invalid-data')).toThrow();
    });

    it('should handle all rune data fields', () => {
      const data = {
        type: 'mint' as const,
        symbol: 'TEST',
        amount: 1000,
        limit: 1000,
      };

      const encoded = encodeRuneData(data);
      const decoded = decodeRuneData(encoded);

      expect(decoded.type).toBe(data.type);
      expect(decoded.symbol).toBe(data.symbol);
      expect(decoded.amount).toBe(data.amount);
      expect(decoded.limit).toBe(data.limit);
    });
  });
});
