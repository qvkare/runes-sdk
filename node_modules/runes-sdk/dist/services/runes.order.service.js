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
            this.logger.info('Creating order:', params);
            const response = await this.rpcClient.call('createorder', [
                params.runeId,
                params.amount,
                params.price,
                params.type
            ]);
            if (!response.result) {
                this.logger.error('Invalid response from RPC');
                throw new Error('Invalid response from RPC');
            }
            return response.result;
        }
        catch (error) {
            this.logger.error('Failed to create order:', error);
            if (error instanceof Error && error.message === 'Invalid response from RPC') {
                throw error;
            }
            throw new Error('Failed to create order');
        }
    }
    async cancelOrder(orderId) {
        try {
            this.logger.info('Cancelling order:', orderId);
            const response = await this.rpcClient.call('cancelorder', [orderId]);
            if (!response.result) {
                this.logger.error('Invalid response from RPC');
                throw new Error('Invalid response from RPC');
            }
            return response.result.success;
        }
        catch (error) {
            this.logger.error('Failed to cancel order:', error);
            if (error instanceof Error && error.message === 'Invalid response from RPC') {
                throw error;
            }
            throw new Error('Failed to cancel order');
        }
    }
}
exports.RunesOrderService = RunesOrderService;
