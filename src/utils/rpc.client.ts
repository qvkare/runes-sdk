import { BitcoinConfig } from '../config/bitcoin.config';
import { RPCError, RPCTimeoutError, RPCRetryError, RPCResponseError } from './errors';
import { RPCRequest, RPCResponse, RPCClientOptions } from './rpc.types';

/**
 * JSON-RPC 2.0 client for Bitcoin Core
 */
export class RPCClient {
  private readonly baseUrl: string;
  private readonly auth: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(
    private readonly config: BitcoinConfig,
    options: RPCClientOptions = {}
  ) {
    this.baseUrl = config.rpcUrl;
    this.auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');
    this.timeout = options.timeout ?? config.timeout ?? 30000;
    this.maxRetries = options.maxRetries ?? config.maxRetries ?? 3;
    this.retryDelay = options.retryDelay ?? 1000;
  }

  /**
   * Makes an RPC call to Bitcoin Core
   * @param method RPC method name
   * @param params RPC method parameters
   * @returns Promise with the RPC response
   * @throws {RPCError} When RPC call fails
   */
  async call<T = any>(method: string, params: any[] = []): Promise<T> {
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < this.maxRetries) {
      try {
        return await this.makeRequest<T>(method, params);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempts++;

        if (error instanceof RPCTimeoutError) {
          throw error;
        }

        if (error instanceof RPCError && this.shouldRetry(error)) {
          await this.delay(this.getRetryDelay(attempts));
          continue;
        }

        throw error;
      }
    }

    throw new RPCRetryError(
      `Failed after ${attempts} attempts: ${lastError?.message}`,
      attempts
    );
  }

  /**
   * Makes a single RPC request
   * @param method RPC method name
   * @param params RPC method parameters
   * @returns Promise with the RPC response
   * @throws {RPCError} When RPC call fails
   */
  private async makeRequest<T>(method: string, params: any[]): Promise<T> {
    const request: RPCRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.auth}`
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new RPCError(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as RPCResponse;
      return this.handleResponse<T>(data);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new RPCTimeoutError();
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Handles RPC response
   * @param response RPC response object
   * @returns Response result
   * @throws {RPCError} When response contains an error
   */
  private handleResponse<T>(response: RPCResponse): T {
    if ('error' in response) {
      throw new RPCError(
        response.error.message,
        response.error.code,
        response.error.data
      );
    }

    if (!('result' in response)) {
      throw new RPCResponseError('Invalid RPC response', response);
    }

    return response.result;
  }

  /**
   * Determines if an error should trigger a retry
   * @param error Error to check
   * @returns True if should retry
   */
  private shouldRetry(error: Error): boolean {
    if (error instanceof RPCError) {
      // Retry on connection errors or specific Bitcoin Core errors
      return error.code === -28 || // Loading block index
             error.code === -8;    // Server in warmup
    }
    return false;
  }

  /**
   * Calculates retry delay with exponential backoff
   * @param attempt Current attempt number
   * @returns Delay in milliseconds
   */
  private getRetryDelay(attempt: number): number {
    return Math.min(
      this.retryDelay * Math.pow(2, attempt - 1),
      this.timeout
    );
  }

  /**
   * Delays execution
   * @param ms Milliseconds to delay
   * @returns Promise that resolves after delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 