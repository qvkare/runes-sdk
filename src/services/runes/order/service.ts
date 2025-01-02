import { RpcClient } from '../../../types/rpc.types';
import { Logger } from '../../../types/logger.types';

export class RunesOrderService {
  constructor(
    private rpcClient: RpcClient,
    private logger: Logger
  ) {}

  async createOrder(runeId: string, amount: string, price: string): Promise<boolean> {
    try {
      const result = await this.rpcClient.call('createruneorder', [runeId, amount, price]);
      return result;
    } catch (error) {
      this.logger.error('Failed to create rune order:', error);
      throw new Error('Failed to create rune order');
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      const result = await this.rpcClient.call('cancelruneorder', [orderId]);
      return result;
    } catch (error) {
      this.logger.error('Failed to cancel rune order:', error);
      throw new Error('Failed to cancel rune order');
    }
  }

  async getOrder(orderId: string): Promise<any> {
    try {
      const order = await this.rpcClient.call('getruneorder', [orderId]);
      return order;
    } catch (error) {
      this.logger.error('Failed to get rune order:', error);
      throw new Error('Failed to get rune order');
    }
  }
}
