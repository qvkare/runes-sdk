/**
 * Base RPC error class
 */
export class RPCError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
    public readonly data?: any
  ) {
    super(message);
    this.name = 'RPCError';
  }
}

/**
 * Error thrown when RPC request times out
 */
export class RPCTimeoutError extends RPCError {
  constructor() {
    super('RPC request timed out');
    this.name = 'RPCTimeoutError';
  }
}

/**
 * Error thrown when RPC request fails after max retries
 */
export class RPCRetryError extends RPCError {
  constructor(
    message: string,
    public readonly attempts: number
  ) {
    super(message);
    this.name = 'RPCRetryError';
  }
}

/**
 * Error thrown when RPC response is invalid
 */
export class RPCResponseError extends RPCError {
  constructor(
    message: string,
    public readonly response: any
  ) {
    super(message);
    this.name = 'RPCResponseError';
  }
} 