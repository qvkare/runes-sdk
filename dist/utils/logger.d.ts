export declare enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}
export interface Logger {
    level: LogLevel;
    context: string;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    debug(message: string): void;
    shouldLog(level: LogLevel): boolean;
}
export declare class ConsoleLogger implements Logger {
    readonly context: string;
    readonly level: LogLevel;
    constructor(context: string, level?: LogLevel);
    shouldLog(level: LogLevel): boolean;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    debug(message: string): void;
}
