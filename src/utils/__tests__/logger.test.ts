import { ConsoleLogger } from '../logger';

describe('ConsoleLogger', () => {
  let logger: ConsoleLogger;
  let mockConsole: jest.SpyInstance;

  beforeEach(() => {
    logger = new ConsoleLogger();
    mockConsole = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    mockConsole.mockRestore();
  });

  it('should log info messages', () => {
    const message = 'test info message';
    logger.info(message);
    expect(mockConsole).toHaveBeenCalledWith(message);
  });

  it('should log error messages', () => {
    const message = 'test error message';
    const mockError = jest.spyOn(console, 'error').mockImplementation();
    logger.error(message);
    expect(mockError).toHaveBeenCalledWith(message);
    mockError.mockRestore();
  });

  it('should log warning messages', () => {
    const message = 'test warning message';
    const mockWarn = jest.spyOn(console, 'warn').mockImplementation();
    logger.warn(message);
    expect(mockWarn).toHaveBeenCalledWith(message);
    mockWarn.mockRestore();
  });

  it('should log debug messages', () => {
    const message = 'test debug message';
    const mockDebug = jest.spyOn(console, 'debug').mockImplementation();
    logger.debug(message);
    expect(mockDebug).toHaveBeenCalledWith(message);
    mockDebug.mockRestore();
  });
});
