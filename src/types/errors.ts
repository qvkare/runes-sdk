/**
 * Base error class for SDK errors
 */
export class SDKError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SDKError';
  }
}

/**
 * RPC specific error class
 */
export class RPCError extends SDKError {
  constructor(
    message: string,
    public readonly code: number
  ) {
    super(message);
    this.name = 'RPCError';
  }
}

/**
 * Validation error class
 */
export class ValidationError extends SDKError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Network error class
 */
export class NetworkError extends SDKError {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Block synchronization error class
 */
export class BlockSyncError extends SDKError {
  constructor(message: string) {
    super(message);
    this.name = 'BlockSyncError';
  }
}
