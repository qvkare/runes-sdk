import { Logger } from '../typescript/services/logger/logger.service';

export class RpcClient {
    private headers: { [key: string]: string } = {};
    private logger?: Logger;

    constructor(
        private readonly url: string,
        logger?: Logger
    ) {
        if (!url) {
            throw new Error('Invalid RPC URL');
        }
        this.logger = logger;
        this.headers['Content-Type'] = 'application/json';
    }

    setHeader(name: string, value: string): void {
        if (!name) {
            throw new Error('Invalid header name');
        }
        this.headers[name] = value;
    }

    removeHeader(name: string): void {
        delete this.headers[name];
    }

    clearHeaders(): void {
        this.headers = {};
    }

    getHeaders(): { [key: string]: string } {
        return { ...this.headers };
    }

    async call<T = any>(method: string, params: any[] = []): Promise<T> {
        try {
            const response = await fetch(this.url, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: Date.now(),
                    method,
                    params
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.validateRpcResponse(data);
        } catch (error) {
            this.logger?.error('RPC call failed', error);
            throw error;
        }
    }

    private validateRpcResponse(response: any): any {
        if (!response || typeof response !== 'object') {
            throw new Error('Invalid RPC response');
        }

        if (response.error) {
            const error = response.error;
            const message = error.message || error.toString();
            const code = error.code ? ` (code: ${error.code})` : '';
            throw new Error(`RPC Error: ${message}${code}`);
        }

        if (!('result' in response)) {
            throw new Error('Invalid RPC response');
        }

        return response.result;
    }
}
