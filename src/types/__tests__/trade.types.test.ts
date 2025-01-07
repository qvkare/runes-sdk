import { TradeUpdate } from '../trade.types';
import { OrderSide } from '../market.types';

describe('Trade Types', () => {
  describe('TradeUpdate Interface', () => {
    it('should create valid trade update object', () => {
      const tradeUpdate: TradeUpdate = {
        tradeId: 'trade123',
        symbol: 'BTC/USDT',
        price: 50000,
        quantity: 1,
        buyerOrderId: 'buyer123',
        sellerOrderId: 'seller123',
        timestamp: Date.now(),
        side: OrderSide.BUY,
        makerSide: OrderSide.SELL,
        takerSide: OrderSide.BUY,
        makerFee: {
          asset: 'USDT',
          amount: 0.1,
        },
        takerFee: {
          asset: 'USDT',
          amount: 0.2,
        },
        marketPrice: 50100,
        liquidation: false,
      };

      expect(tradeUpdate).toHaveProperty('tradeId');
      expect(tradeUpdate.side).toBe(OrderSide.BUY);
      expect(tradeUpdate.makerSide).toBe(OrderSide.SELL);
      expect(tradeUpdate.takerSide).toBe(OrderSide.BUY);
      expect(tradeUpdate.makerFee).toBeDefined();
      expect(tradeUpdate.takerFee).toBeDefined();
    });

    it('should handle optional fields', () => {
      const tradeUpdate: TradeUpdate = {
        tradeId: 'trade123',
        symbol: 'BTC/USDT',
        price: 50000,
        quantity: 1,
        buyerOrderId: 'buyer123',
        sellerOrderId: 'seller123',
        timestamp: Date.now(),
        side: OrderSide.BUY,
        makerSide: OrderSide.SELL,
        takerSide: OrderSide.BUY,
        makerFee: {
          asset: 'USDT',
          amount: 0.1,
        },
        takerFee: {
          asset: 'USDT',
          amount: 0.2,
        },
      };

      expect(tradeUpdate.marketPrice).toBeUndefined();
      expect(tradeUpdate.liquidation).toBeUndefined();
    });
  });
});
