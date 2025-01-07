import { Logger } from '../logger';
import { LogLevel } from '../../types/logger.types';

export function createMockLogger(): jest.Mocked<Logger> {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    context: 'TestContext',
    level: LogLevel.INFO,
    shouldLog: jest.fn().mockReturnValue(true),
  } as jest.Mocked<Logger>;
}

export function createMockRPCClient() {
  return {
    call: jest.fn(),
  };
}

export function createMockValidator() {
  return {
    validateTransfer: jest.fn(),
    validateAddress: jest.fn(),
    validateAmount: jest.fn(),
    validateRuneId: jest.fn(),
    validateRuneExists: jest.fn(),
  };
}
