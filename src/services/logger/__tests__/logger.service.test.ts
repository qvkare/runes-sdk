import { Logger } from '../logger.service';

describe('Logger', () => {
  let logger: Logger;
  let consoleLogSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new Logger();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log info messages correctly', () => {
    const message = 'Test info message';
    const args = ['arg1', 2, { key: 'value' }];
    
    logger.info(message, ...args);
    
    expect(consoleLogSpy).toHaveBeenCalledWith('[INFO] Test info message', 'arg1', 2, { key: 'value' });
  });

  it('should log debug messages correctly', () => {
    const message = 'Test debug message';
    const args = ['debug1', { debug: true }];
    
    logger.debug(message, ...args);
    
    expect(consoleDebugSpy).toHaveBeenCalledWith('[DEBUG] Test debug message', 'debug1', { debug: true });
  });

  it('should log warning messages correctly', () => {
    const message = 'Test warning message';
    const args = ['warning1', new Error('Test warning')];
    
    logger.warn(message, ...args);
    
    expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Test warning message', 'warning1', new Error('Test warning'));
  });

  it('should log error messages correctly', () => {
    const message = 'Test error message';
    const error = new Error('Test error');
    
    logger.error(message, error);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Test error message', error);
  });

  it('should handle logging without additional arguments', () => {
    logger.info('Info message');
    logger.debug('Debug message');
    logger.warn('Warning message');
    logger.error('Error message');

    expect(consoleLogSpy).toHaveBeenCalledWith('[INFO] Info message');
    expect(consoleDebugSpy).toHaveBeenCalledWith('[DEBUG] Debug message');
    expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Warning message');
    expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Error message');
  });

  it('should handle logging with multiple arguments', () => {
    const args = ['arg1', 2, true, { test: 'value' }, [1, 2, 3]];
    
    logger.info('Multiple args test', ...args);
    logger.debug('Multiple args test', ...args);
    logger.warn('Multiple args test', ...args);
    logger.error('Multiple args test', ...args);

    expect(consoleLogSpy).toHaveBeenCalledWith('[INFO] Multiple args test', ...args);
    expect(consoleDebugSpy).toHaveBeenCalledWith('[DEBUG] Multiple args test', ...args);
    expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Multiple args test', ...args);
    expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Multiple args test', ...args);
  });
}); 