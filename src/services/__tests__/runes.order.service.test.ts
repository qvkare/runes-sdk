import { RunesOrderService } from '../runes.order.service';
import { RPCClient } from '../../utils/rpc.client';
import { Logger } from '../../utils/logger';
import { createMockLogger, createMockRpcClient } from '../../utils/__tests__/test.utils';

export enum OrderType {
  BUY = 'buy',
  SELL = 'sell'
}

describe('RunesOrderService', () => {
  let orderService: RunesOrderService;
  let mockRpcClient: jest.Mocked<RPCClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = createMockLogger('RunesOrderService');
    mockRpcClient = createMockRpcClient(mockLogger);
    orderService = new RunesOrderService(mockRpcClient, mockLogger);
  });

  describe('createOrder', () => {
    const orderParams = {
      runeId: 'rune123',
      amount: '100',
      price: '10.5',
      type: OrderType.BUY
    };

    it('should create order successfully', async () => {
      const mockResponse = {
        result: { orderId: 'order123' }
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await orderService.createOrder(orderParams);
      expect(result).toEqual(mockResponse.result);
      expect(mockRpcClient.call).toHaveBeenCalledWith('createorder', [
        orderParams.runeId,
        orderParams.amount,
        orderParams.price,
        orderParams.type
      ]);
    });

    it('should handle RPC errors', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(orderService.createOrder(orderParams)).rejects.toThrow('Failed to create order');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle invalid RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce({ result: null });

      await expect(orderService.createOrder(orderParams)).rejects.toThrow('Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Invalid response from RPC');
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const orderId = 'order123';
      const mockResponse = {
        result: { success: true }
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await orderService.cancelOrder(orderId);
      expect(result).toBe(true);
      expect(mockRpcClient.call).toHaveBeenCalledWith('cancelorder', [orderId]);
    });

    it('should handle RPC errors', async () => {
      const orderId = 'invalid_order';
      mockRpcClient.call.mockRejectedValueOnce(new Error('RPC error'));

      await expect(orderService.cancelOrder(orderId)).rejects.toThrow('Failed to cancel order');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle invalid RPC response', async () => {
      const orderId = 'order123';
      mockRpcClient.call.mockResolvedValueOnce({ result: null });

      await expect(orderService.cancelOrder(orderId)).rejects.toThrow('Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Invalid response from RPC');
    });
  });
}); 