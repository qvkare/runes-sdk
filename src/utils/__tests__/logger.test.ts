import { ConsoleLogger, LogLevel } from '../logger';
import { jest } from '@jest/globals';

describe('ConsoleLogger', () => {
  let logger: ConsoleLogger;
  let consoleMocks: {
    log: ReturnType<typeof jest.spyOn>;
    warn: ReturnType<typeof jest.spyOn>;
    error: ReturnType<typeof jest.spyOn>;
    debug: ReturnType<typeof jest.spyOn>;
  };

  beforeEach(() => {
    logger = new ConsoleLogger('TestContext', LogLevel.INFO);
    // Mock console methods
    consoleMocks = {
      log: jest.spyOn(console, 'log').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      error: jest.spyOn(console, 'error').mockImplementation(() => {}),
      debug: jest.spyOn(console, 'debug').mockImplementation(() => {})
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create logger with correct context and level', () => {
    expect(logger.context).toBe('TestContext');
    expect(logger.level).toBe(LogLevel.INFO);
  });

  it('should log info message', () => {
    logger.info('Test info');
    expect(consoleMocks.log).toHaveBeenCalledWith('[TestContext] Test info');
  });

  it('should log warn message', () => {
    logger.warn('Test warning');
    expect(consoleMocks.warn).toHaveBeenCalledWith('[TestContext] Test warning');
  });

  it('should log error message', () => {
    logger.error('Test error');
    expect(consoleMocks.error).toHaveBeenCalledWith('[TestContext] Test error');
  });

  it('should log debug message when level is DEBUG', () => {
    const debugLogger = new ConsoleLogger('TestContext', LogLevel.DEBUG);
    debugLogger.debug('Test debug');
    expect(consoleMocks.debug).toHaveBeenCalledWith('[TestContext] Test debug');
  });

  it('should not log debug message when level is INFO', () => {
    logger.debug('Test debug');
    expect(consoleMocks.debug).not.toHaveBeenCalled();
  });

  it('should respect log level', () => {
    const warnLogger = new ConsoleLogger('TestContext', LogLevel.WARN);
    warnLogger.info('Test info');
    warnLogger.warn('Test warning');
    warnLogger.error('Test error');

    expect(consoleMocks.log).not.toHaveBeenCalled();
    expect(consoleMocks.warn).toHaveBeenCalledWith('[TestContext] Test warning');
    expect(consoleMocks.error).toHaveBeenCalledWith('[TestContext] Test error');
  });

  it('should correctly determine if should log', () => {
    expect(logger.shouldLog(LogLevel.ERROR)).toBe(true);
    expect(logger.shouldLog(LogLevel.WARN)).toBe(true);
    expect(logger.shouldLog(LogLevel.INFO)).toBe(true);
    expect(logger.shouldLog(LogLevel.DEBUG)).toBe(false);
  });
}); 