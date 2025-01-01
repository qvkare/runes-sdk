import { Logger } from '../types/logger.types';
import { Transaction } from '../types/transaction.types';

export class RpcClient {
  constructor(
    private readonly url: string,
    private readonly username: string,
    private readonly password: string,
    private readonly logger?: Logger
  ) {}

  async call(method: string, params: any[] = []): Promise<any> {
    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Basic ' + Buffer.from(`${this.username}:${this.password}`).toString('base64'),
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params,
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
      this.logger?.error(`RPC call failed (${method}):`, error);
      throw error;
    }
  }

  async getTransaction(txid: string): Promise<Transaction> {
    return this.call('gettransaction', [txid]);
  }

  async getBalance(address: string): Promise<string> {
    return this.call('getbalance', [address]);
  }

  async sendTransaction(tx: Transaction): Promise<string> {
    return this.call('sendrawtransaction', [tx]);
  }

  async validateTransaction(txid: string): Promise<boolean> {
    return this.call('validatetransaction', [txid]);
  }
}
