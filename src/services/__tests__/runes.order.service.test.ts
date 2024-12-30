import { jest } from '@jest/globals';
import { RunesOrderService } from '../runes.order.service';
import { createMockLogger } from '../../utils/__tests__/test.utils';
import { RPCClient } from '../../utils/rpc.client';
import { RunesValidator } from '../../utils/runes.validator';
import { Logger } from '../../utils/logger';
import { BitcoinCoreService } from '../bitcoin-core.service';
import { OrderType } from '../../types/order.types';

describe('RunesOrderService', () => {
  let service: RunesOrderService;
  let mockRpcClient: jest.Mocked<RPCClient>;
  let mockValidator: jest.Mocked<RunesValidator>;
  let mockLogger: jest.Mocked<Logger>;
  let mockBitcoinCore: jest.Mocked<BitcoinCoreService>;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockRpcClient = {
      call: jest.fn(),
    } as unknown as jest.Mocked<RPCClient>;

    mockBitcoinCore = {
      getBlockCount: jest.fn(),
      getMemPoolInfo: jest.fn(),
      getRawTransaction: jest.fn(),
      decodeRawTransaction: jest.fn(),
      sendRawTransaction: jest.fn(),
      listUnspent: jest.fn(),
      validateAddress: jest.fn(),
      createRawTransaction: jest.fn(),
      signRawTransaction: jest.fn(),
      rpcClient: {} as any,
      logger: mockLogger,
    } as unknown as jest.Mocked<BitcoinCoreService>;

    mockValidator = {
      validateRuneCreation: jest.fn(),
      validateTransfer: jest.fn(),
      validateRuneId: jest.fn(),
      validateAddress: jest.fn(),
      validateRuneSymbol: jest.fn(),
      validateRuneDecimals: jest.fn(),
      validateRuneAmount: jest.fn(),
      validateRuneTransaction: jest.fn(),
      validateRuneSupply: jest.fn(),
      validateRuneLimit: jest.fn(),
      bitcoinCore: mockBitcoinCore,
      logger: mockLogger,
      isValidSymbol: jest.fn(),
      isValidDecimals: jest.fn(),
      isValidSupply: jest.fn(),
      isValidLimit: jest.fn(),
      isValidAmount: jest.fn(),
    } as unknown as jest.Mocked<RunesValidator>;

    service = new RunesOrderService(mockRpcClient, mockValidator, mockLogger);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createOrder', () => {
    const orderParams = {
      runeId: 'rune123',
      type: OrderType.BUY,
      amount: 1000,
      price: 1.5,
      address: 'addr123',
    };

    it('should create order successfully', async () => {
      mockValidator.validateRuneSymbol.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockRpcClient.call.mockResolvedValueOnce({ orderId: 'order123' });

      const result = await service.createOrder(orderParams);
      expect(result).toEqual({ orderId: 'order123' });
      expect(mockRpcClient.call).toHaveBeenCalledWith('createorder', [orderParams]);
    });

    it('should handle create order error', async () => {
      mockValidator.validateRuneSymbol.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid symbol'],
      });
      await expect(service.createOrder(orderParams)).rejects.toThrow('Invalid rune symbol');
    });
  });

  describe('cancelOrder', () => {
    const orderId = 'order123';

    it('should cancel order successfully', async () => {
      mockRpcClient.call.mockResolvedValueOnce({ success: true });

      const result = await service.cancelOrder(orderId);
      expect(result).toEqual({ success: true });
      expect(mockRpcClient.call).toHaveBeenCalledWith('cancelorder', [orderId]);
    });

    it('should handle cancel order error', async () => {
      mockRpcClient.call.mockRejectedValueOnce(new Error('Order not found'));
      await expect(service.cancelOrder(orderId)).rejects.toThrow('Order not found');
    });
  });

  describe('getOrderBook', () => {
    const runeId = 'rune123';

    it('should get order book successfully', async () => {
      const mockOrderBook = {
        bids: [
          { price: 1.5, amount: 1000 },
          { price: 1.4, amount: 2000 },
        ],
        asks: [
          { price: 1.6, amount: 500 },
          { price: 1.7, amount: 1500 },
        ],
      };

      mockValidator.validateRuneSymbol.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockRpcClient.call.mockResolvedValueOnce(mockOrderBook);

      const result = await service.getOrderBook(runeId);
      expect(result).toEqual(mockOrderBook);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getorderbook', [runeId]);
    });

    it('should handle get order book error', async () => {
      mockValidator.validateRuneSymbol.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid symbol'],
      });
      await expect(service.getOrderBook(runeId)).rejects.toThrow('Invalid rune symbol');
    });
  });

  describe('getOpenOrders', () => {
    const address = 'addr123';

    it('should get open orders successfully', async () => {
      const mockOrders = {
        orders: [
          {
            orderId: 'order1',
            runeId: 'rune1',
            type: OrderType.BUY,
            amount: 1000,
            price: 1.5,
            timestamp: 1234567890,
          },
          {
            orderId: 'order2',
            runeId: 'rune2',
            type: OrderType.SELL,
            amount: 500,
            price: 2.0,
            timestamp: 1234567891,
          },
        ],
        total: 2,
      };

      mockValidator.validateAddress.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockRpcClient.call.mockResolvedValueOnce(mockOrders);

      const result = await service.getOpenOrders(address);
      expect(result).toEqual(mockOrders);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getopenorders', [address]);
    });

    it('should handle get open orders error', async () => {
      mockValidator.validateAddress.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid address'],
      });
      await expect(service.getOpenOrders(address)).rejects.toThrow('Invalid address');
    });
  });

  describe('getOrderHistory', () => {
    const address = 'addr123';

    it('should get order history successfully', async () => {
      const mockHistory = {
        orders: [
          {
            orderId: 'order1',
            runeId: 'rune1',
            type: OrderType.BUY,
            amount: 1000,
            price: 1.5,
            status: 'FILLED',
            timestamp: 1234567890,
          },
          {
            orderId: 'order2',
            runeId: 'rune2',
            type: OrderType.SELL,
            amount: 500,
            price: 2.0,
            status: 'CANCELLED',
            timestamp: 1234567891,
          },
        ],
        total: 2,
      };

      mockValidator.validateAddress.mockResolvedValueOnce({ isValid: true, errors: [] });
      mockRpcClient.call.mockResolvedValueOnce(mockHistory);

      const result = await service.getOrderHistory(address);
      expect(result).toEqual(mockHistory);
      expect(mockRpcClient.call).toHaveBeenCalledWith('getorderhistory', [address]);
    });

    it('should handle get order history error', async () => {
      mockValidator.validateAddress.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid address'],
      });
      await expect(service.getOrderHistory(address)).rejects.toThrow('Invalid address');
    });
  });
});
