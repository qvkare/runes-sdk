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

export class RunesError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends RunesError {
  constructor(
    message: string,
    public errors: string[] = []
  ) {
    super(message, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export class NetworkError extends RunesError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
  }
}

export class SecurityError extends RunesError {
  constructor(message: string) {
    super(message, 'SECURITY_ERROR');
    this.name = 'SecurityError';
  }
}

export class BatchError extends RunesError {
  constructor(message: string) {
    super(message, 'BATCH_ERROR');
    this.name = 'BatchError';
  }
}

export class MonitoringError extends RunesError {
  constructor(message: string) {
    super(message, 'MONITORING_ERROR');
    this.name = 'MonitoringError';
  }
}

export class LiquidityError extends RunesError {
  constructor(message: string) {
    super(message, 'LIQUIDITY_ERROR');
    this.name = 'LiquidityError';
  }
}

export class OrderError extends RunesError {
  constructor(message: string) {
    super(message, 'ORDER_ERROR');
    this.name = 'OrderError';
  }
}

export class PerformanceError extends RunesError {
  constructor(message: string) {
    super(message, 'PERFORMANCE_ERROR');
    this.name = 'PerformanceError';
  }
}
