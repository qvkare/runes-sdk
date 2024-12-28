import { RPCClient } from '../../utils/rpc.client';
import { RuneOrderService } from '../rune.order.service';

// Mock RPCClient
jest.mock('../../utils/rpc.client');

describe('RuneOrderService', () => {
  let orderService: RuneOrderService;
  let mockRpcClient: jest.Mocked<RPCClient>;

  beforeEach(() => {
    mockRpcClient = new RPCClient({
      rpcUrl: 'http://localhost:8332',
      username: 'test',
      password: 'test',
      network: 'regtest'
    }) as jest.Mocked<RPCClient>;
    orderService = new RuneOrderService(mockRpcClient);
  });

  describe('order management', () => {
    it('should place and get order', async () => {
      const order = {
        runeId: 'RUNE1',
        type: 'buy' as const,
        amount: BigInt(1000),
        price: BigInt(1000),
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
      };

      mockRpcClient.call.mockResolvedValueOnce({ valid: true });
      mockRpcClient.call.mockResolvedValueOnce({ price: '1000' });
      mockRpcClient.call.mockResolvedValueOnce(true);

      const orderId = await orderService.placeOrder(order);
      expect(orderId).toBeDefined();

      const placedOrder = orderService.getOrder(orderId);
      expect(placedOrder).toBeDefined();
      expect(placedOrder?.runeId).toBe(order.runeId);
      expect(placedOrder?.type).toBe(order.type);
    });

    it('should handle invalid order placement', async () => {
      const invalidOrder = {
        runeId: 'RUNE1',
        type: 'buy' as const,
        amount: BigInt(0), // Invalid amount
        price: BigInt(1000),
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
      };

      mockRpcClient.call.mockResolvedValueOnce({ valid: true });
      mockRpcClient.call.mockResolvedValueOnce({ price: '1000' });

      await expect(orderService.placeOrder(invalidOrder)).rejects.toThrow();
    });

    it('should cancel order', async () => {
      const order = {
        runeId: 'RUNE1',
        type: 'buy' as const,
        amount: BigInt(1000),
        price: BigInt(1000),
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
      };

      mockRpcClient.call.mockResolvedValueOnce({ valid: true });
      mockRpcClient.call.mockResolvedValueOnce({ price: '1000' });
      mockRpcClient.call.mockResolvedValueOnce(true);

      const orderId = await orderService.placeOrder(order);
      await orderService.cancelOrder(orderId);

      const cancelledOrder = orderService.getOrder(orderId);
      expect(cancelledOrder?.status).toBe('cancelled');
    });

    it('should fail to cancel non-existent order', async () => {
      await expect(orderService.cancelOrder('non-existent')).rejects.toThrow('Order not found');
    });

    it('should fail to cancel completed order', async () => {
      const order = {
        runeId: 'RUNE1',
        type: 'buy' as const,
        amount: BigInt(1000),
        price: BigInt(1000),
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
      };

      mockRpcClient.call.mockResolvedValueOnce({ valid: true });
      mockRpcClient.call.mockResolvedValueOnce({ price: '1000' });
      mockRpcClient.call.mockResolvedValueOnce(true);

      const orderId = await orderService.placeOrder(order);
      
      // Manually set order status to completed
      const placedOrder = orderService.getOrder(orderId);
      if (placedOrder) {
        placedOrder.status = 'completed';
      }

      await expect(orderService.cancelOrder(orderId)).rejects.toThrow('Cannot cancel order in completed status');
    });
  });

  describe('order book management', () => {
    it('should get empty order book for new rune', () => {
      const orderBook = orderService.getOrderBook('NEW_RUNE');
      expect(orderBook.buyOrders).toHaveLength(0);
      expect(orderBook.sellOrders).toHaveLength(0);
      expect(orderBook.runeId).toBe('NEW_RUNE');
    });

    it('should get orders by address', async () => {
      const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
      const order = {
        runeId: 'RUNE1',
        type: 'buy' as const,
        amount: BigInt(1000),
        price: BigInt(1000),
        address
      };

      mockRpcClient.call.mockResolvedValueOnce({ valid: true });
      mockRpcClient.call.mockResolvedValueOnce({ price: '1000' });
      mockRpcClient.call.mockResolvedValueOnce(true);

      await orderService.placeOrder(order);
      
      const addressOrders = orderService.getAddressOrders(address);
      expect(addressOrders).toHaveLength(1);
      expect(addressOrders[0].address).toBe(address);
    });

    it('should handle order matching', async () => {
      const buyOrder = {
        runeId: 'RUNE1',
        type: 'buy' as const,
        amount: BigInt(1000),
        price: BigInt(1000),
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
      };

      const sellOrder = {
        runeId: 'RUNE1',
        type: 'sell' as const,
        amount: BigInt(1000),
        price: BigInt(1000),
        address: '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX'
      };

      mockRpcClient.call.mockResolvedValue({ valid: true });
      mockRpcClient.call.mockResolvedValue({ price: '1000' });
      mockRpcClient.call.mockResolvedValue(true);

      await orderService.placeOrder(buyOrder);
      await orderService.placeOrder(sellOrder);

      const orderBook = orderService.getOrderBook('RUNE1');
      expect(orderBook.buyOrders.length + orderBook.sellOrders.length).toBeLessThan(2);
    });
  });
}); 