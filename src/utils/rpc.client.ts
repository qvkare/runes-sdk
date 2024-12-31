import { Logger } from './logger';

export interface RPCResponse<T = unknown> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
}

export class RPCClient {
  private id = 0;

  constructor(
    private readonly url: string,
    private readonly username: string,
    private readonly password: string,
    private readonly logger?: Logger
  ) {}

  async call<T = any>(method: string, params: any[] = []): Promise<T> {
    try {
      const headers: HeadersInit = {
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

      const data: RPCResponse<T> = await response.json();

      if (data.error) {
        throw new Error(`RPC error: ${data.error.message} (code: ${data.error.code})`);
      }

      return data.result as T;
    } catch (error) {
      this.logger?.error(`Failed to make RPC call: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error(`Failed to make RPC call: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 