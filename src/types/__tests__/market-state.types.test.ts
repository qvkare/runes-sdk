import { MarketStatus, MarketState } from '../market-state.types';

describe('Market State Types', () => {
  describe('MarketStatus', () => {
    it('should have correct values', () => {
      expect(MarketStatus.ACTIVE).toBe('active');
      expect(MarketStatus.HALT).toBe('halt');
      expect(MarketStatus.BREAK).toBe('break');
      expect(MarketStatus.AUCTION).toBe('auction');
      expect(MarketStatus.MAINTENANCE).toBe('maintenance');
    });
  });

  describe('MarketState Interface', () => {
    it('should create valid market state object with required fields', () => {
      const marketState: MarketState = {
        symbol: 'BTC/USDT',
        status: MarketStatus.ACTIVE,
        lastUpdateTime: Date.now(),
      };

      expect(marketState).toHaveProperty('symbol');
      expect(marketState.status).toBe(MarketStatus.ACTIVE);
      expect(marketState.lastUpdateTime).toBeDefined();
    });

    it('should create valid market state object with all fields', () => {
      const now = Date.now();
      const marketState: MarketState = {
        symbol: 'BTC/USDT',
        status: MarketStatus.AUCTION,
        reason: 'Scheduled auction',
        expectedResume: now + 3600000,
        lastUpdateTime: now,
        restrictions: {
          allowTrading: false,
          allowMarketOrders: false,
          allowLimitOrders: true,
          allowMarginTrading: false,
        },
        auctionData: {
          startTime: now,
          endTime: now + 3600000,
          indicativePrice: 50000,
          indicativeVolume: 100,
        },
      };

      expect(marketState.status).toBe(MarketStatus.AUCTION);
      expect(marketState.restrictions).toBeDefined();
      expect(marketState.auctionData).toBeDefined();
      expect(marketState.restrictions?.allowTrading).toBe(false);
      expect(marketState.auctionData?.indicativePrice).toBe(50000);
    });

    it('should handle optional fields', () => {
      const marketState: MarketState = {
        symbol: 'BTC/USDT',
        status: MarketStatus.ACTIVE,
        lastUpdateTime: Date.now(),
      };

      expect(marketState.reason).toBeUndefined();
      expect(marketState.expectedResume).toBeUndefined();
      expect(marketState.restrictions).toBeUndefined();
      expect(marketState.auctionData).toBeUndefined();
    });
  });
});
