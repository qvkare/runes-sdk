import { Logger } from '../logger.service';

describe('Logger', () => {
    let logger: Logger;
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;
    let consoleInfoSpy: jest.SpyInstance;

    beforeEach(() => {
        logger = new Logger('TestContext');
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create logger with context', () => {
        expect(logger).toBeDefined();
    });

    it('should log error messages', () => {
        const error = new Error('Test error');
        logger.error('Error message', error);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[TestContext] ERROR:',
            'Error message',
            error.stack,
            ''
        );
    });

    it('should handle undefined error in error message', () => {
        logger.error('Error message');
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[TestContext] ERROR:',
            'Error message',
            '',
            ''
        );
    });

    it('should log warning messages', () => {
        logger.warn('Warning message');
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            '[TestContext] WARN:',
            'Warning message'
        );
    });

    it('should log info messages', () => {
        logger.info('Info message');
        expect(consoleInfoSpy).toHaveBeenCalledWith(
            '[TestContext] INFO:',
            'Info message'
        );
    });

    it('should log debug messages', () => {
        logger.debug('Debug message');
        expect(consoleLogSpy).toHaveBeenCalledWith(
            '[TestContext] DEBUG:',
            'Debug message'
        );
    });

    it('should format null message', () => {
        logger.info(null);
        expect(consoleInfoSpy).toHaveBeenCalledWith(
            '[TestContext] INFO:',
            'null'
        );
    });

    it('should format undefined message', () => {
        logger.info(undefined);
        expect(consoleInfoSpy).toHaveBeenCalledWith(
            '[TestContext] INFO:',
            'undefined'
        );
    });
}); 