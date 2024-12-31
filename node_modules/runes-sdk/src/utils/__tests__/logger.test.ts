import { Logger } from '../logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new Logger('TestContext');
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log info messages', () => {
    logger.info('Test message');
    expect(consoleInfoSpy).toHaveBeenCalled();
  });

  it('should log error messages', () => {
    logger.error('Test error');
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should log warning messages', () => {
    logger.warn('Test warning');
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it('should log debug messages', () => {
    logger.debug('Test debug');
    expect(consoleDebugSpy).toHaveBeenCalled();
  });
}); 