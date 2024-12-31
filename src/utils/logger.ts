export enum LogLevel {
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

export class ConsoleLogger implements Logger {
  constructor(
    public readonly context: string,
    public readonly level: LogLevel = LogLevel.INFO
  ) {}

  shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  info(message: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(`[${this.context}] ${message}`);
    }
  }

  warn(message: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[${this.context}] ${message}`);
    }
  }

  error(message: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[${this.context}] ${message}`);
    }
  }

  debug(message: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`[${this.context}] ${message}`);
    }
  }
} 