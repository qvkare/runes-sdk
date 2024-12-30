import { jest } from '@jest/globals';
import RunesAPI from '../index';
import { Logger } from '../utils/logger';

describe('RunesAPI', () => {
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    } as jest.Mocked<Logger>;
  });

  it('should initialize SDK with default logger', () => {
    const api = new RunesAPI({
      host: 'localhost',
      port: 8332,
      username: 'user',
      password: 'pass',
    });

    expect(api).toBeDefined();
  });

  it('should initialize SDK with custom logger', () => {
    const api = new RunesAPI({
      host: 'localhost',
      port: 8332,
      username: 'user',
      password: 'pass',
      logger: mockLogger,
    });

    expect(api).toBeDefined();
    expect(mockLogger.info).toBeDefined();
  });

  it('should handle invalid configuration', () => {
    expect(() => {
      new RunesAPI({
        host: '',
        port: -1,
        username: '',
        password: '',
      });
    }).toThrow();
  });
});
