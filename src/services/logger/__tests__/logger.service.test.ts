import { Logger } from '../logger.service';

describe('Logger Service', () => {
  let mockConsole: jest.Mocked<typeof console>;
  let originalConsole: typeof console;
  const TEST_CONTEXT = 'TestContext';

  beforeEach(() => {
    originalConsole = global.console;
    mockConsole = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
    } as unknown as jest.Mocked<typeof console>;
    global.console = mockConsole;
  });

  afterEach(() => {
    global.console = originalConsole;
  });

  describe('info logging', () => {
    it('should log info messages with context', () => {
      const logger = new Logger(TEST_CONTEXT);
      const message = 'test info message';
      
      logger.info(message);
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        `[${TEST_CONTEXT}] INFO:`,
        message
      );
    });

    it('should handle additional arguments in info logs', () => {
      const logger = new Logger(TEST_CONTEXT);
      const message = 'test info message';
      const additionalArg = { key: 'value' };
      
      logger.info(message, additionalArg);
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        `[${TEST_CONTEXT}] INFO:`,
        message,
        additionalArg
      );
    });
  });

  describe('error logging', () => {
    it('should log error messages with context', () => {
      const logger = new Logger(TEST_CONTEXT);
      const message = 'test error message';
      const error = new Error('test error');
      
      logger.error(message, error);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        `[${TEST_CONTEXT}] ERROR:`,
        message,
        error.stack || '',
      );
    });

    it('should handle error logging without error object', () => {
      const logger = new Logger(TEST_CONTEXT);
      const message = 'test error message';
      
      logger.error(message);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        `[${TEST_CONTEXT}] ERROR:`,
        message,
        '',
      );
    });
  });

  describe('warn logging', () => {
    it('should log warning messages with context', () => {
      const logger = new Logger(TEST_CONTEXT);
      const message = 'test warning message';
      
      logger.warn(message);
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        `[${TEST_CONTEXT}] WARN:`,
        message
      );
    });

    it('should handle additional arguments in warning logs', () => {
      const logger = new Logger(TEST_CONTEXT);
      const message = 'test warning message';
      const additionalArg = { key: 'value' };
      
      logger.warn(message, additionalArg);
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        `[${TEST_CONTEXT}] WARN:`,
        message,
        additionalArg
      );
    });
  });

  describe('debug logging', () => {
    it('should log debug messages with context', () => {
      const logger = new Logger(TEST_CONTEXT);
      const message = 'test debug message';
      
      logger.debug(message);
      
      expect(mockConsole.debug).toHaveBeenCalledWith(
        `[${TEST_CONTEXT}] DEBUG:`,
        message
      );
    });

    it('should handle additional arguments in debug logs', () => {
      const logger = new Logger(TEST_CONTEXT);
      const message = 'test debug message';
      const additionalArg = { key: 'value' };
      
      logger.debug(message, additionalArg);
      
      expect(mockConsole.debug).toHaveBeenCalledWith(
        `[${TEST_CONTEXT}] DEBUG:`,
        message,
        additionalArg
      );
    });
  });
}); 