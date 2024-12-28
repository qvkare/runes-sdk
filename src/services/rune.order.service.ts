import { RPCClient } from '../utils/rpc.client';
import { RuneTransfer } from '../types/rune.types';
import { RPCError } from '../utils/errors';

interface Order {
  id: string;
  runeId: string;
  type: 'buy' | 'sell';
  amount: bigint;
  price: bigint;
  address: string;
  timestamp: number;
  status: 'pending' | 'matched' | 'completed' | 'cancelled';
  matchedWith?: string; // Matched order ID
}

interface OrderBook {
  runeId: string;
  buyOrders: Order[];
  sellOrders: Order[];
  lastUpdated: number;
}

interface OrderMatch {
  buyOrder: Order;
  sellOrder: Order;
  matchedAmount: bigint;
  matchedPrice: bigint;
}

interface OrderValidation {
  isValid: boolean;
  errors: string[];
}

interface MetricEntry {
  duration: number;
  success: boolean;
  timestamp: number;
}

interface BatchStats {
  totalBatches: number;
  averageBatchSize: number;
  successfulBatches: number;
  failedBatches: number;
  averageProcessingTime: number;
}

export class RuneOrderService {
  private orderBooks: Map<string, OrderBook>;
  private orders: Map<string, Order>;
  private readonly minOrderAmount: bigint = BigInt(1000); // Minimum order amount
  private readonly maxOrderAmount: bigint = BigInt(1000000); // Maximum order amount
  private readonly maxPriceDeviation: number = 0.1; // Maximum 10% price deviation
  private readonly metrics: Map<string, MetricEntry[]>;
  private batchStats: BatchStats;

  constructor(private readonly rpcClient: RPCClient) {
    this.orderBooks = new Map();
    this.orders = new Map();
    this.metrics = new Map();
    this.batchStats = {
      totalBatches: 0,
      averageBatchSize: 0,
      successfulBatches: 0,
      failedBatches: 0,
      averageProcessingTime: 0
    };
  }

  /**
   * Places a new order
   * @param order Order to place
   * @returns Order ID
   */
  async placeOrder(order: Omit<Order, 'id' | 'status' | 'timestamp'>): Promise<string> {
    // Validate order
    const validation = await this.validateOrder(order);
    if (!validation.isValid) {
      throw new Error(`Invalid order: ${validation.errors.join(', ')}`);
    }

    // Generate order ID and add metadata
    const orderId = this.generateOrderId();
    const fullOrder: Order = {
      ...order,
      id: orderId,
      status: 'pending',
      timestamp: Date.now()
    };

    // Add to order maps
    this.orders.set(orderId, fullOrder);
    this.addToOrderBook(fullOrder);

    // Try to match order
    await this.matchOrders(fullOrder.runeId);

    return orderId;
  }

