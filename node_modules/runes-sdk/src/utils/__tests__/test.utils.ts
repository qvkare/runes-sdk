import { Logger } from '../logger';
import { RPCClient } from '../rpc.client';
import { RPCResponse } from '../../types';

export const createMockLogger = (context = 'TestContext'): jest.Mocked<Logger> => {
  return {
    context,
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  } as jest.Mocked<Logger>;
};

export const createMockRpcClient = (logger: Logger): jest.Mocked<RPCClient> => {
  const mockClient = {
    baseUrl: 'http://localhost:8332',
    logger,
    timeout: 5000,
    maxRetries: 3,
    retryDelay: 1000,
    call: jest.fn(),
    makeRequest: jest.fn(),
    delay: jest.fn()
  };

  return mockClient as unknown as jest.Mocked<RPCClient>;
};

export const createMockRpcResponse = <T>(data: T): RPCResponse<T> => {
  return {
    result: data
  };
};

export const createMockValidationResponse = (isValid: boolean, errors: string[] = [], warnings: string[] = []): RPCResponse<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> => {
  return {
    result: {
      valid: isValid,
      errors,
      warnings
    }
  };
}; 