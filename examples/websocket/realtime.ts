import { RunesSDK } from 'runes-sdk';

async function main() {
    // Initialize SDK with WebSocket support
    const sdk = new RunesSDK({
        rpcUrl: 'http://localhost:8332',
        wsUrl: 'ws://localhost:8333'
    });

    try {
        // Connect to WebSocket
        sdk.connect();

        // Listen for new transactions
        sdk.on('transaction', (tx) => {
            console.log('New transaction:', tx);
            
            // Check if transaction contains runes
            if (tx.runes && tx.runes.length > 0) {
                console.log('Runes transferred:', tx.runes);
            }
        });

        // Listen for connection status
        sdk.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        sdk.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        // Keep the connection alive
        process.on('SIGINT', () => {
            console.log('Shutting down...');
            sdk.disconnect();
            process.exit(0);
        });

    } catch (error) {
        console.error('Error:', error);
        sdk.disconnect();
    }
}

main().catch(console.error); 