import { RunesOrderService } from '../runes.order.service';
import { RPCClient } from '../../utils/rpc.client';
import { Logger } from '../../utils/logger';
import { createMockLogger } from '../../utils/test.utils';

jest.mock('../../utils/rpc.client');
jest.mock('../../utils/logger');

describe('RunesOrderService', () => {
  let orderService: RunesOrderService;
  let mockRpcClient: jest.Mocked<RPCClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockRpcClient = new RPCClient('url', 'user', 'pass', undefined) as jest.Mocked<RPCClient>;
    mockLogger = createMockLogger() as jest.Mocked<Logger>;
    orderService = new RunesOrderService(mockRpcClient, mockLogger);
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const orderParams = {
      runeId: 'rune123',
      amount: 100,
      price: 1.5,
      type: 'buy' as const
    };

    it('should create order successfully', async () => {
      const mockResponse = {
        orderId: 'order123',
        runeId: 'rune123',
        amount: 100,
        price: 1.5,
        type: 'buy',
        status: 'pending',
        timestamp: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await orderService.createOrder(orderParams);
      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('createorder', [orderParams]);
    });

    it('should handle invalid order parameters - missing runeId', async () => {
      const invalidParams = {
        runeId: '',
        amount: 100,
        price: 1.5,
        type: 'buy' as const
      };

      await expect(orderService.createOrder(invalidParams))
        .rejects
        .toThrow('Failed to create order: Invalid order parameters');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create order: Invalid order parameters');
    });

    it('should handle invalid order parameters - missing amount', async () => {
      const invalidParams = {
        runeId: 'rune123',
        amount: 0,
        price: 1.5,
        type: 'buy' as const
      };

      await expect(orderService.createOrder(invalidParams))
        .rejects
        .toThrow('Failed to create order: Invalid order parameters');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create order: Invalid order parameters');
    });

    it('should handle invalid order parameters - missing price', async () => {
      const invalidParams = {
        runeId: 'rune123',
        amount: 100,
        price: 0,
        type: 'buy' as const
      };

      await expect(orderService.createOrder(invalidParams))
        .rejects
        .toThrow('Failed to create order: Invalid order parameters');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create order: Invalid order parameters');
    });

    it('should handle invalid order parameters - missing type', async () => {
      const invalidParams = {
        runeId: 'rune123',
        amount: 100,
        price: 1.5,
        type: '' as any
      };

      await expect(orderService.createOrder(invalidParams))
        .rejects
        .toThrow('Failed to create order: Invalid order parameters');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create order: Invalid order parameters');
    });

    it('should handle invalid RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce(null);

      await expect(orderService.createOrder(orderParams))
        .rejects
        .toThrow('Failed to create order: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create order: Invalid response from RPC');
    });

    it('should handle RPC response without orderId', async () => {
      const invalidResponse = {
        runeId: 'rune123',
        amount: 100,
        price: 1.5,
        type: 'buy',
        status: 'pending',
        timestamp: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(invalidResponse);

      await expect(orderService.createOrder(orderParams))
        .rejects
        .toThrow('Failed to create order: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create order: Invalid response from RPC');
    });

    it('should handle RPC error', async () => {
      const error = new Error('Network error');
      mockRpcClient.call.mockRejectedValueOnce(error);

      await expect(orderService.createOrder(orderParams))
        .rejects
        .toThrow('Failed to create order: Network error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create order: Network error');
    });

    it('should handle unknown RPC error', async () => {
      mockRpcClient.call.mockRejectedValueOnce('Unknown error');

      await expect(orderService.createOrder(orderParams))
        .rejects
        .toThrow('Failed to create order: Unknown error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create order: Unknown error');
    });
  });

  describe('cancelOrder', () => {
    const orderId = 'order123';

    it('should cancel order successfully', async () => {
      const mockResponse = {
        orderId: 'order123',
        runeId: 'rune123',
        amount: 100,
        price: 1.5,
        type: 'buy',
        status: 'cancelled',
        timestamp: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await orderService.cancelOrder(orderId);
      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('cancelorder', [orderId]);
    });

    it('should handle missing orderId', async () => {
      await expect(orderService.cancelOrder(''))
        .rejects
        .toThrow('Failed to cancel order: Order ID is required');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to cancel order: Order ID is required');
    });

    it('should handle invalid RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce(null);

      await expect(orderService.cancelOrder(orderId))
        .rejects
        .toThrow('Failed to cancel order: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to cancel order: Invalid response from RPC');
    });

    it('should handle RPC response without orderId', async () => {
      const invalidResponse = {
        runeId: 'rune123',
        amount: 100,
        price: 1.5,
        type: 'buy',
        status: 'cancelled',
        timestamp: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(invalidResponse);

      await expect(orderService.cancelOrder(orderId))
        .rejects
        .toThrow('Failed to cancel order: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to cancel order: Invalid response from RPC');
    });

    it('should handle RPC error', async () => {
      const error = new Error('Network error');
      mockRpcClient.call.mockRejectedValueOnce(error);

      await expect(orderService.cancelOrder(orderId))
        .rejects
        .toThrow('Failed to cancel order: Network error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to cancel order: Network error');
    });

    it('should handle unknown RPC error', async () => {
      mockRpcClient.call.mockRejectedValueOnce('Unknown error');

      await expect(orderService.cancelOrder(orderId))
        .rejects
        .toThrow('Failed to cancel order: Unknown error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to cancel order: Unknown error');
    });
  });

  describe('getOrderStatus', () => {
    const orderId = 'order123';

    it('should get order status successfully', async () => {
      const mockResponse = {
        orderId: 'order123',
        runeId: 'rune123',
        amount: 100,
        price: 1.5,
        type: 'buy',
        status: 'completed',
        timestamp: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(mockResponse);

      const result = await orderService.getOrderStatus(orderId);
      expect(result).toEqual(mockResponse);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getorderstatus', [orderId]);
    });

    it('should handle missing orderId', async () => {
      await expect(orderService.getOrderStatus(''))
        .rejects
        .toThrow('Failed to get order status: Order ID is required');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get order status: Order ID is required');
    });

    it('should handle invalid RPC response', async () => {
      mockRpcClient.call.mockResolvedValueOnce(null);

      await expect(orderService.getOrderStatus(orderId))
        .rejects
        .toThrow('Failed to get order status: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get order status: Invalid response from RPC');
    });

    it('should handle RPC response without orderId', async () => {
      const invalidResponse = {
        runeId: 'rune123',
        amount: 100,
        price: 1.5,
        type: 'buy',
        status: 'completed',
        timestamp: 1234567890
      };

      mockRpcClient.call.mockResolvedValueOnce(invalidResponse);

      await expect(orderService.getOrderStatus(orderId))
        .rejects
        .toThrow('Failed to get order status: Invalid response from RPC');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get order status: Invalid response from RPC');
    });

    it('should handle RPC error', async () => {
      const error = new Error('Network error');
      mockRpcClient.call.mockRejectedValueOnce(error);

      await expect(orderService.getOrderStatus(orderId))
        .rejects
        .toThrow('Failed to get order status: Network error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get order status: Network error');
    });

    it('should handle unknown RPC error', async () => {
      mockRpcClient.call.mockRejectedValueOnce('Unknown error');

      await expect(orderService.getOrderStatus(orderId))
        .rejects
        .toThrow('Failed to get order status: Unknown error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get order status: Unknown error');
    });
  });
}); 