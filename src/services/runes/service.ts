import { RpcClient } from '../../types/rpc.types';
import { Logger } from '../../types/logger.types';
import { Transaction } from '../../types/transaction.types';

export class RunesService {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly logger: Logger
  ) {}

  async createRune(name: string, symbol: string, totalSupply: string): Promise<Transaction> {
    this.logger.info(`Creating rune ${name} (${symbol}) with total supply ${totalSupply}`);
    const result = await this.rpcClient.call('createrune', [name, symbol, totalSupply]);
    return result as Transaction;
  }

  async transferRune(
    runeId: string, 
    recipient: string, 
    amount: string
  ): Promise<Transaction> {
    this.logger.info(`Transferring ${amount} of rune ${runeId} to ${recipient}`);
    const result = await this.rpcClient.call('transferrune', [runeId, recipient, amount]);
    return result as Transaction;
  }

  async burnRune(runeId: string, amount: string): Promise<Transaction> {
    this.logger.info(`Burning ${amount} of rune ${runeId}`);
    const result = await this.rpcClient.call('burnrune', [runeId, amount]);
    return result as Transaction;
  }

  async mintRune(runeId: string, amount: string): Promise<Transaction> {
    this.logger.info(`Minting ${amount} of rune ${runeId}`);
    const result = await this.rpcClient.call('mintrune', [runeId, amount]);
    return result as Transaction;
  }

  async getRuneInfo(runeId: string): Promise<any> {
    this.logger.info(`Getting info for rune ${runeId}`);
    const result = await this.rpcClient.call('getruneinfo', [runeId]);
    return result;
  }

  async listRunes(limit?: number, offset?: number): Promise<any[]> {
    this.logger.info('Listing runes');
    const result = await this.rpcClient.call('listrunes', [limit, offset]);
    return result as any[];
  }

  async getRuneBalance(runeId: string, address: string): Promise<string> {
    this.logger.info(`Getting balance of rune ${runeId} for address ${address}`);
    const result = await this.rpcClient.call('getrunebalance', [runeId, address]);
    return result as string;
  }

  async getRuneHistory(runeId: string, limit?: number, offset?: number): Promise<Transaction[]> {
    this.logger.info(`Getting history for rune ${runeId}`);
    const result = await this.rpcClient.call('getrunehistory', [runeId, limit, offset]);
    return result as Transaction[];
  }
} 