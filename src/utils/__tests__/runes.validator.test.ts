import { validateRuneTransfer } from '../runes.validator';
import { RuneTransfer } from '../../types/rune.types';

describe('Runes Validator', () => {
    const validTransfer: RuneTransfer = {
        sender: 'sender_address',
        recipient: 'recipient_address',
        amount: '100',
        runeId: 'rune_123'
    };

    describe('validateRuneTransfer', () => {
        it('should validate correct transfer parameters', () => {
            expect(validateRuneTransfer(validTransfer)).toBe(true);
        });

        it('should throw error for null parameters', () => {
            expect(() => validateRuneTransfer(null as any))
                .toThrow('Invalid transfer parameters');
        });

        it('should throw error for non-object parameters', () => {
            expect(() => validateRuneTransfer('invalid' as any))
                .toThrow('Invalid transfer parameters');
        });

        describe('sender validation', () => {
            it('should throw error for missing sender', () => {
                const params = { ...validTransfer, sender: undefined };
                expect(() => validateRuneTransfer(params))
                    .toThrow('Sender address is required');
            });

            it('should throw error for non-string sender', () => {
                const params = { ...validTransfer, sender: 123 as any };
                expect(() => validateRuneTransfer(params))
                    .toThrow('Sender address is required');
            });

            it('should throw error for empty sender', () => {
                const params = { ...validTransfer, sender: '' };
                expect(() => validateRuneTransfer(params))
                    .toThrow('Sender address is required');
            });

            it('should throw error for whitespace sender', () => {
                const params = { ...validTransfer, sender: '   ' };
                expect(() => validateRuneTransfer(params))
                    .toThrow('Sender address is required');
            });
        });

        describe('recipient validation', () => {
            it('should throw error for missing recipient', () => {
                const params = { ...validTransfer, recipient: undefined };
                expect(() => validateRuneTransfer(params))
                    .toThrow('Recipient address is required');
            });

            it('should throw error for non-string recipient', () => {
                const params = { ...validTransfer, recipient: 123 as any };
                expect(() => validateRuneTransfer(params))
                    .toThrow('Recipient address is required');
            });

            it('should throw error for empty recipient', () => {
                const params = { ...validTransfer, recipient: '' };
                expect(() => validateRuneTransfer(params))
                    .toThrow('Recipient address is required');
            });

            it('should throw error for whitespace recipient', () => {
                const params = { ...validTransfer, recipient: '   ' };
                expect(() => validateRuneTransfer(params))
                    .toThrow('Recipient address is required');
            });
        });

        describe('amount validation', () => {
            it('should throw error for missing amount', () => {
                const params = { ...validTransfer, amount: undefined };
                expect(() => validateRuneTransfer(params))
                    .toThrow('Valid amount is required');
            });

            it('should throw error for non-string amount', () => {
                const params = { ...validTransfer, amount: 123 as any };
                expect(() => validateRuneTransfer(params))
                    .toThrow('Valid amount is required');
            });

            it('should throw error for empty amount', () => {
                const params = { ...validTransfer, amount: '' };
                expect(() => validateRuneTransfer(params))
                    .toThrow('Valid amount is required');
            });

            it('should throw error for whitespace amount', () => {
                const params = { ...validTransfer, amount: '   ' };
                expect(() => validateRuneTransfer(params))
                    .toThrow('Valid amount is required');
            });

            it('should throw error for non-numeric amount', () => {
                const params = { ...validTransfer, amount: 'abc' };
                expect(() => validateRuneTransfer(params))
                    .toThrow('Valid amount is required');
            });

            it('should accept valid numeric string amounts', () => {
                const validAmounts = ['100', '0', '1.5', '1000000'];
                validAmounts.forEach(amount => {
                    expect(validateRuneTransfer({ ...validTransfer, amount })).toBe(true);
                });
            });
        });

        describe('runeId validation', () => {
            it('should throw error for missing runeId', () => {
                const params = { ...validTransfer, runeId: undefined };
                expect(() => validateRuneTransfer(params))
                    .toThrow('Rune identifier is required');
            });

            it('should throw error for non-string runeId', () => {
                const params = { ...validTransfer, runeId: 123 as any };
                expect(() => validateRuneTransfer(params))
                    .toThrow('Rune identifier is required');
            });

            it('should throw error for empty runeId', () => {
                const params = { ...validTransfer, runeId: '' };
                expect(() => validateRuneTransfer(params))
                    .toThrow('Rune identifier is required');
            });

            it('should throw error for whitespace runeId', () => {
                const params = { ...validTransfer, runeId: '   ' };
                expect(() => validateRuneTransfer(params))
                    .toThrow('Rune identifier is required');
            });
        });
    });
});
