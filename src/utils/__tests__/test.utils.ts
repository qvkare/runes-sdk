import { jest } from '@jest/globals';
import { RPCClient } from '../rpc.client';
import { RunesValidator } from '../runes.validator';
import { BitcoinCoreService } from '../../services/bitcoin.core.service';
import { RunesBatchService } from '../../services/runes.batch.service';
import { RunesHistoryService } from '../../services/runes.history.service';
import { RunesSecurityService } from '../../services/runes.security.service';
import { Logger } from '../logger';
import { CreateRuneParams, TransferRuneParams, ValidationResult, BatchOperation, BatchOperationResult, BatchResult } from '../../types';
import { RunesPerformanceService } from '../../services/runes.performance.service';

export const createMockLogger = (): jest.Mocked<Logger> => {
  const logger = new Logger('test');
  return {
    ...logger,
    context: 'test',
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as jest.Mocked<Logger>;
};

export const createMockRpcClient = (): jest.Mocked<RPCClient> => {
  const mockLogger = createMockLogger();
  const config: RPCClientConfig = {
    url: 'http://localhost:8332',
    auth: {
      username: 'test',
      password: 'test'
    }
  };
  const client = new RPCClient(config, mockLogger);

  return {
    ...client,
    call: jest.fn().mockResolvedValue({}),
    init: jest.fn().mockResolvedValue(undefined),
    isInitialized: jest.fn().mockReturnValue(true),
    getEndpoint: jest.fn().mockReturnValue('http://localhost:8332'),
    getHeaders: jest.fn().mockReturnValue({
      'Content-Type': 'application/json',
      Authorization: 'Basic dXNlcjpwYXNz',
    }),
  } as jest.Mocked<RPCClient>;
};

export const createMockValidator = (): jest.Mocked<RunesValidator> => {
  const mockLogger = createMockLogger();
  const mockBitcoinCore = createMockBitcoinCore();
  const validator = new RunesValidator(mockBitcoinCore, mockLogger);

  return {
    ...validator,
    validateRuneCreation: jest.fn().mockResolvedValue({ isValid: true, errors: [] }),
    validateRuneTransfer: jest.fn().mockResolvedValue({ isValid: true, errors: [] }),
    validateRuneId: jest.fn().mockResolvedValue({ isValid: true, errors: [] }),
    validateAddress: jest.fn().mockResolvedValue({ isValid: true, errors: [] }),
    isValidRuneId: jest.fn().mockReturnValue(true),
    isValidSymbol: jest.fn().mockReturnValue(true),
    isValidDecimals: jest.fn().mockReturnValue(true),
    isValidSupply: jest.fn().mockReturnValue(true),
    isValidLimit: jest.fn().mockReturnValue(true),
    isValidAmount: jest.fn().mockReturnValue(true),
  } as jest.Mocked<RunesValidator>;
};

export const createMockBitcoinCore = (): jest.Mocked<BitcoinCoreService> => {
  const mockLogger = createMockLogger();
  const mockRpcClient = createMockRpcClient();
  const service = new BitcoinCoreService(mockRpcClient, mockLogger);

  return {
    ...service,
    getBlockCount: jest.fn().mockResolvedValue(100),
    getMemPoolInfo: jest.fn().mockResolvedValue({
      size: 0,
      bytes: 0,
      usage: 0,
      maxmempool: 300000000,
      mempoolminfee: 0.00001000,
      minrelaytxfee: 0.00001000,
    }),
    getRawTransaction: jest.fn().mockResolvedValue('rawtx'),
    decodeRawTransaction: jest.fn().mockResolvedValue({
      txid: 'txid123',
      hash: 'hash123',
      version: 1,
      size: 100,
      vsize: 100,
      weight: 400,
      locktime: 0,
      vin: [],
      vout: [],
    }),
    sendRawTransaction: jest.fn().mockResolvedValue('txid123'),
    listUnspent: jest.fn().mockResolvedValue([]),
    validateAddress: jest.fn().mockResolvedValue({ isvalid: true }),
    createRawTransaction: jest.fn().mockResolvedValue('rawtx'),
    signRawTransaction: jest.fn().mockResolvedValue({ hex: 'signedtx', complete: true }),
  } as jest.Mocked<BitcoinCoreService>;
};

export const createMockBatchService = (): jest.Mocked<RunesBatchService> => {
  const mockLogger = createMockLogger();
  const mockRpcClient = createMockRpcClient();
  const mockValidator = createMockValidator();
  const mockBitcoinCore = createMockBitcoinCore();
  const service = new RunesBatchService(mockRpcClient, mockValidator, mockBitcoinCore, mockLogger);

  return {
    ...service,
    executeBatch: jest.fn().mockResolvedValue([{ success: true, txId: 'txid123' }]),
    getBatchStatus: jest.fn().mockResolvedValue({
      success: [],
      failed: [],
      completed: 0,
      failed: 0,
      pending: 0,
      total: 0,
    }),
    waitForBatchCompletion: jest.fn().mockResolvedValue({
      success: [],
      failed: [],
      completed: 0,
      failed: 0,
      pending: 0,
      total: 0,
    }),
    createRune: jest.fn().mockResolvedValue({ success: true, txId: 'txid123' }),
    transferRune: jest.fn().mockResolvedValue({ success: true, txId: 'txid123' }),
    getRuneBalance: jest.fn().mockResolvedValue(100),
    processBatch: jest.fn().mockResolvedValue([{ success: true, txId: 'txid123' }]),
    processCreateOperation: jest.fn().mockResolvedValue({ success: true, txId: 'txid123' }),
    processTransferOperation: jest.fn().mockResolvedValue({ success: true, txId: 'txid123' }),
  } as jest.Mocked<RunesBatchService>;
};

export const createMockHistoryService = (): jest.Mocked<RunesHistoryService> => {
  const mockLogger = createMockLogger();
  const mockRpcClient = createMockRpcClient();
  const mockBitcoinCore = createMockBitcoinCore();
  const service = new RunesHistoryService(mockRpcClient, mockBitcoinCore, mockLogger);

  return {
    ...service,
    getRuneHistory: jest.fn().mockResolvedValue({
      transactions: [],
      count: 0,
      page: 1,
      pageSize: 10,
    }),
    getAddressHistory: jest.fn().mockResolvedValue({
      transactions: [],
      count: 0,
      page: 1,
      pageSize: 10,
    }),
    getRuneTransaction: jest.fn().mockResolvedValue({
      txid: 'txid123',
      type: 'transfer',
      timestamp: Date.now(),
      details: {
        runeId: 'rune123',
        amount: 100,
        from: 'addr1',
        to: 'addr2',
      },
    }),
  } as jest.Mocked<RunesHistoryService>;
};

export const createMockSecurityService = (): jest.Mocked<RunesSecurityService> => {
  const mockLogger = createMockLogger();
  const mockRpcClient = createMockRpcClient();
  const mockValidator = createMockValidator();
  const mockBitcoinCore = createMockBitcoinCore();
  const service = new RunesSecurityService(mockRpcClient, mockValidator, mockBitcoinCore, mockLogger);

  return {
    ...service,
    validateRuneCreation: jest.fn().mockResolvedValue({ isValid: true, errors: [] }),
    validateRuneTransfer: jest.fn().mockResolvedValue({ isValid: true, errors: [] }),
    validateRuneId: jest.fn().mockResolvedValue({ isValid: true, errors: [] }),
    validateAddress: jest.fn().mockResolvedValue({ isValid: true, errors: [] }),
    isValidRuneId: jest.fn().mockReturnValue(true),
    isValidSymbol: jest.fn().mockReturnValue(true),
    isValidDecimals: jest.fn().mockReturnValue(true),
    isValidSupply: jest.fn().mockReturnValue(true),
    isValidLimit: jest.fn().mockReturnValue(true),
    isValidAmount: jest.fn().mockReturnValue(true),
  } as jest.Mocked<RunesSecurityService>;
};

export const createMockPerformanceService = (): jest.Mocked<RunesPerformanceService> => {
  const mockLogger = createMockLogger();
  const mockRpcClient = createMockRpcClient();
  const mockBitcoinCore = createMockBitcoinCore();
  const service = new RunesPerformanceService(mockRpcClient, mockBitcoinCore, mockLogger);

  return {
    ...service,
    getRuneMetrics: jest.fn().mockResolvedValue({
      transactionCount: 0,
      averageBlockTime: 0,
      averageConfirmationTime: 0,
      successRate: 0,
      failureRate: 0,
      totalVolume: 0,
      averageVolume: 0,
    }),
    getNetworkMetrics: jest.fn().mockResolvedValue({
      blockHeight: 0,
      memPoolSize: 0,
      memPoolUsage: 0,
      networkHashRate: 0,
      difficulty: 0,
      connectionCount: 0,
    }),
    getAddressMetrics: jest.fn().mockResolvedValue({
      balance: 0,
      transactionCount: 0,
      lastActivity: 0,
      totalReceived: 0,
      totalSent: 0,
    }),
  } as jest.Mocked<RunesPerformanceService>;
};
