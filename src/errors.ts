export type RunesErrorCode =
  | 'VALIDATION_ERROR'
  | 'RPC_ERROR'
  | 'NETWORK_ERROR'
  | 'BATCH_ERROR'
  | 'HISTORY_ERROR'
  | 'SECURITY_ERROR'
  | 'LIQUIDITY_ERROR'
  | 'ORDER_ERROR'
  | 'PERFORMANCE_ERROR';

export class RunesError extends Error {
  constructor(
    message: string,
    public code: RunesErrorCode
  ) {
    super(message);
    this.name = 'RunesError';
  }
}

export class RPCError extends RunesError {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message, 'RPC_ERROR');
    this.name = 'RPCError';
  }
}
