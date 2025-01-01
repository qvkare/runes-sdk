import { jest } from '@jest/globals';
import { RunesOrderService } from '../service';
import { createMockLogger, createMockRpcClient } from '../../../../utils/test.utils';

describe('RunesOrderService', () => {
  let service: RunesOrderService;
  let mockRpcClient: jest.Mocked<any>;
  let mockLogger: jest.Mocked<any>;

  beforeEach(() => {
    mockRpcClient = createMockRpcClient();
    mockLogger = createMockLogger();
    service = new RunesOrderService(mockRpcClient, mockLogger);
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const runeId = 'rune1';
      const amount = '100';
      const price = '10';

      mockRpcClient.call.mockResolvedValue(true);

      const result = await service.createOrder(runeId, amount, price);
      expect(result).toBe(true);
      expect(mockRpcClient.call).toHaveBeenCalledWith('createruneorder', [runeId, amount, price]);
    });

    it('should handle error when creating order', async () => {
      const runeId = 'rune1';
      const amount = '100';
      const price = '10';

      mockRpcClient.call.mockRejectedValue(new Error('Failed to create order'));

      await expect(service.createOrder(runeId, amount, price)).rejects.toThrow('Failed to create rune order');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create rune order:', expect.any(Error));
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const orderId = 'order1';

      mockRpcClient.call.mockResolvedValue(true);

      const result = await service.cancelOrder(orderId);
      expect(result).toBe(true);
      expect(mockRpcClient.call).toHaveBeenCalledWith('cancelruneorder', [orderId]);
    });

    it('should handle error when canceling order', async () => {
      const orderId = 'order1';

      mockRpcClient.call.mockRejectedValue(new Error('Failed to cancel order'));

      await expect(service.cancelOrder(orderId)).rejects.toThrow('Failed to cancel rune order');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to cancel rune order:', expect.any(Error));
    });
  });

  describe('getOrder', () => {
    it('should get order info successfully', async () => {
      const orderId = 'order1';
      const mockOrder = {
        id: orderId,
        runeId: 'rune1',
        amount: '100',
        price: '10',
        status: 'open',
        createdAt: Date.now(),
      };

      mockRpcClient.call.mockResolvedValue(mockOrder);

      const result = await service.getOrder(orderId);
      expect(result).toEqual(mockOrder);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getruneorder', [orderId]);
    });

    it('should handle error when getting order info', async () => {
      const orderId = 'order1';

      mockRpcClient.call.mockRejectedValue(new Error('Failed to get order'));

      await expect(service.getOrder(orderId)).rejects.toThrow('Failed to get rune order');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get rune order:', expect.any(Error));
    });
  });
});
