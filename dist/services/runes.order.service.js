"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunesOrderService = void 0;
class RunesOrderService {
    constructor(rpcClient, logger) {
        this.rpcClient = rpcClient;
        this.logger = logger;
    }
    async createOrder(params) {
        try {
            if (!params.runeId || !params.amount || !params.price || !params.type) {
                throw new Error('Invalid order parameters');
            }
            const response = await this.rpcClient.call('createorder', [params]);
            if (!response || !response.orderId) {
                throw new Error('Invalid response from RPC');
            }
            return {
                orderId: response.orderId,
                runeId: response.runeId,
                amount: response.amount,
                price: response.price,
                type: response.type,
                status: response.status,
                timestamp: response.timestamp
            };
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to create order: ${error.message}`);
                throw new Error(`Failed to create order: ${error.message}`);
            }
            else {
                this.logger.error('Failed to create order: Unknown error');
                throw new Error('Failed to create order: Unknown error');
            }
        }
    }
    async cancelOrder(orderId) {
        try {
            if (!orderId) {
                throw new Error('Order ID is required');
            }
            const response = await this.rpcClient.call('cancelorder', [orderId]);
            if (!response || !response.orderId) {
                throw new Error('Invalid response from RPC');
            }
            return {
                orderId: response.orderId,
                runeId: response.runeId,
                amount: response.amount,
                price: response.price,
                type: response.type,
                status: 'cancelled',
                timestamp: response.timestamp
            };
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to cancel order: ${error.message}`);
                throw new Error(`Failed to cancel order: ${error.message}`);
            }
            else {
                this.logger.error('Failed to cancel order: Unknown error');
                throw new Error('Failed to cancel order: Unknown error');
            }
        }
    }
    async getOrderStatus(orderId) {
        try {
            if (!orderId) {
                throw new Error('Order ID is required');
            }
            const response = await this.rpcClient.call('getorderstatus', [orderId]);
            if (!response || !response.orderId) {
                throw new Error('Invalid response from RPC');
            }
            return {
                orderId: response.orderId,
                runeId: response.runeId,
                amount: response.amount,
                price: response.price,
                type: response.type,
                status: response.status,
                timestamp: response.timestamp
            };
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to get order status: ${error.message}`);
                throw new Error(`Failed to get order status: ${error.message}`);
            }
            else {
                this.logger.error('Failed to get order status: Unknown error');
                throw new Error('Failed to get order status: Unknown error');
            }
        }
    }
}
exports.RunesOrderService = RunesOrderService;
