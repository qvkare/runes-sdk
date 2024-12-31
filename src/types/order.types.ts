export interface Order {
  id: string;
  amount: string;
  price: string;
  type: 'buy' | 'sell';
  status: string;
}

export interface OrderResponse {
  txid: string;
  status: string;
}

export interface OrderStatus {
  id: string;
  status: string;
  filledAmount: string;
  remainingAmount: string;
} 