import { RuneTransfer } from '../types/rune.types';

export function validateRuneTransfer(params: RuneTransfer): boolean {
  if (!params || typeof params !== 'object') {
    throw new Error('Invalid transfer parameters');
  }

  if (!params.sender || typeof params.sender !== 'string' || params.sender.trim() === '') {
    throw new Error('Sender address is required');
  }

  if (!params.recipient || typeof params.recipient !== 'string' || params.recipient.trim() === '') {
    throw new Error('Recipient address is required');
  }

  if (!params.amount || typeof params.amount !== 'string' || params.amount.trim() === '' || isNaN(Number(params.amount))) {
    throw new Error('Valid amount is required');
  }

  if (!params.runeId || typeof params.runeId !== 'string' || params.runeId.trim() === '') {
    throw new Error('Rune identifier is required');
  }

  return true;
}
