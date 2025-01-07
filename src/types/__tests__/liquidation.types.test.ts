import { LiquidationType, LiquidationEvent } from '../liquidation.types';
import { OrderSide } from '../market.types';

describe('Liquidation Types', () => {
  describe('LiquidationType', () => {
    it('should have correct values', () => {
      expect(LiquidationType.PARTIAL).toBe('partial');
      expect(LiquidationType.FULL).toBe('full');
    });
  });

  describe('LiquidationEvent Interface', () => {
    it('should create valid liquidation event object with required fields', () => {
      const liquidationEvent: LiquidationEvent = {
        liquidationId: 'liq123',
        symbol: 'BTC/USDT',
        side: OrderSide.BUY,
        price: 50000,
        quantity: 1,
        timestamp: Date.now(),
        liquidationType: LiquidationType.PARTIAL,
      };

      expect(liquidationEvent).toHaveProperty('liquidationId');
      expect(liquidationEvent.side).toBe(OrderSide.BUY);
      expect(liquidationEvent.liquidationType).toBe(LiquidationType.PARTIAL);
    });

    it('should create valid liquidation event object with all fields', () => {
      const liquidationEvent: LiquidationEvent = {
        liquidationId: 'liq123',
        symbol: 'BTC/USDT',
        side: OrderSide.BUY,
        price: 50000,
        quantity: 1,
        timestamp: Date.now(),
        liquidationType: LiquidationType.FULL,
        positionSize: 10,
        remainingPosition: 0,
        bankruptcyPrice: 48000,
        collateralAsset: 'USDT',
        collateralAmount: 5000,
        liquidationFee: 50,
        insuranceFundContribution: 25,
      };

      expect(liquidationEvent.positionSize).toBe(10);
      expect(liquidationEvent.remainingPosition).toBe(0);
      expect(liquidationEvent.bankruptcyPrice).toBe(48000);
      expect(liquidationEvent.collateralAsset).toBe('USDT');
      expect(liquidationEvent.liquidationFee).toBe(50);
    });

    it('should handle optional fields', () => {
      const liquidationEvent: LiquidationEvent = {
        liquidationId: 'liq123',
        symbol: 'BTC/USDT',
        side: OrderSide.SELL,
        price: 50000,
        quantity: 1,
        timestamp: Date.now(),
        liquidationType: LiquidationType.PARTIAL,
      };

      expect(liquidationEvent.positionSize).toBeUndefined();
      expect(liquidationEvent.remainingPosition).toBeUndefined();
      expect(liquidationEvent.bankruptcyPrice).toBeUndefined();
    });
  });
});
