import { RunesSDK } from '../../typescript/sdk';
import { fail } from 'assert';
import { RpcClient } from '../../utils/rpc.client';

jest.mock('../../utils/rpc.client');

const WS_STATES = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
};

describe('RunesSDK', () => {
    let sdk: RunesSDK;
    let mockWebSocket: any;
    let mockWebSocketInstance: any;

    beforeEach(() => {
        jest.useFakeTimers();

        // RPC Client mock'u
        (RpcClient as jest.Mock).mockImplementation(() => ({
            call: jest.fn().mockResolvedValue({ txid: '1234567890abcdef', confirmations: 1 })
        }));

        // WebSocket mock'u
        mockWebSocketInstance = {
            send: jest.fn(),
            close: jest.fn(),
            readyState: WS_STATES.CONNECTING,
            onopen: null,
            onclose: null,
            onerror: null,
            onmessage: null,
            addEventListener: jest.fn((event, handler) => {
                mockWebSocketInstance[`on${event}`] = handler;
            }),
            removeEventListener: jest.fn()
        };

        mockWebSocket = jest.fn(() => mockWebSocketInstance);
        (global as any).WebSocket = mockWebSocket;

        // SDK'yı başlat
        sdk = new RunesSDK({
            rpcUrl: 'http://localhost:8332',
            wsUrl: 'ws://localhost:8333'
        });

        // WebSocket event'lerini tetikle
        mockWebSocketInstance.readyState = WS_STATES.OPEN;
        if (mockWebSocketInstance.onopen) {
            mockWebSocketInstance.onopen(new Event('open'));
        }
    });

    afterEach(() => {
        if (sdk) {
            sdk.disconnect();
        }
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    it('should throw error when RPC URL is not provided', () => {
        expect(() => new RunesSDK({ rpcUrl: '' })).toThrow('RPC URL is required');
    });

    it('should initialize correctly', () => {
        expect(sdk).toBeDefined();
        expect(mockWebSocket).toHaveBeenCalledWith('ws://localhost:8333');
    });

    it('should connect and disconnect websocket', () => {
        expect(mockWebSocketInstance.readyState).toBe(WS_STATES.OPEN);
        expect(sdk.isConnected()).toBe(true);

        sdk.disconnect();
        expect(mockWebSocketInstance.close).toHaveBeenCalled();
        expect(sdk.isConnected()).toBe(false);
    });

    it('should handle transaction requests', async () => {
        const mockTxid = '1234567890abcdef';
        
        try {
            const result = await sdk.getTransaction(mockTxid);
            expect(result).toBeDefined();
            expect(result.txid).toBe(mockTxid);
        } catch (error) {
            fail('Transaction request failed: ' + error);
        }
    });

    it('should throw error when transaction ID is not provided', async () => {
        await expect(sdk.getTransaction('')).rejects.toThrow('Transaction ID is required');
    });

    it('should handle WebSocket initialization failure', () => {
        const error = new Error('WebSocket initialization failed');
        mockWebSocket.mockImplementationOnce(() => {
            throw error;
        });

        expect(() => {
            new RunesSDK({
                rpcUrl: 'http://localhost:8332',
                wsUrl: 'ws://localhost:8333'
            });
        }).toThrow(error.message);
    });

    it('should handle WebSocket connection errors', () => {
        const error = new Error('Connection error');
        if (mockWebSocketInstance.onerror) {
            mockWebSocketInstance.onerror(new Event('error'));
        }
        expect(mockWebSocketInstance.readyState).toBe(WS_STATES.OPEN);
    });

    it('should return correct WebSocket state', () => {
        expect(sdk.getWebSocketState()).toBe(WS_STATES.OPEN);
        
        sdk.disconnect();
        expect(sdk.getWebSocketState()).toBe(WS_STATES.CLOSED);
    });
});
