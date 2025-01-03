export class RpcClient {
    private baseUrl: string;
    private timeout: number;

    constructor(baseUrl: string, timeout: number = 30000) {
        this.baseUrl = baseUrl;
        this.timeout = timeout;
    }

    async call<T>(method: string, params: any[] = []): Promise<T> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: Date.now(),
                    method,
                    params,
                }),
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }

            return data.result;
        } finally {
            clearTimeout(timeoutId);
        }
    }
} 