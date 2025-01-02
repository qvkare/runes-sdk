import { validateRuneTransfer } from '../runes.validator';
import { RuneTransfer } from '../../types/rune.types';

describe('Runes Validator', () => {
  const validTransfer: RuneTransfer = {
        sender: 'sender-address',
        recipient: 'recipient-address',
        amount: '100',
    runeId: 'rune-123'
      };

  it('should validate a correct rune transfer', () => {
    expect(() => validateRuneTransfer(validTransfer)).not.toThrow();
    expect(validateRuneTransfer(validTransfer)).toBe(true);
    });

  it('should throw error for null or undefined parameters', () => {
        expect(() => validateRuneTransfer(null as any)).toThrow('Invalid transfer parameters');
        expect(() => validateRuneTransfer(undefined as any)).toThrow('Invalid transfer parameters');
      });

  it('should throw error for non-object parameters', () => {
    expect(() => validateRuneTransfer('not-an-object' as any)).toThrow('Invalid transfer parameters');
        expect(() => validateRuneTransfer(123 as any)).toThrow('Invalid transfer parameters');
  });

  it('should throw error for missing or invalid sender', () => {
    const noSender = { ...validTransfer, sender: undefined };
    const emptySender = { ...validTransfer, sender: '' };
    const invalidSender = { ...validTransfer, sender: 123 };
    const whitespacesSender = { ...validTransfer, sender: '   ' };

    expect(() => validateRuneTransfer(noSender as any)).toThrow('Sender address is required');
    expect(() => validateRuneTransfer(emptySender)).toThrow('Sender address is required');
    expect(() => validateRuneTransfer(invalidSender as any)).toThrow('Sender address is required');
    expect(() => validateRuneTransfer(whitespacesSender)).toThrow('Sender address is required');
  });

  it('should throw error for missing or invalid recipient', () => {
    const noRecipient = { ...validTransfer, recipient: undefined };
    const emptyRecipient = { ...validTransfer, recipient: '' };
    const invalidRecipient = { ...validTransfer, recipient: 123 };
    const whitespacesRecipient = { ...validTransfer, recipient: '   ' };

    expect(() => validateRuneTransfer(noRecipient as any)).toThrow('Recipient address is required');
    expect(() => validateRuneTransfer(emptyRecipient)).toThrow('Recipient address is required');
    expect(() => validateRuneTransfer(invalidRecipient as any)).toThrow('Recipient address is required');
    expect(() => validateRuneTransfer(whitespacesRecipient)).toThrow('Recipient address is required');
  });

  it('should throw error for missing or invalid amount', () => {
    const noAmount = { ...validTransfer, amount: undefined };
    const emptyAmount = { ...validTransfer, amount: '' };
    const invalidAmount = { ...validTransfer, amount: 'not-a-number' };
    const whitespacesAmount = { ...validTransfer, amount: '   ' };
    const nonStringAmount = { ...validTransfer, amount: 123 };

    expect(() => validateRuneTransfer(noAmount as any)).toThrow('Valid amount is required');
    expect(() => validateRuneTransfer(emptyAmount)).toThrow('Valid amount is required');
    expect(() => validateRuneTransfer(invalidAmount)).toThrow('Valid amount is required');
    expect(() => validateRuneTransfer(whitespacesAmount)).toThrow('Valid amount is required');
    expect(() => validateRuneTransfer(nonStringAmount as any)).toThrow('Valid amount is required');
  });

  it('should throw error for missing or invalid runeId', () => {
    const noRuneId = { ...validTransfer, runeId: undefined };
    const emptyRuneId = { ...validTransfer, runeId: '' };
    const invalidRuneId = { ...validTransfer, runeId: 123 };
    const whitespacesRuneId = { ...validTransfer, runeId: '   ' };

    expect(() => validateRuneTransfer(noRuneId as any)).toThrow('Rune identifier is required');
    expect(() => validateRuneTransfer(emptyRuneId)).toThrow('Rune identifier is required');
    expect(() => validateRuneTransfer(invalidRuneId as any)).toThrow('Rune identifier is required');
    expect(() => validateRuneTransfer(whitespacesRuneId)).toThrow('Rune identifier is required');
  });

  it('should validate transfers with valid numeric string amounts', () => {
    const validAmounts = ['0', '1', '100', '1000000', '0.1', '0.01', '1.23'];

    validAmounts.forEach(amount => {
      const transfer = { ...validTransfer, amount };
      expect(() => validateRuneTransfer(transfer)).not.toThrow();
      expect(validateRuneTransfer(transfer)).toBe(true);
    });
  });
});
