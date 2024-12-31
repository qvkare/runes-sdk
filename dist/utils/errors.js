"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityError = exports.ServiceError = exports.ConfigError = exports.TimeoutError = exports.NetworkError = exports.ValidationError = exports.RunesSDKError = exports.RPCResponseError = exports.RPCRetryError = exports.RPCTimeoutError = exports.RPCError = void 0;
/**
 * Base RPC error class
 */
class RPCError extends Error {
    constructor(message, code = -32603) {
        super(message);
        this.code = code;
        this.name = 'RPCError';
    }
}
exports.RPCError = RPCError;
/**
 * Error thrown when RPC request times out
 */
class RPCTimeoutError extends RPCError {
    constructor(message) {
        super(message, -32603);
        this.name = 'RPCTimeoutError';
    }
}
exports.RPCTimeoutError = RPCTimeoutError;
/**
 * Error thrown when RPC request fails after max retries
 */
class RPCRetryError extends RPCError {
    constructor(message) {
        super(message, -32603);
        this.name = 'RPCRetryError';
    }
}
exports.RPCRetryError = RPCRetryError;
/**
 * Error thrown when RPC response is invalid
 */
class RPCResponseError extends RPCError {
    constructor(message, response) {
        super(message, -32603);
        this.response = response;
        this.name = 'RPCResponseError';
    }
}
exports.RPCResponseError = RPCResponseError;
class RunesSDKError extends Error {
    constructor(message) {
        super(message);
        this.name = 'RunesSDKError';
    }
}
exports.RunesSDKError = RunesSDKError;
class ValidationError extends RunesSDKError {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class NetworkError extends RunesSDKError {
    constructor(message) {
        super(message);
        this.name = 'NetworkError';
    }
}
exports.NetworkError = NetworkError;
class TimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TimeoutError';
    }
}
exports.TimeoutError = TimeoutError;
class ConfigError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConfigError';
    }
}
exports.ConfigError = ConfigError;
class ServiceError extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'ServiceError';
    }
}
exports.ServiceError = ServiceError;
class SecurityError extends RunesSDKError {
    constructor(message) {
        super(message);
        this.name = 'SecurityError';
    }
}
exports.SecurityError = SecurityError;
