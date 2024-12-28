/**
 * JSON-RPC 2.0 request object
 */
export interface RPCRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: any[];
}

/**
 * JSON-RPC 2.0 response
 */
export interface RPCResponse {
  jsonrpc: '2.0';
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

/**
 * RPC client options
 */
export interface RPCClientOptions {
  /**
   * Request timeout in milliseconds
   */
  timeout?: number;

  /**
   * Maximum number of retry attempts
   */
  maxRetries?: number;

  /**
   * Base delay between retries in milliseconds
   */
  retryDelay?: number;
} 