import { Logger } from './logger';
import { RPCConfig, RPCRequest, RPCResponse } from './rpc.types';
import { RPCError } from './errors';

export class RPCClient extends Logger {
  private config: RPCConfig;

  constructor(config: RPCConfig) {
    super('RPCClient');
    this.config = {
      timeout: 30000,
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  private async makeRequest(request: RPCRequest): Promise<RPCResponse> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.config.auth) {
      const authString = Buffer.from(
        `${this.config.auth.username}:${this.config.auth.password}`
      ).toString('base64');
      headers['Authorization'] = `Basic ${authString}`;
    }

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.config.timeout || 30000),
      });

      if (!response.ok) {
        throw new RPCError(`HTTP error: ${response.status} ${response.statusText}`);
      }

      return await response.json() as RPCResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw new RPCError(`Network error: ${error.message}`);
      }
      throw new RPCError('Unknown error occurred');
    }
  }

  async call(method: string, params: unknown[] = []): Promise<Record<string, unknown>> {
    let retries = 0;
    const maxRetries = this.config.maxRetries || 3;
    const retryDelay = this.config.retryDelay || 1000;

    do {
      try {
        const request: RPCRequest = {
          jsonrpc: '2.0',
          method,
          params,
          id: Date.now(),
        };

        const response = await this.makeRequest(request);

        if (response.error) {
          throw new RPCError(
            `RPC error ${response.error.code}: ${response.error.message}`,
            response.error.code,
            response.error.data
          );
        }

        return response.result;
      } catch (error) {
        if (retries >= maxRetries) {
          if (error instanceof Error) {
            throw new RPCError(`Max retries reached: ${error.message}`);
          }
          throw new RPCError('Max retries reached with unknown error');
        }

        retries++;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    } while (retries <= maxRetries);

    throw new RPCError('Max retries reached');
  }
} 