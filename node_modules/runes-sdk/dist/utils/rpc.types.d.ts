/**
 * JSON-RPC 2.0 request object
 */
export interface RPCRequest {
    jsonrpc: string;
    id: string | number;
    method: string;
    params: unknown[];
}
/**
 * JSON-RPC 2.0 response
 */
export interface RPCResponse {
    jsonrpc: string;
    id: string | number;
    result: Record<string, unknown>;
    error: null | {
        code: number;
        message: string;
        data?: unknown;
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
export interface RPCConfig {
    baseUrl: string;
    auth?: {
        username: string;
        password: string;
    };
    timeout?: number;
    maxRetries?: number;
    retryDelay?: number;
    network?: string;
}
