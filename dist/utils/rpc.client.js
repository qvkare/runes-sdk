"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RPCClient = void 0;
class RPCClient {
    constructor(url, username, password, logger) {
        this.url = url;
        this.username = username;
        this.password = password;
        this.logger = logger;
        this.id = 0;
    }
    async call(method, params = []) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (this.username && this.password) {
                const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
                headers['Authorization'] = `Basic ${auth}`;
            }
            const response = await fetch(this.url, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: ++this.id,
                    method,
                    params,
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (data.error) {
                throw new Error(`RPC error: ${data.error.message} (code: ${data.error.code})`);
            }
            return data.result;
        }
        catch (error) {
            this.logger?.error(`Failed to make RPC call: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw new Error(`Failed to make RPC call: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.RPCClient = RPCClient;
