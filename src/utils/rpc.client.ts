import { RPCClientConfig } from '../types';
import { Logger } from './logger';

export class RPCClient {
  private readonly url: string;
  private readonly auth: { username: string; password: string };
  private readonly logger: Logger;
  private readonly config: RPCClientConfig;

  constructor(config: RPCClientConfig, logger: Logger) {
    this.url = config.url;
    this.auth = config.auth;
    this.logger = logger;
    this.config = config;
  }

  async call(method: string, params?: any[]): Promise<any> {
    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${this.auth.username}:${this.auth.password}`
          ).toString('base64')}`,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params: params || [],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      return data.result;
    } catch (error) {
      this.logger.error(`RPC call failed for method ${method}:`, error);
      throw error;
    }
  }
}
