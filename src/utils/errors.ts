/**
 * Base RPC error class
 */
export class RPCError extends Error {
  constructor(
    message: string,
    public code?: number,
    public data?: unknown
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
    public readonly response: Record<string, unknown>
  ) {
    super(message);
    this.name = 'RPCResponseError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: string[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export class ServiceError extends Error {
  constructor(
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ServiceError';
  }
} 