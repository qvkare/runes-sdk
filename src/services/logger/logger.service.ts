export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  public info(message: string, ...args: any[]): void {
    console.log(`[${this.context}] INFO:`, message, ...args);
  }

  public debug(message: string, ...args: any[]): void {
    console.debug(`[${this.context}] DEBUG:`, message, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    console.warn(`[${this.context}] WARN:`, message, ...args);
  }

  public error(message: string, error?: Error, ...args: any[]): void {
    console.error(`[${this.context}] ERROR:`, message, error?.stack || '', ...args);
  }
}
