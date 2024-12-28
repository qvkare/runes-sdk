export class Logger {
  protected context: string;

  constructor(context: string) {
    this.context = context;
  }

  debug(message: string, ...args: unknown[]): void {
    console.debug(`[${this.context}] ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(`[${this.context}] ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[${this.context}] ${message}`, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    console.info(`[${this.context}] ${message}`, ...args);
  }
} 