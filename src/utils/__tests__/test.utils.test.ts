import { createMockLogger, createMockRpcClient, createMockValidationService, createMockTransaction } from '../test.utils';

describe('Test Utils', () => {
    describe('createMockLogger', () => {
        it('should create a mock logger with all required methods', () => {
            const mockLogger = createMockLogger();

            expect(mockLogger.debug).toBeDefined();
            expect(mockLogger.info).toBeDefined();
            expect(mockLogger.warn).toBeDefined();
            expect(mockLogger.error).toBeDefined();
            expect(mockLogger.context).toBe('test-context');
        });

        it('should format messages correctly', () => {
            const mockLogger = createMockLogger();

            expect(mockLogger.formatMessage('test')).toBe('test');
            expect(mockLogger.formatMessage(null)).toBe('null');
            expect(mockLogger.formatMessage(undefined)).toBe('undefined');
            expect(mockLogger.formatMessage(123)).toBe('123');
        });
    });

    describe('createMockRPCClient', () => {
        it('should create a mock RPC client with all required methods', () => {
            const mockRpcClient = createMockRpcClient();

            expect(mockRpcClient.url).toBe('http://localhost:8332');
            expect(mockRpcClient.headers).toEqual({});
            expect(mockRpcClient.call).toBeDefined();
            expect(mockRpcClient.setHeader).toBeDefined();
            expect(mockRpcClient.removeHeader).toBeDefined();
            expect(mockRpcClient.clearHeaders).toBeDefined();
            expect(mockRpcClient.getHeaders).toBeDefined();
            expect(mockRpcClient.validateRpcResponse).toBeDefined();
            expect(mockRpcClient.validateTransaction).toBeDefined();
            expect(mockRpcClient.sendTransaction).toBeDefined();
            expect(mockRpcClient.getTransaction).toBeDefined();
            expect(mockRpcClient.watchTransaction).toBeDefined();
            expect(mockRpcClient.stopWatchingTransaction).toBeDefined();
        });

        it('should validate RPC responses correctly', () => {
            const mockRpcClient = createMockRpcClient();

            // Valid response
            expect(() => mockRpcClient.validateRpcResponse({ result: 'success' })).not.toThrow();
            expect(mockRpcClient.validateRpcResponse({ result: 'success' })).toBe('success');

            // Invalid responses
            expect(() => mockRpcClient.validateRpcResponse(null)).toThrow('Invalid RPC response');
            expect(() => mockRpcClient.validateRpcResponse({})).toThrow('Invalid RPC response');
            expect(() => mockRpcClient.validateRpcResponse({ error: { message: 'test error' } }))
                .toThrow('RPC Error: test error');
            expect(() => mockRpcClient.validateRpcResponse({ error: { message: 'test error', code: 123 } }))
                .toThrow('RPC Error: test error (code: 123)');
        });
    });

    describe('createMockTransaction', () => {
        it('should create a mock transaction with all required fields', () => {
            const mockTx = createMockTransaction();

            expect(mockTx.txid).toBe('mock-txid');
            expect(mockTx.version).toBe(1);
            expect(mockTx.locktime).toBe(0);
            expect(Array.isArray(mockTx.vin)).toBe(true);
            expect(Array.isArray(mockTx.vout)).toBe(true);
            expect(mockTx.size).toBe(100);
            expect(mockTx.weight).toBe(400);
            expect(mockTx.fee).toBe(1000);
            expect(mockTx.status).toBeDefined();
            expect(mockTx.status.confirmed).toBe(true);
            expect(mockTx.status.block_height).toBe(100);
            expect(mockTx.status.block_hash).toBe('mock-block-hash');
            expect(typeof mockTx.status.block_time).toBe('number');
        });
    });

    describe('createMockValidationService', () => {
        it('should create a mock validation service with all required methods', () => {
            const mockValidationService = createMockValidationService();

            expect(mockValidationService.config).toBeDefined();
            expect(mockValidationService.config.maxTransactionSize).toBe(1000000);
            expect(mockValidationService.config.maxBatchSize).toBe(100);
            expect(mockValidationService.config.minConfirmations).toBe(1);
            expect(mockValidationService.validateTransaction).toBeDefined();
            expect(mockValidationService.validateBatch).toBeDefined();
            expect(mockValidationService.validateAddress).toBeDefined();
        });

        it('should return mocked validation results', async () => {
            const mockValidationService = createMockValidationService();

            const transactionResult = await mockValidationService.validateTransaction({});
            const batchResult = await mockValidationService.validateBatch([]);
            const addressResult = mockValidationService.validateAddress('test');

            expect(transactionResult).toBe(true);
            expect(batchResult).toBe(true);
            expect(addressResult).toBe(true);
        });
    });
});
