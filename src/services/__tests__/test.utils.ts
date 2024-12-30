import { jest } from '@jest/globals';
import { Logger, RuneTransaction, OrderResult } from '../../types';
import { RunesValidator } from '../runes.validator';
import { RunesBatchService } from '../runes.batch.service';
import { RunesHistoryService } from '../runes.history.service';
import { RunesSecurityService } from '../runes.security.service';
import { RunesOrderService } from '../runes.order.service';
import { RunesLiquidityService } from '../runes.liquidity.service';
import { BitcoinCoreService } from '../bitcoin-core.service';

export const createMockLogger = (): jest.Mocked<Logger> => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
});

export const createMockBitcoinCore = (): jest.Mocked<BitcoinCoreService> => ({
  getBlockCount: jest.fn(),
  getMemPoolInfo: jest.fn(),
  getRawTransaction: jest.fn(),
  decodeRawTransaction: jest.fn(),
  sendRawTransaction: jest.fn(),
  listUnspent: jest.fn(),
  validateAddress: jest.fn(),
  logger: createMockLogger(),
});

export const createMockValidator = (): jest.Mocked<RunesValidator> => ({
  validateRuneId: jest.fn().mockResolvedValue({ isValid: true }),
  validateAmount: jest.fn().mockResolvedValue({ isValid: true }),
  validateAddress: jest.fn().mockResolvedValue({ isValid: true }),
  validateRuneSymbol: jest.fn().mockResolvedValue({ isValid: true }),
  validateRuneDecimals: jest.fn().mockResolvedValue({ isValid: true }),
  validateRuneAmount: jest.fn().mockResolvedValue({ isValid: true }),
  validateRuneTransaction: jest.fn().mockResolvedValue({ isValid: true }),
  validateTransfer: jest.fn().mockResolvedValue({ isValid: true }),
  validateRuneSupply: jest.fn().mockResolvedValue({ isValid: true }),
  validateRuneLimit: jest.fn().mockResolvedValue({ isValid: true }),
  bitcoinCore: createMockBitcoinCore(),
  logger: createMockLogger(),
});

export const createMockBatchService = (): jest.Mocked<RunesBatchService> => ({
  createRune: jest.fn().mockResolvedValue({ txId: 'txid123' }),
  transferRune: jest.fn().mockResolvedValue({ txId: 'txid123' }),
  getRuneBalance: jest.fn().mockResolvedValue('100'),
  validateRuneId: jest.fn().mockResolvedValue(undefined),
  prepareCreateRuneTransaction: jest.fn().mockResolvedValue('rawtx'),
  prepareTransferRuneTransaction: jest.fn().mockResolvedValue('rawtx'),
  bitcoinCore: createMockBitcoinCore(),
  logger: createMockLogger(),
});

export const createMockHistoryService = (): jest.Mocked<RunesHistoryService> => ({
  getRuneHistory: jest.fn().mockResolvedValue([
    {
      txid: 'txid123',
      type: 'transfer',
      timestamp: Date.now(),
      details: {
        runeId: 'rune123',
        amount: 100,
        from: 'addr1',
        to: 'addr2',
      },
    },
  ] as RuneTransaction[]),
  validateRuneId: jest.fn().mockResolvedValue(undefined),
  fetchRuneTransactions: jest.fn().mockResolvedValue([]),
  processTransactions: jest.fn().mockResolvedValue([]),
  processTransaction: jest.fn().mockResolvedValue(undefined),
  isRuneTransaction: jest.fn().mockReturnValue(true),
  extractRuneData: jest.fn().mockReturnValue({}),
  bitcoinCore: createMockBitcoinCore(),
  logger: createMockLogger(),
});

export const createMockSecurityService = (): jest.Mocked<RunesSecurityService> => ({
  validateRuneCreation: jest.fn().mockResolvedValue(undefined),
  validateRuneTransfer: jest.fn().mockResolvedValue(undefined),
  validateRuneSymbol: jest.fn().mockResolvedValue({ isValid: true }),
  validateRuneDecimals: jest.fn().mockResolvedValue({ isValid: true }),
  validateRuneAmount: jest.fn().mockResolvedValue({ isValid: true }),
  validateRuneTransaction: jest.fn().mockResolvedValue({ isValid: true }),
  validateRuneSupply: jest.fn().mockResolvedValue({ isValid: true }),
  validateRuneLimit: jest.fn().mockResolvedValue({ isValid: true }),
  validateRuneId: jest.fn().mockResolvedValue({ isValid: true }),
  validateAddress: jest.fn().mockResolvedValue({ isValid: true }),
  bitcoinCore: createMockBitcoinCore(),
  logger: createMockLogger(),
});

export const createMockOrderService = (): jest.Mocked<RunesOrderService> => ({
  createOrder: jest.fn().mockResolvedValue({
    orderId: 'order123',
    status: 'pending',
  } as OrderResult),
  cancelOrder: jest.fn().mockResolvedValue(true),
  getOrderBook: jest.fn().mockResolvedValue({
    bids: [],
    asks: [],
  }),
  bitcoinCore: createMockBitcoinCore(),
  logger: createMockLogger(),
});

export const createMockLiquidityService = (): jest.Mocked<RunesLiquidityService> => ({
  addLiquidity: jest.fn().mockResolvedValue({
    txId: 'txid123',
    amount: '100',
  }),
  removeLiquidity: jest.fn().mockResolvedValue('txid123'),
  getLiquidityPool: jest.fn().mockResolvedValue({
    runeId: 'rune123',
    totalLiquidity: '1000',
    price: '1.5',
  }),
  bitcoinCore: createMockBitcoinCore(),
  logger: createMockLogger(),
});
