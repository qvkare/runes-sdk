import { RpcClient } from '../../utils/rpc.client';
import { Logger } from '../../types/logger.types';

export class RunesOrderService {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly logger: Logger
  ) {}

  async createOrder(params: {
    runeId: string;
    amount: number;
    price: number;
    type: 'buy' | 'sell';
  }): Promise<any> {
    try {
      return await this.rpcClient.call('createorder', [params]);
    } catch (error) {
      this.logger.error(`Failed to create order: ${error}`);
      throw new Error(`Failed to create order: ${error}`);
    }
  }

  async cancelOrder(orderId: string): Promise<any> {
    try {
      return await this.rpcClient.call('cancelorder', [orderId]);
    } catch (error) {
      this.logger.error(`Failed to cancel order: ${error}`);
      throw new Error(`Failed to cancel order: ${error}`);
    }
  }

  async getOrderStatus(orderId: string): Promise<any> {
    try {
      return await this.rpcClient.call('getorderstatus', [orderId]);
    } catch (error) {
      this.logger.error(`Failed to get order status: ${error}`);
      throw new Error(`Failed to get order status: ${error}`);
    }
  }
}
