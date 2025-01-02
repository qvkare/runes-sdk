export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell',
}

export enum OrderType {
  LIMIT = 'limit',
  MARKET = 'market',
}

export enum OrderStatus {
  NEW = 'new',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
}

export interface OrderUpdate {
  orderId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  price: number;
  quantity: number;
  timestamp: number;
  clientOrderId?: string;
  executedQuantity?: number;
  remainingQuantity?: number;
  averagePrice?: number;
  updateTime?: number;
  fees?: {
    asset: string;
    amount: number;
  }[];
}
