import { BitcoinCoreService } from '../services/bitcoin-core.service';
import { createMockLogger } from './mock-logger';

export const createMockBitcoinCore = (): jest.Mocked<BitcoinCoreService> => {
  const mockLogger = createMockLogger();
  return {
    getBlockCount: jest.fn(),
    getMemPoolInfo: jest.fn(),
    getRawTransaction: jest.fn(),
    decodeRawTransaction: jest.fn(),
    sendRawTransaction: jest.fn(),
    listUnspent: jest.fn(),
    validateAddress: jest.fn(),
    createRawTransaction: jest.fn(),
    signRawTransaction: jest.fn(),
    rpcClient: {} as any,
    logger: mockLogger,
  } as unknown as jest.Mocked<BitcoinCoreService>;
};
