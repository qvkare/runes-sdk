"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceError = exports.ConfigError = exports.TimeoutError = exports.NetworkError = exports.ValidationError = exports.RPCResponseError = exports.RPCRetryError = exports.RPCTimeoutError = exports.RPCError = void 0;
/**
 * Base RPC error class
 */
class RPCError extends Error {
    constructor(message, code, data) {
        super(message);
        this.code = code;
        this.data = data;
        this.name = 'RPCError';
    }
}
exports.RPCError = RPCError;
/**
 * Error thrown when RPC request times out
 */
class RPCTimeoutError extends RPCError {
    constructor() {
        super('RPC request timed out');
        this.name = 'RPCTimeoutError';
    }
}
exports.RPCTimeoutError = RPCTimeoutError;
/**
 * Error thrown when RPC request fails after max retries
 */
class RPCRetryError extends RPCError {
    constructor(message, attempts) {
        super(message);
        this.attempts = attempts;
        this.name = 'RPCRetryError';
    }
}
exports.RPCRetryError = RPCRetryError;
/**
 * Error thrown when RPC response is invalid
 */
class RPCResponseError extends RPCError {
    constructor(message, response) {
        super(message);
        this.response = response;
        this.name = 'RPCResponseError';
    }
}
exports.RPCResponseError = RPCResponseError;
class ValidationError extends Error {
    constructor(message, errors) {
        super(message);
        this.errors = errors;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class NetworkError extends Error {
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
