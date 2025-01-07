import { Transaction } from './transaction.types';

export interface RpcClient {
  getTransaction(txid: string): Promise<Transaction>;
  sendRawTransaction(hexstring: string): Promise<string>;
  validateTransaction(txid: string): Promise<boolean>;
  sendTransaction(transaction: Transaction): Promise<string>;
  watchTransaction(txid: string): Promise<void>;
  stopWatchingTransaction(txid: string): Promise<void>;
  getBalance(address: string): Promise<number>;
  call(method: string, params: any[]): Promise<any>;
}

export interface RpcConfig {
  url: string;
  username?: string;
  password?: string;
}
