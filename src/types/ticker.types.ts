export interface TickerUpdate {
  symbol: string;
  priceChange: number;
  priceChangePercent: number;
  weightedAvgPrice: number;
  lastPrice: number;
  lastQty: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteVolume: number;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
  bestBidPrice?: number;
  bestBidQty?: number;
  bestAskPrice?: number;
  bestAskQty?: number;
}

export interface MiniTicker {
  symbol: string;
  closePrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteVolume: number;
  eventTime: number;
}

export interface MarketStatistics {
  symbol: string;
  interval: string;
  openTime: number;
  closeTime: number;
  firstTradeId: number;
  lastTradeId: number;
  tradeCount: number;
  baseVolume: number;
  quoteVolume: number;
  averagePrice: number;
  prevClosePrice: number;
  bestBid: number;
  bestAsk: number;
  highPrice: number;
  lowPrice: number;
  volumeChangePercent: number;
  priceChangePercent: number;
}
