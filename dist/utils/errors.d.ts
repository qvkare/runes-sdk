/**
 * Base RPC error class
 */
export declare class RPCError extends Error {
    code?: number | undefined;
    data?: unknown;
    constructor(message: string, code?: number | undefined, data?: unknown);
}
/**
 * Error thrown when RPC request times out
 */
export declare class RPCTimeoutError extends RPCError {
    constructor();
}
/**
 * Error thrown when RPC request fails after max retries
 */
export declare class RPCRetryError extends RPCError {
    readonly attempts: number;
    constructor(message: string, attempts: number);
}
/**
 * Error thrown when RPC response is invalid
 */
export declare class RPCResponseError extends RPCError {
    readonly response: Record<string, unknown>;
    constructor(message: string, response: Record<string, unknown>);
}
export declare class ValidationError extends Error {
    errors: string[];
    constructor(message: string, errors: string[]);
}
export declare class NetworkError extends Error {
    constructor(message: string);
}
export declare class TimeoutError extends Error {
    constructor(message: string);
}
export declare class ConfigError extends Error {
    constructor(message: string);
}
export declare class ServiceError extends Error {
    details?: unknown;
    constructor(message: string, details?: unknown);
}
