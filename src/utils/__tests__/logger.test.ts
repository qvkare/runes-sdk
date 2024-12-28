import { Logger } from '../logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new Logger('TestContext');
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create logger with context', () => {
    expect(logger).toBeInstanceOf(Logger);
  });

  it('should log info message', () => {
    const message = 'Test info message';
    const args = ['arg1', 'arg2'];

    logger.info(message, ...args);

    expect(consoleLogSpy).toHaveBeenCalledWith('[TestContext] Test info message', 'arg1', 'arg2');
  });

  it('should log error message', () => {
    const message = 'Test error message';
    const error = new Error('Test error');

    logger.error(message, error);

    expect(consoleErrorSpy).toHaveBeenCalledWith('[TestContext] Test error message', error);
  });

  it('should log warning message', () => {
    const message = 'Test warning message';
    const data = { key: 'value' };

    logger.warn(message, data);

    expect(consoleWarnSpy).toHaveBeenCalledWith('[TestContext] Test warning message', data);
  });

  it('should log debug message', () => {
    const message = 'Test debug message';
    const debugInfo = { debug: true };

    logger.debug(message, debugInfo);

    expect(consoleDebugSpy).toHaveBeenCalledWith('[TestContext] Test debug message', debugInfo);
  });

  it('should handle multiple arguments', () => {
    const message = 'Test message';
    const args = ['arg1', 2, { key: 'value' }, [1, 2, 3]];

    logger.info(message, ...args);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[TestContext] Test message',
      'arg1',
      2,
      { key: 'value' },
      [1, 2, 3]
    );
  });

  it('should handle empty arguments', () => {
    const message = 'Test message';

    logger.info(message);
    logger.error(message);
    logger.warn(message);
    logger.debug(message);

    expect(consoleLogSpy).toHaveBeenCalledWith('[TestContext] Test message');
    expect(consoleErrorSpy).toHaveBeenCalledWith('[TestContext] Test message');
    expect(consoleWarnSpy).toHaveBeenCalledWith('[TestContext] Test message');
    expect(consoleDebugSpy).toHaveBeenCalledWith('[TestContext] Test message');
  });
}); 