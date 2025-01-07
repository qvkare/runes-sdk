import { ConsoleLogger } from './logger';
import { RpcClient } from './rpc.client';

export function createMockLogger(): jest.Mocked<ConsoleLogger> {
    return {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        context: 'test-context',
        formatMessage: jest.fn().mockImplementation((message: string | null | undefined) => {
            if (message === null) return 'null';
            if (message === undefined) return 'undefined';
            return message.toString();
        })
    } as unknown as jest.Mocked<ConsoleLogger>;
}

export function createMockRpcClient(): jest.Mocked<RpcClient> {
    return {
        url: 'http://localhost:8332',
        headers: {},
        call: jest.fn(),
        setHeader: jest.fn(),
        removeHeader: jest.fn(),
        clearHeaders: jest.fn(),
        getHeaders: jest.fn().mockReturnValue({}),
        validateRpcResponse: jest.fn().mockImplementation((response: any) => {
            if (!response || typeof response !== 'object') {
                throw new Error('Invalid RPC response');
            }
            if (response.error) {
                const error = response.error;
                const message = error.message || error.toString();
                const code = error.code ? ` (code: ${error.code})` : '';
                throw new Error(`RPC Error: ${message}${code}`);
            }
            if (!('result' in response)) {
                throw new Error('Invalid RPC response');
            }
            return response.result;
        }),
        validateTransaction: jest.fn(),
        sendTransaction: jest.fn(),
        getTransaction: jest.fn(),
        watchTransaction: jest.fn(),
        stopWatchingTransaction: jest.fn()
    } as unknown as jest.Mocked<RpcClient>;
}

export function createMockTransaction() {
    return {
        txid: 'mock-txid',
        version: 1,
        locktime: 0,
        vin: [],
        vout: [],
        size: 100,
        weight: 400,
        fee: 1000,
        status: {
            confirmed: true,
            block_height: 100,
            block_hash: 'mock-block-hash',
            block_time: Date.now()
        }
    };
}

export function createMockValidationService() {
    return {
        config: {
            maxTransactionSize: 1000000,
            maxBatchSize: 100,
            minConfirmations: 1
        },
        validateTransaction: jest.fn().mockResolvedValue(true),
        validateBatch: jest.fn().mockResolvedValue(true),
        validateAddress: jest.fn().mockReturnValue(true)
    };
}
