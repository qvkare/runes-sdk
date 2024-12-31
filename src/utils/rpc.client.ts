import { Logger } from './logger';
import { RPCResponse } from '../types';

interface RPCClientConfig {
  logger: Logger;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export class RPCClient {
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private readonly logger: Logger;

  constructor(
    public readonly baseUrl: string,
    config: RPCClientConfig
  ) {
    this.logger = config.logger;
    this.timeout = config.timeout || 5000;
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;
  }

  async call<T>(method: string, params: unknown[] = []): Promise<RPCResponse<T>> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.info(`Making RPC call to ${method}`, { attempt, params });
        const response = await this.makeRequest<T>(method, params);
        
        if (response.error) {
          throw new Error(response.error.message);
        }

        if (!response.result) {
          throw new Error('Invalid response from RPC');
        }
        
        return response;
      } catch (_error) {
        lastError = _error as Error;
        if (attempt < this.maxRetries) {
          this.logger.warn(`RPC call failed, retrying...`, { attempt, _error });
          await this.delay(this.retryDelay);
        }
      }
    }
    
    throw lastError || new Error('RPC call failed');
  }

  private async makeRequest<T>(method: string, params: unknown[]): Promise<RPCResponse<T>> {
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
      } catch (_error) {
        if (_error instanceof Error) {
          if (_error.name === 'AbortError') {
            throw new Error('Request timed out');
          }
          throw new Error(`Network error: ${_error.message}`);
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
      } catch (_error) {
        throw new Error('Invalid JSON response');
      }
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 