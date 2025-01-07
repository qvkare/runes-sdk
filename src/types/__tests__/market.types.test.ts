import { OrderSide, OrderType, OrderStatus, OrderUpdate } from '../market.types';

describe('Market Types', () => {
  describe('OrderSide', () => {
    it('should have correct values', () => {
      expect(OrderSide.BUY).toBe('buy');
      expect(OrderSide.SELL).toBe('sell');
    });
  });

  describe('OrderType', () => {
    it('should have correct values', () => {
      expect(OrderType.LIMIT).toBe('limit');
      expect(OrderType.MARKET).toBe('market');
    });
  });

  describe('OrderStatus', () => {
    it('should have correct values', () => {
      expect(OrderStatus.NEW).toBe('new');
      expect(OrderStatus.FILLED).toBe('filled');
      expect(OrderStatus.CANCELLED).toBe('cancelled');
    });
  });

  describe('OrderUpdate Interface', () => {
    it('should create valid order update object', () => {
      const orderUpdate: OrderUpdate = {
        orderId: '123',
        symbol: 'BTC/USDT',
        side: OrderSide.BUY,
        type: OrderType.LIMIT,
        status: OrderStatus.NEW,
        price: 50000,
        quantity: 1,
        timestamp: Date.now(),
        clientOrderId: 'client123',
        executedQuantity: 0,
        remainingQuantity: 1,
        fees: [
          {
            asset: 'USDT',
            amount: 0.1,
          },
        ],
      };

      expect(orderUpdate).toHaveProperty('orderId');
      expect(orderUpdate.side).toBe(OrderSide.BUY);
      expect(orderUpdate.type).toBe(OrderType.LIMIT);
      expect(orderUpdate.status).toBe(OrderStatus.NEW);
      expect(orderUpdate.fees).toHaveLength(1);
    });
  });
});
