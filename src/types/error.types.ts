/**
 * Base error class for SDK errors
 */
export class RuneError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'RuneError';
  }
}

/**
 * Transaction related errors
 */
export class TransactionError extends RuneError {
  constructor(message: string, details?: unknown) {
    super(message, 'TRANSACTION_ERROR', details);
    this.name = 'TransactionError';
  }
}

/**
 * Validation related errors
 */
export class ValidationError extends RuneError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * RPC connection related errors
 */
export class RpcError extends RuneError {
  constructor(message: string, details?: unknown) {
    super(message, 'RPC_ERROR', details);
    this.name = 'RpcError';
  }
} 