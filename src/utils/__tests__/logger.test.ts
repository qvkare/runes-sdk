import { ConsoleLogger } from '../logger';

describe('ConsoleLogger', () => {
    let logger: ConsoleLogger;
    let consoleDebugSpy: jest.SpyInstance;
    let consoleInfoSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        logger = new ConsoleLogger('test-context');
        consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
        consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create logger with default context', () => {
        const defaultLogger = new ConsoleLogger();
        expect(defaultLogger).toBeDefined();
    });

    it('should create logger with custom context', () => {
        expect(logger).toBeDefined();
    });

    it('should log debug messages', () => {
        const message = 'Debug message';
        const meta = { key: 'value' };
        logger.debug(message, meta);

        expect(consoleDebugSpy).toHaveBeenCalledWith(
            expect.stringContaining('"level":"debug"')
        );
        expect(consoleDebugSpy).toHaveBeenCalledWith(
            expect.stringContaining('"message":"Debug message"')
        );
        expect(consoleDebugSpy).toHaveBeenCalledWith(
            expect.stringContaining('"meta":{"key":"value"}')
        );
    });

    it('should log info messages', () => {
        const message = 'Info message';
        logger.info(message);

        expect(consoleInfoSpy).toHaveBeenCalledWith(
            expect.stringContaining('"level":"info"')
        );
        expect(consoleInfoSpy).toHaveBeenCalledWith(
            expect.stringContaining('"message":"Info message"')
        );
    });

    it('should log warn messages', () => {
        const message = 'Warning message';
        logger.warn(message);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining('"level":"warn"')
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining('"message":"Warning message"')
        );
    });

    it('should log error messages', () => {
        const message = 'Error message';
        const error = new Error('Test error');
        logger.error(message, error);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('"level":"error"')
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('"message":"Error message"')
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('"meta":')
        );
    });

    it('should include timestamp in log messages', () => {
        logger.info('Test message');

        expect(consoleInfoSpy).toHaveBeenCalledWith(
            expect.stringContaining('"timestamp":')
        );
    });

    it('should include context in log messages', () => {
        logger.info('Test message');

        expect(consoleInfoSpy).toHaveBeenCalledWith(
            expect.stringContaining('"context":"test-context"')
        );
    });
});
