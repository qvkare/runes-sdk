import { RunesSDK } from 'runes-sdk';

async function main() {
    // Initialize SDK
    const sdk = new RunesSDK({
        rpcUrl: 'http://localhost:8332',
        wsUrl: 'ws://localhost:8333'
    });

    try {
        // Query a transaction
        const tx = await sdk.getTransaction('your-transaction-id');
        console.log('Transaction details:', tx);

        // Check transaction status
        if (tx.status === 'Confirmed') {
            console.log(`Transaction confirmed with ${tx.confirmation_count} confirmations`);
            console.log('Runes transferred:', tx.runes);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Cleanup
        sdk.disconnect();
    }
}

main().catch(console.error); 