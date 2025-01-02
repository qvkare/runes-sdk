import { validateRuneTransfer } from '../runes.validator';
import { RuneTransfer } from '../../types/rune.types';

describe('RunesValidator', () => {
  describe('validateRuneTransfer', () => {
    let validTransfer: RuneTransfer;

    beforeEach(() => {
      validTransfer = {
        sender: 'sender-address',
        recipient: 'recipient-address',
        amount: '100',
        runeId: 'rune-123',
      };
    });

    describe('input validation', () => {
      it('should throw error when params is null', () => {
        expect(() => validateRuneTransfer(null as any)).toThrow('Invalid transfer parameters');
      });

      it('should throw error when params is undefined', () => {
        expect(() => validateRuneTransfer(undefined as any)).toThrow('Invalid transfer parameters');
      });

      it('should throw error when params is not an object', () => {
        expect(() => validateRuneTransfer('not-an-object' as any)).toThrow(
          'Invalid transfer parameters'
        );
        expect(() => validateRuneTransfer(123 as any)).toThrow('Invalid transfer parameters');
        expect(() => validateRuneTransfer(true as any)).toThrow('Invalid transfer parameters');
        expect(() => validateRuneTransfer([] as any)).toThrow('Invalid transfer parameters');
        expect(() => validateRuneTransfer((() => {}) as any)).toThrow(
          'Invalid transfer parameters'
        );
        expect(() => validateRuneTransfer(new Date() as any)).toThrow(
          'Invalid transfer parameters'
        );
        expect(() => validateRuneTransfer(Symbol() as any)).toThrow('Invalid transfer parameters');
        expect(() => validateRuneTransfer(new Map() as any)).toThrow('Invalid transfer parameters');
        expect(() => validateRuneTransfer(new Set() as any)).toThrow('Invalid transfer parameters');
        expect(() => validateRuneTransfer(Object.create(null) as any)).toThrow(
          'Invalid transfer parameters'
        );
      });
    });

    describe('sender validation', () => {
      it('should throw error when sender is missing', () => {
        const { sender, ...transferWithoutSender } = validTransfer;
        expect(() => validateRuneTransfer(transferWithoutSender as RuneTransfer)).toThrow(
          'Sender address is required'
        );
      });

      it('should throw error when sender is empty string', () => {
        expect(() => validateRuneTransfer({ ...validTransfer, sender: '' })).toThrow(
          'Sender address is required'
        );
      });

      it('should throw error when sender is whitespace', () => {
        expect(() => validateRuneTransfer({ ...validTransfer, sender: '   ' })).toThrow(
          'Sender address is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, sender: '\\t\\n' })).toThrow(
          'Sender address is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, sender: ' \\r\\n\\t ' })).toThrow(
          'Sender address is required'
        );
        expect(() =>
          validateRuneTransfer({ ...validTransfer, sender: String.fromCharCode(9, 10, 13, 32) })
        ).toThrow('Sender address is required');
      });

      it('should throw error when sender is not a string', () => {
        expect(() => validateRuneTransfer({ ...validTransfer, sender: 123 } as any)).toThrow(
          'Sender address is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, sender: true } as any)).toThrow(
          'Sender address is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, sender: {} } as any)).toThrow(
          'Sender address is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, sender: [] } as any)).toThrow(
          'Sender address is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, sender: null } as any)).toThrow(
          'Sender address is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, sender: undefined } as any)).toThrow(
          'Sender address is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, sender: new Date() } as any)).toThrow(
          'Sender address is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, sender: Symbol() } as any)).toThrow(
          'Sender address is required'
        );
        expect(() =>
          validateRuneTransfer({ ...validTransfer, sender: Object.create(null) } as any)
        ).toThrow('Sender address is required');
      });

      it('should accept valid sender address', () => {
        expect(validateRuneTransfer({ ...validTransfer, sender: 'valid-sender-address' })).toBe(
          true
        );
      });
    });

    describe('recipient validation', () => {
      it('should throw error when recipient is missing', () => {
        const { recipient, ...transferWithoutRecipient } = validTransfer;
        expect(() => validateRuneTransfer(transferWithoutRecipient as RuneTransfer)).toThrow(
          'Recipient address is required'
        );
      });

      it('should throw error when recipient is empty string', () => {
        expect(() => validateRuneTransfer({ ...validTransfer, recipient: '' })).toThrow(
          'Recipient address is required'
        );
      });

      it('should throw error when recipient is whitespace', () => {
        expect(() => validateRuneTransfer({ ...validTransfer, recipient: '   ' })).toThrow(
          'Recipient address is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, recipient: '\\t\\n' })).toThrow(
          'Recipient address is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, recipient: ' \\r\\n\\t ' })).toThrow(
          'Recipient address is required'
        );
        expect(() =>
          validateRuneTransfer({ ...validTransfer, recipient: String.fromCharCode(9, 10, 13, 32) })
        ).toThrow('Recipient address is required');
      });

      it('should throw error when recipient is not a string', () => {
        expect(() => validateRuneTransfer({ ...validTransfer, recipient: 123 } as any)).toThrow(
          'Recipient address is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, recipient: true } as any)).toThrow(
          'Recipient address is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, recipient: {} } as any)).toThrow(
          'Recipient address is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, recipient: [] } as any)).toThrow(
          'Recipient address is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, recipient: null } as any)).toThrow(
          'Recipient address is required'
        );
        expect(() =>
          validateRuneTransfer({ ...validTransfer, recipient: undefined } as any)
        ).toThrow('Recipient address is required');
        expect(() =>
          validateRuneTransfer({ ...validTransfer, recipient: new Date() } as any)
        ).toThrow('Recipient address is required');
        expect(() =>
          validateRuneTransfer({ ...validTransfer, recipient: Symbol() } as any)
        ).toThrow('Recipient address is required');
        expect(() =>
          validateRuneTransfer({ ...validTransfer, recipient: Object.create(null) } as any)
        ).toThrow('Recipient address is required');
      });

      it('should accept valid recipient address', () => {
        expect(
          validateRuneTransfer({ ...validTransfer, recipient: 'valid-recipient-address' })
        ).toBe(true);
      });
    });

    describe('amount validation', () => {
      it('should throw error when amount is missing', () => {
        const { amount, ...transferWithoutAmount } = validTransfer;
        expect(() => validateRuneTransfer(transferWithoutAmount as RuneTransfer)).toThrow(
          'Valid amount is required'
        );
      });

      it('should throw error when amount is empty string', () => {
        expect(() => validateRuneTransfer({ ...validTransfer, amount: '' })).toThrow(
          'Valid amount is required'
        );
      });

      it('should throw error when amount is whitespace', () => {
        expect(() => validateRuneTransfer({ ...validTransfer, amount: '   ' })).toThrow(
          'Valid amount is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, amount: '\\t\\n' })).toThrow(
          'Valid amount is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, amount: ' \\r\\n\\t ' })).toThrow(
          'Valid amount is required'
        );
        expect(() =>
          validateRuneTransfer({ ...validTransfer, amount: String.fromCharCode(9, 10, 13, 32) })
        ).toThrow('Valid amount is required');
      });

      it('should throw error when amount is not a string', () => {
        expect(() => validateRuneTransfer({ ...validTransfer, amount: 123 } as any)).toThrow(
          'Valid amount is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, amount: true } as any)).toThrow(
          'Valid amount is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, amount: {} } as any)).toThrow(
          'Valid amount is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, amount: [] } as any)).toThrow(
          'Valid amount is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, amount: null } as any)).toThrow(
          'Valid amount is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, amount: undefined } as any)).toThrow(
          'Valid amount is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, amount: new Date() } as any)).toThrow(
          'Valid amount is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, amount: Symbol() } as any)).toThrow(
          'Valid amount is required'
        );
        expect(() =>
          validateRuneTransfer({ ...validTransfer, amount: Object.create(null) } as any)
        ).toThrow('Valid amount is required');
      });

      it('should throw error when amount is not a valid number', () => {
        expect(() => validateRuneTransfer({ ...validTransfer, amount: 'not-a-number' })).toThrow(
          'Valid amount is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, amount: 'abc123' })).toThrow(
          'Valid amount is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, amount: '12.34.56' })).toThrow(
          'Valid amount is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, amount: 'Infinity' })).toThrow(
          'Valid amount is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, amount: '-Infinity' })).toThrow(
          'Valid amount is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, amount: 'NaN' })).toThrow(
          'Valid amount is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, amount: '1e+308' })).toThrow(
          'Valid amount is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, amount: '1.2.3e+4' })).toThrow(
          'Valid amount is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, amount: '0x123' })).toThrow(
          'Valid amount is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, amount: '1,234.56' })).toThrow(
          'Valid amount is required'
        );
      });

      it('should accept valid numeric amounts', () => {
        expect(validateRuneTransfer({ ...validTransfer, amount: '100' })).toBe(true);
        expect(validateRuneTransfer({ ...validTransfer, amount: '0' })).toBe(true);
        expect(validateRuneTransfer({ ...validTransfer, amount: '123.45' })).toBe(true);
        expect(validateRuneTransfer({ ...validTransfer, amount: '-100' })).toBe(true);
      });
    });

    describe('runeId validation', () => {
      it('should throw error when runeId is missing', () => {
        const { runeId, ...transferWithoutRuneId } = validTransfer;
        expect(() => validateRuneTransfer(transferWithoutRuneId as RuneTransfer)).toThrow(
          'Rune identifier is required'
        );
      });

      it('should throw error when runeId is empty string', () => {
        expect(() => validateRuneTransfer({ ...validTransfer, runeId: '' })).toThrow(
          'Rune identifier is required'
        );
      });

      it('should throw error when runeId is whitespace', () => {
        expect(() => validateRuneTransfer({ ...validTransfer, runeId: '   ' })).toThrow(
          'Rune identifier is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, runeId: '\\t\\n' })).toThrow(
          'Rune identifier is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, runeId: ' \\r\\n\\t ' })).toThrow(
          'Rune identifier is required'
        );
        expect(() =>
          validateRuneTransfer({ ...validTransfer, runeId: String.fromCharCode(9, 10, 13, 32) })
        ).toThrow('Rune identifier is required');
      });

      it('should throw error when runeId is not a string', () => {
        expect(() => validateRuneTransfer({ ...validTransfer, runeId: 123 } as any)).toThrow(
          'Rune identifier is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, runeId: true } as any)).toThrow(
          'Rune identifier is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, runeId: {} } as any)).toThrow(
          'Rune identifier is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, runeId: [] } as any)).toThrow(
          'Rune identifier is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, runeId: null } as any)).toThrow(
          'Rune identifier is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, runeId: undefined } as any)).toThrow(
          'Rune identifier is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, runeId: new Date() } as any)).toThrow(
          'Rune identifier is required'
        );
        expect(() => validateRuneTransfer({ ...validTransfer, runeId: Symbol() } as any)).toThrow(
          'Rune identifier is required'
        );
        expect(() =>
          validateRuneTransfer({ ...validTransfer, runeId: Object.create(null) } as any)
        ).toThrow('Rune identifier is required');
      });

      it('should accept valid runeId', () => {
        expect(validateRuneTransfer({ ...validTransfer, runeId: 'valid-rune-id' })).toBe(true);
      });
    });

    describe('valid cases', () => {
      it('should return true for valid transfer', () => {
        expect(validateRuneTransfer(validTransfer)).toBe(true);
      });

      it('should return true for valid transfer with numeric amount', () => {
        expect(validateRuneTransfer({ ...validTransfer, amount: '123.45' })).toBe(true);
        expect(validateRuneTransfer({ ...validTransfer, amount: '1000' })).toBe(true);
        expect(validateRuneTransfer({ ...validTransfer, amount: '0.01' })).toBe(true);
        expect(validateRuneTransfer({ ...validTransfer, amount: '0' })).toBe(true);
        expect(validateRuneTransfer({ ...validTransfer, amount: '-123.45' })).toBe(true);
        expect(validateRuneTransfer({ ...validTransfer, amount: '1e-10' })).toBe(true);
        expect(validateRuneTransfer({ ...validTransfer, amount: '1.23e+4' })).toBe(true);
        expect(validateRuneTransfer({ ...validTransfer, amount: '.123' })).toBe(true);
      });

      it('should return true for valid transfer with different address formats', () => {
        expect(
          validateRuneTransfer({
            ...validTransfer,
            sender: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
            recipient: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
          })
        ).toBe(true);
      });

      it('should return true for valid transfer with special characters in addresses', () => {
        expect(
          validateRuneTransfer({
            ...validTransfer,
            sender: 'address-with-dashes',
            recipient: 'address_with_underscores',
          })
        ).toBe(true);
      });

      it('should return true for valid transfer with complex runeId', () => {
        expect(
          validateRuneTransfer({
            ...validTransfer,
            runeId: 'rune-123-abc_456',
          })
        ).toBe(true);
      });

      it('should return true for valid transfer with trimmed strings', () => {
        expect(
          validateRuneTransfer({
            ...validTransfer,
            sender: ' sender-address ',
            recipient: ' recipient-address ',
            runeId: ' rune-123 ',
          })
        ).toBe(true);
      });

      it('should return true for valid transfer with minimum values', () => {
        expect(
          validateRuneTransfer({
            sender: 'a',
            recipient: 'b',
            amount: '0',
            runeId: 'c',
          })
        ).toBe(true);
      });

      it('should return true for valid transfer with long values', () => {
        expect(
          validateRuneTransfer({
            sender: 'a'.repeat(100),
            recipient: 'b'.repeat(100),
            amount: '1'.repeat(20),
            runeId: 'c'.repeat(100),
          })
        ).toBe(true);
      });

      it('should return true for valid transfer with edge case values', () => {
        expect(
          validateRuneTransfer({
            ...validTransfer,
            sender: '!@#$%^&*()_+-=[]{}|;:,.<>?',
            recipient: '`~!@#$%^&*()_+-=[]{}|;:,.<>?',
            amount: '0.000000000000000001',
            runeId: '!@#$%^&*()_+-=[]{}|;:,.<>?',
          })
        ).toBe(true);
      });

      it('should return true for valid transfer with unicode characters', () => {
        expect(
          validateRuneTransfer({
            ...validTransfer,
            sender: 'αβγδεζηθικλμνξοπρστυφχψω',
            recipient: '你好世界',
            runeId: '🌟🌙⭐️💫✨',
          })
        ).toBe(true);
      });
    });

    describe('edge cases', () => {
      it('should handle non-string amount that can be converted to number', () => {
        expect(
          validateRuneTransfer({
            ...validTransfer,
            amount: '123.45e-5',
          })
        ).toBe(true);
      });

      it('should handle very large numeric strings', () => {
        expect(
          validateRuneTransfer({
            ...validTransfer,
            amount: '9'.repeat(100),
          })
        ).toBe(true);
      });

      it('should handle scientific notation at limits', () => {
        expect(
          validateRuneTransfer({
            ...validTransfer,
            amount: '1e-323',
          })
        ).toBe(true);
      });

      it('should handle unicode characters in addresses', () => {
        expect(
          validateRuneTransfer({
            ...validTransfer,
            sender: 'sender-😊',
            recipient: 'recipient-🌟',
          })
        ).toBe(true);
      });
    });
  });
});
