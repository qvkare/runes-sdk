import { RunesSDK } from '../../typescript/sdk';
import { fail } from 'assert';
import { RpcClient } from '../../utils/rpc.client';

jest.mock('../../utils/rpc.client');

describe('RunesSDK', () => {
    let sdk: RunesSDK;

    beforeEach(() => {
        (RpcClient as jest.Mock).mockImplementation(() => ({
            call: jest.fn().mockResolvedValue({ txid: '1234567890abcdef', confirmations: 1 })
        }));

        sdk = new RunesSDK({
            rpcUrl: 'http://localhost:8332',
            wsUrl: 'ws://localhost:8333'
        });
    });

    afterEach(() => {
        sdk.disconnect();
        jest.clearAllMocks();
    });

    it('should initialize correctly', () => {
        expect(sdk).toBeDefined();
    });

    it('should connect and disconnect websocket', () => {
        sdk.connect();
        sdk.disconnect();
        // No errors should be thrown
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
    }, 15000);
});
