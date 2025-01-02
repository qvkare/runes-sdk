import { Logger } from '../types/logger.types';

export { Logger };

export class ConsoleLogger implements Logger {
  private readonly context: string;

  constructor(context: string = 'default') {
    this.context = context;
  }

  private log(level: string, message: string, meta?: any): void {
    const logData = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...(meta && { meta }),
    };

    const logMethod = level.toLowerCase();
    switch (logMethod) {
      case 'debug':
        console.debug(JSON.stringify(logData));
        break;
      case 'info':
        console.info(JSON.stringify(logData));
        break;
      case 'warn':
        console.warn(JSON.stringify(logData));
        break;
      case 'error':
        console.error(JSON.stringify(logData));
        break;
      default:
        console.log(JSON.stringify(logData));
    }
  }

  debug(message: string, meta?: any): void {
    this.log('debug', message, meta);
  }

  info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: any): void {
    this.log('error', message, meta);
  }
}
