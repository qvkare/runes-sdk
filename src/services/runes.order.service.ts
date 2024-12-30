import { RPCClient } from '../utils/rpc.client';
import { RunesValidator } from '../utils/runes.validator';
import { Logger } from '../utils/logger';
import { OrderParams, OrderBook, OrderHistory } from '../types/order.types';

export class RunesOrderService {
  constructor(
    private readonly rpcClient: RPCClient,
    private readonly validator: RunesValidator,
    private readonly logger: Logger
  ) {}

  async createOrder(params: OrderParams): Promise<{ orderId: string }> {
    const validation = await this.validator.validateRuneSymbol(params.runeId);
    if (!validation.isValid) {
      throw new Error('Invalid rune symbol');
    }

    return this.rpcClient.call('createorder', [params]);
  }

  async cancelOrder(orderId: string): Promise<{ success: boolean }> {
    return this.rpcClient.call('cancelorder', [orderId]);
  }

  async getOrderBook(runeId: string): Promise<OrderBook> {
    const validation = await this.validator.validateRuneSymbol(runeId);
    if (!validation.isValid) {
      throw new Error('Invalid rune symbol');
    }

    return this.rpcClient.call('getorderbook', [runeId]);
  }

  async getOpenOrders(address: string): Promise<OrderHistory> {
    const validation = await this.validator.validateAddress(address);
    if (!validation.isValid) {
      throw new Error('Invalid address');
    }

    return this.rpcClient.call('getopenorders', [address]);
  }

  async getOrderHistory(address: string): Promise<OrderHistory> {
    const validation = await this.validator.validateAddress(address);
    if (!validation.isValid) {
      throw new Error('Invalid address');
    }

    return this.rpcClient.call('getorderhistory', [address]);
  }
}
