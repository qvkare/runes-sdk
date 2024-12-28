import { RunesOrderService } from '../runes.order.service';
import { RPCClient } from '../../utils/rpc.client';
import { jest } from '@jest/globals';

jest.mock('../../utils/rpc.client');

describe('RunesOrderService', () => {
  let orderService: RunesOrderService;
  let mockRpcClient: jest.Mocked<RPCClient>;

  beforeEach(() => {
    mockRpcClient = new RPCClient({
      baseUrl: 'http://localhost:8332',
    }) as jest.Mocked<RPCClient>;
    orderService = new RunesOrderService(mockRpcClient);
  });

  describe('placeOrder', () => {
    it('should place a new order', async () => {
      const mockResponse = {
        orderId: 'order1',
        status: 'pending',
      };

      mockRpcClient.call.mockResolvedValue(mockResponse);

      const order = {
        runesId: 'rune1',
        amount: BigInt(1000),
        price: BigInt(100),
        type: 'buy',
      };

      const result = await orderService.placeOrder(order);

      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('placeorder', [order]);
    });

    it('should handle order placement errors', async () => {
      mockRpcClient.call.mockRejectedValue(new Error('Failed to place order'));

      const order = {
        runesId: 'rune1',
        amount: BigInt(1000),
        price: BigInt(100),
        type: 'buy',
      };

      await expect(orderService.placeOrder(order)).rejects.toThrow('Failed to place order');
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an existing order', async () => {
      const mockResponse = {
        orderId: 'order1',
        status: 'cancelled',
      };

      mockRpcClient.call.mockResolvedValue(mockResponse);

      const result = await orderService.cancelOrder('order1');

      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('cancelorder', ['order1']);
    });

    it('should handle order cancellation errors', async () => {
      mockRpcClient.call.mockRejectedValue(new Error('Failed to cancel order'));

      await expect(orderService.cancelOrder('order1')).rejects.toThrow('Failed to cancel order');
    });
  });

  describe('getOrderStatus', () => {
    it('should get order status', async () => {
      const mockResponse = {
        orderId: 'order1',
        status: 'filled',
        filledAmount: '1000',
        remainingAmount: '0',
      };

      mockRpcClient.call.mockResolvedValue(mockResponse);

      const result = await orderService.getOrderStatus('order1');

      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getorderstatus', ['order1']);
    });

    it('should handle order status errors', async () => {
      mockRpcClient.call.mockRejectedValue(new Error('Failed to get order status'));

      await expect(orderService.getOrderStatus('order1')).rejects.toThrow('Failed to get order status');
    });
  });
}); 