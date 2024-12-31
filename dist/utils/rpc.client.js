"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RPCClient = void 0;
class RPCClient {
    constructor(baseUrl, config) {
        this.baseUrl = baseUrl;
        this.logger = config.logger;
        this.timeout = config.timeout || 5000;
        this.maxRetries = config.maxRetries || 3;
        this.retryDelay = config.retryDelay || 1000;
    }
    async call(method, params = []) {
        let lastError;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                this.logger.info(`Making RPC call to ${method}`, { attempt, params });
                const response = await this.makeRequest(method, params);
                if (response.error) {
                    throw new Error(response.error.message);
                }
                if (!response.result) {
                    throw new Error('Invalid response from RPC');
                }
                return response;
            }
            catch (error) {
                lastError = error;
                if (attempt < this.maxRetries) {
                    this.logger.warn(`RPC call failed, retrying...`, { attempt, error });
                    await this.delay(this.retryDelay);
                }
            }
        }
        throw lastError || new Error('RPC call failed');
    }
    async makeRequest(method, params) {
        const requestBody = {
            jsonrpc: '2.0',
            id: Date.now(),
            method,
            params
        };
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            let response;
            try {
                response = await fetch(this.baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody),
                    signal: controller.signal
                });
            }
            catch (error) {
                if (error instanceof Error) {
                    if (error.name === 'AbortError') {
                        throw new Error('Request timed out');
                    }
                    throw new Error(`Network error: ${error.message}`);
                }
                throw new Error('Network error: Unknown error');
            }
            if (!response) {
                throw new Error('No response received');
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            let data;
            try {
                data = await response.json();
            }
            catch (error) {
                throw new Error('Invalid JSON response');
            }
            if (data.error) {
                throw new Error(data.error.message);
            }
            return data;
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.RPCClient = RPCClient;