  /**
   * Cancels an existing order
   * @param orderId Order ID to cancel
   */
  async cancelOrder(orderId: string): Promise<void> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'pending') {
      throw new Error(`Cannot cancel order in ${order.status} status`);
    }

    // Remove from order book
    this.removeFromOrderBook(order);
    
    // Update status
    order.status = 'cancelled';
    this.orders.set(orderId, order);
  }

  /**
   * Gets order book for a rune
   * @param runeId Rune identifier
   * @returns Order book
   */
  getOrderBook(runeId: string): OrderBook {
    const orderBook = this.orderBooks.get(runeId);
    if (!orderBook) {
      return {
        runeId,
        buyOrders: [],
        sellOrders: [],
        lastUpdated: Date.now()
      };
    }
    return orderBook;
  }

  /**
   * Gets order details
   * @param orderId Order ID
   * @returns Order details
   */
  getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  /**
   * Gets all orders for an address
   * @param address Bitcoin address
   * @returns Array of orders
   */
  getAddressOrders(address: string): Order[] {
    return Array.from(this.orders.values())
      .filter(order => order.address === address);
  }

  /**
   * Validates an order
   * @param order Order to validate
   * @returns Validation result
   */
  private async validateOrder(order: Omit<Order, 'id' | 'status' | 'timestamp'>): Promise<OrderValidation> {
    const errors: string[] = [];

    // Check amount limits
    if (order.amount < this.minOrderAmount) {
      errors.push(`Order amount below minimum (${this.minOrderAmount})`);
    }
    if (order.amount > this.maxOrderAmount) {
      errors.push(`Order amount above maximum (${this.maxOrderAmount})`);
    }

    // Check price
    const marketPrice = await this.getMarketPrice(order.runeId);
    const priceDeviation = Math.abs(Number(order.price - marketPrice) / Number(marketPrice));
    if (priceDeviation > this.maxPriceDeviation) {
      errors.push(`Price deviation too high (${(priceDeviation * 100).toFixed(2)}%)`);
    }

    // Validate address
    try {
      await this.rpcClient.call('validateaddress', [order.address]);
    } catch {
      errors.push('Invalid address');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Adds order to order book
   * @param order Order to add
   */
  private addToOrderBook(order: Order): void {
    let orderBook = this.orderBooks.get(order.runeId);
    if (!orderBook) {
      orderBook = {
        runeId: order.runeId,
        buyOrders: [],
        sellOrders: [],
        lastUpdated: Date.now()
      };
      this.orderBooks.set(order.runeId, orderBook);
    }

    if (order.type === 'buy') {
      orderBook.buyOrders.push(order);
      orderBook.buyOrders.sort((a, b) => Number(b.price - a.price)); // Sort by price descending
    } else {
      orderBook.sellOrders.push(order);
      orderBook.sellOrders.sort((a, b) => Number(a.price - b.price)); // Sort by price ascending
    }

    orderBook.lastUpdated = Date.now();
  }

  /**
   * Removes order from order book
   * @param order Order to remove
   */
  private removeFromOrderBook(order: Order): void {
    const orderBook = this.orderBooks.get(order.runeId);
    if (!orderBook) return;

    if (order.type === 'buy') {
      orderBook.buyOrders = orderBook.buyOrders.filter(o => o.id !== order.id);
    } else {
      orderBook.sellOrders = orderBook.sellOrders.filter(o => o.id !== order.id);
    }

    orderBook.lastUpdated = Date.now();
  }

  /**
   * Matches orders for a rune
   * @param runeId Rune identifier
   */
  private async matchOrders(runeId: string): Promise<void> {
    const orderBook = this.orderBooks.get(runeId);
    if (!orderBook) return;

    const matches: OrderMatch[] = [];
    let i = 0, j = 0;

    // Match orders while possible
    while (i < orderBook.buyOrders.length && j < orderBook.sellOrders.length) {
      const buyOrder = orderBook.buyOrders[i];
      const sellOrder = orderBook.sellOrders[j];

      if (buyOrder.price >= sellOrder.price) {
        const matchedAmount = BigInt(Math.min(
          Number(buyOrder.amount),
          Number(sellOrder.amount)
        ));

        matches.push({
          buyOrder,
          sellOrder,
          matchedAmount,
          matchedPrice: (buyOrder.price + sellOrder.price) / BigInt(2)
        });

        // Update order amounts
        buyOrder.amount -= matchedAmount;
        sellOrder.amount -= matchedAmount;

        // Move to next order if fully matched
        if (buyOrder.amount === BigInt(0)) i++;
        if (sellOrder.amount === BigInt(0)) j++;
      } else {
        break; // No more matches possible
      }
    }

    // Process matches
    for (const match of matches) {
      await this.processMatch(match);
    }

    // Clean up completed orders
    this.cleanupOrderBook(orderBook);
  }

  /**
   * Processes a match between orders
   * @param match Order match details
   */
  private async processMatch(match: OrderMatch): Promise<void> {
    try {
      // Create transfer for matched amount
      const transfer: RuneTransfer = {
        txid: this.generateTransferId(),
        rune: match.buyOrder.runeId,
        amount: match.matchedAmount.toString(),
        from: match.sellOrder.address,
        to: match.buyOrder.address,
        timestamp: Date.now(),
        blockHeight: 0,
        status: 'pending'
      };

      // Execute transfer
      await this.rpcClient.call('createrunetransfer', [transfer]);

      // Update order statuses
      this.updateOrderStatus(match.buyOrder, match.sellOrder);

    } catch (error) {
      throw new RPCError('Failed to process order match');
    }
  }

  /**
   * Updates order statuses after matching
   * @param buyOrder Buy order
   * @param sellOrder Sell order
   */
  private updateOrderStatus(buyOrder: Order, sellOrder: Order): void {
    if (buyOrder.amount === BigInt(0)) {
      buyOrder.status = 'completed';
    } else {
      buyOrder.status = 'matched';
    }

    if (sellOrder.amount === BigInt(0)) {
      sellOrder.status = 'completed';
    } else {
      sellOrder.status = 'matched';
    }

    buyOrder.matchedWith = sellOrder.id;
    sellOrder.matchedWith = buyOrder.id;

    this.orders.set(buyOrder.id, buyOrder);
    this.orders.set(sellOrder.id, sellOrder);
  }

  /**
   * Cleans up completed orders from order book
   * @param orderBook Order book to clean
   */
  private cleanupOrderBook(orderBook: OrderBook): void {
    orderBook.buyOrders = orderBook.buyOrders.filter(order => 
      order.status === 'pending' || order.status === 'matched'
    );
    orderBook.sellOrders = orderBook.sellOrders.filter(order => 
      order.status === 'pending' || order.status === 'matched'
    );
    orderBook.lastUpdated = Date.now();
  }

  /**
   * Gets current market price for a rune
   * @param runeId Rune identifier
   * @returns Market price
   */
  private async getMarketPrice(runeId: string): Promise<bigint> {
    try {
      const response = await this.rpcClient.call('getruneprice', [runeId]);
      return BigInt(response.price);
    } catch {
      // If no market price available, use last matched price or default
      const orderBook = this.orderBooks.get(runeId);
      if (!orderBook) return BigInt(1000); // Default price

      const lastMatch = this.findLastMatch(orderBook);
      return lastMatch ? lastMatch.matchedPrice : BigInt(1000);
    }
  }

  /**
   * Finds last matched price in order book
   * @param orderBook Order book to search
   * @returns Last matched price or null
   */
  private findLastMatch(orderBook: OrderBook): OrderMatch | null {
    const completedOrders = Array.from(this.orders.values())
      .filter(order => 
        order.runeId === orderBook.runeId && 
        order.status === 'completed' &&
        order.matchedWith
      )
      .sort((a, b) => b.timestamp - a.timestamp);

    if (completedOrders.length === 0) return null;

    const lastOrder = completedOrders[0];
    if (!lastOrder.matchedWith) return null;

    const matchedOrder = this.orders.get(lastOrder.matchedWith);
    if (!matchedOrder) return null;

    return {
      buyOrder: lastOrder.type === 'buy' ? lastOrder : matchedOrder,
      sellOrder: lastOrder.type === 'sell' ? lastOrder : matchedOrder,
      matchedAmount: BigInt(0), // Not relevant for price calculation
      matchedPrice: lastOrder.price
    };
  }

  /**
   * Generates unique order ID
   * @returns Order ID
   */
  private generateOrderId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generates unique transfer ID
   * @returns Transfer ID
   */
  private generateTransferId(): string {
    return `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  recordMetrics(operation: string, duration: number, success: boolean): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }

    const operationMetrics = this.metrics.get(operation);
    if (!operationMetrics) return;

    operationMetrics.push({
      duration: success ? duration : -duration,
      success,
      timestamp: Date.now()
    });

    // Keep only last 1000 measurements
    if (operationMetrics.length > 1000) {
      operationMetrics.shift();
    }

    // Update batch stats if this was a batch operation
    if (operation === 'batch_processing') {
      this.updateBatchStats(duration, success);
    }
  }

  private updateBatchStats(duration: number, success: boolean): void {
    this.batchStats.totalBatches++;
    if (success) {
      this.batchStats.successfulBatches++;
    } else {
      this.batchStats.failedBatches++;
    }

    // Update average processing time
    const totalTime = this.batchStats.averageProcessingTime * (this.batchStats.totalBatches - 1);
    this.batchStats.averageProcessingTime = (totalTime + duration) / this.batchStats.totalBatches;
  }
} 