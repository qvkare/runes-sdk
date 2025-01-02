import { OrderSide } from './market.types';

export interface TradeUpdate {
  symbol: string;
  tradeId: string;
  orderId: string;
  side: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  timestamp: number;
  isMaker: boolean;
  fee: {
    asset: string;
    amount: number;
  };
  commission?: number;
  commissionAsset?: string;
}
