import { Transaction } from './transaction.types';

export interface RpcConfig {
  url: string;
  username?: string;
  password?: string;
}

export interface RpcTransaction {
  txid: string;
  confirmations: number;
  blockHash: string;
  blockHeight: number;
  timestamp: number;
  blockhash: string;
  blocktime: number;
  size: number;
  time: number;
}

export interface RpcClient {
  url: string;
  username?: string;
  password?: string;
  call(method: string, params?: any[]): Promise<any>;
  getTransaction(txid: string): Promise<Transaction>;
  getBalance(address: string): Promise<string>;
  sendTransaction(tx: Transaction): Promise<string>;
  validateTransaction(txid: string): Promise<boolean>;
  watchTransaction(txid: string): Promise<void>;
  stopWatchingTransaction(txid: string): Promise<void>;
}

export interface RpcError {
  code: number;
  message: string;
  data?: any;
}

export interface RpcResponse<T = any> {
  jsonrpc: '2.0';
  id: number | string;
  result?: T;
  error?: RpcError;
}

export interface RpcRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: any[];
}

export interface RpcBatchRequest {
  requests: RpcRequest[];
  timeout?: number;
}

export interface RpcBatchResponse {
  responses: RpcResponse[];
  errors: RpcError[];
}
