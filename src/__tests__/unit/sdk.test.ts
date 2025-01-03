import { RunesSDK } from '../../typescript/sdk';

describe('RunesSDK', () => {
    let sdk: RunesSDK;

    beforeEach(() => {
        sdk = new RunesSDK({
            rpcUrl: 'http://localhost:8332',
            wsUrl: 'ws://localhost:8333'
        });
    });

    afterEach(() => {
        sdk.disconnect();
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
            await sdk.getTransaction(mockTxid);
        } catch (error) {
            expect(error).toBeDefined();
            // Should fail because we're not actually connected to a node
        }
    });
});
