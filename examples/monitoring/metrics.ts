import { RunesSDK } from 'runes-sdk';

async function main() {
    // Initialize SDK with monitoring enabled
    const sdk = new RunesSDK({
        rpcUrl: 'http://localhost:8332',
        wsUrl: 'ws://localhost:8333',
        monitoring: {
            enabled: true,
            prometheusPort: 9090,
            labels: {
                service: 'runes-sdk',
                environment: 'production'
            }
        }
    });

    try {
        // Connect to WebSocket
        sdk.connect();

        // Monitor transaction metrics
        setInterval(async () => {
            try {
                // Get some transactions
                const tx = await sdk.getTransaction('sample-tx-id');
                console.log('Transaction metrics collected');
            } catch (error) {
                // Errors will be automatically tracked in metrics
                console.error('Error fetching transaction:', error);
            }
        }, 5000);

        // Monitor WebSocket connection
        sdk.on('connect', () => {
            console.log('WebSocket connected - metrics updated');
        });

        sdk.on('disconnect', () => {
            console.log('WebSocket disconnected - metrics updated');
        });

        console.log('Metrics available at http://localhost:9090/metrics');
        console.log('Example metrics:');
        console.log('- runes_transactions_total');
        console.log('- runes_websocket_connections');
        console.log('- runes_errors_total');
        console.log('- runes_response_time_seconds');

    } catch (error) {
        console.error('Error:', error);
        sdk.disconnect();
    }
}

main().catch(console.error); 