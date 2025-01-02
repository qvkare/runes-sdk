import { Logger } from '../types/logger.types';

export function createConsoleLogger(): Logger {
  return {
    debug: (message: string, ...args: any[]) => console.debug(message, ...args),
    info: (message: string, ...args: any[]) => console.info(message, ...args),
    warn: (message: string, ...args: any[]) => console.warn(message, ...args),
    error: (message: string, ...args: any[]) => console.error(message, ...args),
  };
}
