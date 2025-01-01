import { Logger } from '../logger';
import { LogLevel } from '../../types/logger.types';

describe('Logger', () => {
  let logger: Logger;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new Logger({
      level: LogLevel.DEBUG,
      format: 'text',
      timestamp: true,
    });
    consoleSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should log debug messages when level is DEBUG', () => {
    const message = 'test debug message';
    logger.debug(message);
    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy.mock.calls[0][0]).toContain(message);
  });

  it('should log info messages when level is INFO', () => {
    logger = new Logger({
      level: LogLevel.INFO,
      format: 'text',
      timestamp: true,
    });
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    const message = 'test info message';
    logger.info(message);
    expect(infoSpy).toHaveBeenCalled();
    expect(infoSpy.mock.calls[0][0]).toContain(message);
    infoSpy.mockRestore();
  });

  it('should log warn messages when level is WARN', () => {
    logger = new Logger({
      level: LogLevel.WARN,
      format: 'text',
      timestamp: true,
    });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const message = 'test warn message';
    logger.warn(message);
    expect(warnSpy).toHaveBeenCalled();
    expect(warnSpy.mock.calls[0][0]).toContain(message);
    warnSpy.mockRestore();
  });

  it('should log error messages when level is ERROR', () => {
    logger = new Logger({
      level: LogLevel.ERROR,
      format: 'text',
      timestamp: true,
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const message = 'test error message';
    logger.error(message);
    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy.mock.calls[0][0]).toContain(message);
    errorSpy.mockRestore();
  });

  it('should not log debug messages when level is INFO', () => {
    logger = new Logger({
      level: LogLevel.INFO,
      format: 'text',
      timestamp: true,
    });
    const message = 'test debug message';
    logger.debug(message);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('should format messages with timestamp when enabled', () => {
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    const message = 'test message';
    logger.info(message);
    const loggedMessage = infoSpy.mock.calls[0][0];
    expect(loggedMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z\]/);
    infoSpy.mockRestore();
  });

  it('should format messages as JSON when format is json', () => {
    logger = new Logger({
      level: LogLevel.DEBUG,
      format: 'json',
      timestamp: true,
    });
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    const message = 'test message';
    const meta = { key: 'value' };
    logger.info(message, meta);
    const loggedMessage = infoSpy.mock.calls[0][0];
    expect(() => JSON.parse(loggedMessage)).not.toThrow();
    expect(loggedMessage).toContain(message);
    expect(loggedMessage).toContain(meta.key);
    infoSpy.mockRestore();
  });
});
