import { Logger } from '../utils/logger';
import { RPCClient } from '../utils/rpc.client';
import { OrderParams, OrderResult } from '../types';

export class RunesOrderService {
  constructor(
    private readonly rpcClient: RPCClient,
    private readonly logger: Logger
  ) {}

  async createOrder(params: OrderParams): Promise<OrderResult> {
    try {
      this.logger.info('Creating order:', params);
      const response = await this.rpcClient.call<OrderResult>('createorder', [
        params.runeId,
        params.amount,
        params.price,
        params.type
      ]);

      if (!response.result) {
        throw new Error('Invalid response from RPC');
      }

      return response.result;
    } catch (error) {
      this.logger.error('Failed to create order:', error);
      throw new Error('Failed to create order');
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      this.logger.info('Cancelling order:', orderId);
      const response = await this.rpcClient.call<{ success: boolean }>('cancelorder', [orderId]);

      if (!response.result) {
        throw new Error('Invalid response from RPC');
      }

      return response.result.success;
    } catch (error) {
      this.logger.error('Failed to cancel order:', error);
      throw new Error('Failed to cancel order');
    }
  }
} 