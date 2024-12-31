import { RunesSDK } from '../index';
import { createMockLogger } from '../utils/test.utils';
import { LogLevel } from '../utils/logger';

describe('RunesSDK', () => {
  let sdk: RunesSDK;
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = createMockLogger();
    sdk = new RunesSDK(
      'http://localhost:8332',
      'testuser',
      'testpass',
      mockLogger
    );
  });

  it('should initialize successfully', () => {
    expect(sdk).toBeDefined();
  });

  it('should handle invalid configuration', () => {
    expect(() => new RunesSDK('', '', '', mockLogger)).toThrow();
  });

  it('should handle custom logger level', () => {
    const customLogger = createMockLogger();
    customLogger.level = LogLevel.DEBUG;

    const customSdk = new RunesSDK(
      'http://localhost:8332',
      'testuser',
      'testpass',
      customLogger
    );

    expect(customSdk).toBeDefined();
  });
}); 