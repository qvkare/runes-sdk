import { RunesSDK } from '../index';
import { Logger } from '../utils/logger';
import { createMockLogger } from '../utils/__tests__/test.utils';

describe('RunesSDK', () => {
  let sdk: RunesSDK;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = createMockLogger('RunesSDK');
    sdk = new RunesSDK({
      baseUrl: 'http://localhost:8332',
      logger: mockLogger
    });
  });

  it('should initialize with default config', () => {
    const defaultSdk = new RunesSDK({
      baseUrl: 'http://localhost:8332'
    });
    expect(defaultSdk).toBeDefined();
  });

  it('should initialize with custom config', () => {
    const customSdk = new RunesSDK({
      baseUrl: 'http://localhost:8332',
      logger: mockLogger,
      timeout: 1000,
      maxRetries: 5,
      retryDelay: 2000
    });
    expect(customSdk).toBeDefined();
  });

  it('should expose service instances', () => {
    expect(sdk.runesService).toBeDefined();
    expect(sdk.orderService).toBeDefined();
    expect(sdk.performanceService).toBeDefined();
    expect(sdk.securityService).toBeDefined();
    expect(sdk.liquidityService).toBeDefined();
    expect(sdk.batchService).toBeDefined();
    expect(sdk.historyService).toBeDefined();
  });

  it('should use provided logger', () => {
    mockLogger.info('Test log');
    expect(mockLogger.info).toHaveBeenCalledWith('Test log');
  });
}); 