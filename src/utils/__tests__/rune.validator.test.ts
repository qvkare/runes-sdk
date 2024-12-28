import { RuneValidator } from '../rune.validator';

describe('RuneValidator', () => {
  let validator: RuneValidator;

  beforeEach(() => {
    validator = new RuneValidator();
  });

  describe('validateTransfer', () => {
    it('should validate a valid transfer', async () => {
      const result = await validator.validateTransfer(
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Geçerli Bitcoin adresi
        '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX', // Geçerli Bitcoin adresi
        BigInt(1000)
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid sender address', async () => {
      const result = await validator.validateTransfer(
        'invalid-address',
        '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX',
        BigInt(1000)
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid sender address');
    });

    it('should reject invalid recipient address', async () => {
      const result = await validator.validateTransfer(
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        'invalid-address',
        BigInt(1000)
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid recipient address');
    });

    it('should reject invalid amount', async () => {
      const result = await validator.validateTransfer(
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX',
        BigInt(0)
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid amount');
    });

    it('should reject negative amount', async () => {
      const result = await validator.validateTransfer(
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX',
        BigInt(-1000)
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid amount');
    });

    it('should handle multiple validation errors', async () => {
      const result = await validator.validateTransfer(
        'invalid-sender',
        'invalid-recipient',
        BigInt(0)
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid sender address');
      expect(result.errors).toContain('Invalid recipient address');
      expect(result.errors).toContain('Invalid amount');
      expect(result.errors).toHaveLength(3);
    });

    it('should handle error during validation', async () => {
      // Mock internal validation işlemi
      jest.spyOn(validator as any, '_validateAddress').mockImplementationOnce(() => {
        throw new Error('Validation error');
      });

      await expect(validator.validateTransfer(
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX',
        BigInt(1000)
      )).rejects.toThrow('Validation error');
    });
  });
}); 