/**
 * Base RPC error class
 */
export declare class RPCError extends Error {
    readonly code: number;
    constructor(message: string, code?: number);
}
/**
 * Error thrown when RPC request times out
 */
export declare class RPCTimeoutError extends RPCError {
    constructor(message: string);
}
/**
 * Error thrown when RPC request fails after max retries
 */
export declare class RPCRetryError extends RPCError {
    constructor(message: string);
}
/**
 * Error thrown when RPC response is invalid
 */
export declare class RPCResponseError extends RPCError {
    readonly response: Record<string, unknown>;
    constructor(message: string, response: Record<string, unknown>);
}
export declare class RunesSDKError extends Error {
    constructor(message: string);
}
export declare class ValidationError extends RunesSDKError {
    constructor(message: string);
}
export declare class NetworkError extends RunesSDKError {
    constructor(message: string);
}
export declare class TimeoutError extends Error {
    constructor(message: string);
}
export declare class ConfigError extends Error {
    constructor(message: string);
}
export declare class ServiceError extends Error {
    details?: unknown | undefined;
    constructor(message: string, details?: unknown | undefined);
}
export declare class SecurityError extends RunesSDKError {
    constructor(message: string);
}
