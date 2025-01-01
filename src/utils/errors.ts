/**
 * Base RPC error class
 */
export class RPCError extends Error {
  constructor(
    message: string,
    public readonly code: number = -32603
  ) {
    super(message);
    this.name = 'RPCError';
  }
}

/**
 * Error thrown when RPC request times out
 */
export class RPCTimeoutError extends RPCError {
  constructor(message: string) {
    super(message, -32603);
    this.name = 'RPCTimeoutError';
  }
}

/**
 * Error thrown when RPC request fails after max retries
 */
export class RPCRetryError extends RPCError {
  constructor(message: string) {
    super(message, -32603);
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
    super(message, -32603);
    this.name = 'RPCResponseError';
  }
}

export class RunesSDKError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RunesSDKError';
  }
}

export class ValidationError extends RunesSDKError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends RunesSDKError {
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

export class SecurityError extends RunesSDKError {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}
