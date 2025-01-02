import { RpcClient, RpcConfig } from '../types/rpc.types';
import { Transaction } from '../types/transaction.types';

export class RpcUtils implements RpcClient {
  url: string;
  username?: string;
  password?: string;
  private activeWatchers: Map<string, NodeJS.Timeout>;

  constructor(url: string, username?: string, password?: string) {
    this.url = url;
    this.username = username;
    this.password = password;
    this.activeWatchers = new Map();
  }

  async call(method: string, params?: any[]): Promise<any> {
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
        id: Date.now(),
        method,
        params: params || [],
      }),
    });

    if (!response.ok) {
      throw new Error(`RPC call failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`);
    }

    return data.result;
  }

  async getTransaction(txid: string): Promise<Transaction> {
    const result = await this.call('getrawtransaction', [txid, true]);
    return result as Transaction;
  }

  async getBalance(address: string): Promise<string> {
    const result = await this.call('getbalance', [address]);
    return result.toString();
  }

  async sendTransaction(tx: Transaction): Promise<string> {
    const serializedTx = this.serializeTransaction(tx);
    const result = await this.call('sendrawtransaction', [serializedTx]);
    return result;
  }

  async validateTransaction(txid: string): Promise<boolean> {
    try {
      const tx = await this.getTransaction(txid);
      const result = await this.call('verifytxoutproof', [tx]);
      return !!result;
    } catch (error) {
      return false;
    }
  }

  async watchTransaction(txid: string): Promise<void> {
    if (this.activeWatchers.has(txid)) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const tx = await this.getTransaction(txid);
        if (tx.confirmations >= 6) {
          this.stopWatchingTransaction(txid);
        }
      } catch (error) {
        // Transaction may not be in mempool yet
      }
    }, 10000); // Check every 10 seconds

    this.activeWatchers.set(txid, interval);
  }

  async stopWatchingTransaction(txid: string): Promise<void> {
    const interval = this.activeWatchers.get(txid);
    if (interval) {
      clearInterval(interval);
      this.activeWatchers.delete(txid);
    }
  }

  private serializeTransaction(tx: Transaction): string {
    // Transaction serialization implementation
    // Return a simple JSON string for this example
    return JSON.stringify(tx);
  }
}
