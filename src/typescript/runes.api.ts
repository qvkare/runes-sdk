import { RpcClient } from '../utils/rpc.client';
import { Transaction } from './types/transaction.types';

export class RunesAPI {
  constructor(private readonly rpcClient: RpcClient) {}

  async getTransaction(txid: string): Promise<Transaction> {
    return this.rpcClient.call('gettransaction', [txid]);
  }
}
