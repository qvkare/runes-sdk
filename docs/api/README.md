# Runes SDK API Documentation

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Core API](#core-api)
- [WebSocket API](#websocket-api)
- [Monitoring](#monitoring)
- [Types](#types)

## Installation

```bash
npm install runes-sdk
```

## Configuration

The SDK can be configured with the following options:

```typescript
interface SDKConfig {
    rpcUrl: string;              // RPC endpoint URL
    wsUrl?: string;              // Optional WebSocket URL
    redis?: {                    // Optional Redis configuration
        host: string;
        port: number;
        password?: string;
    };
    monitoring?: {               // Optional monitoring configuration
        enabled: boolean;
        prometheusPort: number;
        labels?: Record<string, string>;
    };
}
```

## Core API

### Transaction Operations

```typescript
class RunesSDK {
    // Query transaction details
    async getTransaction(txid: string): Promise<Transaction>;

    // Connect to WebSocket server
    connect(): void;

    // Disconnect from WebSocket server
    disconnect(): void;
}
```

### Types

```typescript
interface Transaction {
    transaction_id: string;
    runes: RuneTransfer[];
    block_height?: number;
    confirmation_count: number;
    timestamp: number;
    network_type: 'Mainnet' | 'Testnet';
    status: 'Pending' | 'Confirmed' | 'Failed';
}

interface RuneTransfer {
    rune_id: string;
    from_address: string;
    to_address: string;
    amount: string;
    type: 'mint' | 'transfer' | 'burn';
    fee?: string;
    metadata?: Record<string, any>;
}
```

## WebSocket API

### Events

The SDK emits the following events:

```typescript
sdk.on('connect', () => {
    // WebSocket connected
});

sdk.on('disconnect', () => {
    // WebSocket disconnected
});

sdk.on('transaction', (tx: Transaction) => {
    // New transaction received
});

sdk.on('error', (error: Error) => {
    // Error occurred
});
```

## Monitoring

### Metrics

The following metrics are available when monitoring is enabled:

1. Transaction Metrics:
   - `runes_transactions_total`: Total number of transactions processed
   - `runes_transaction_errors_total`: Total number of transaction errors
   - `runes_transaction_processing_time_seconds`: Transaction processing time

2. WebSocket Metrics:
   - `runes_websocket_connections`: Current number of WebSocket connections
   - `runes_websocket_messages_total`: Total number of WebSocket messages
   - `runes_websocket_errors_total`: Total number of WebSocket errors

3. Cache Metrics:
   - `runes_cache_hits_total`: Total number of cache hits
   - `runes_cache_misses_total`: Total number of cache misses
   - `runes_cache_size_bytes`: Current cache size in bytes

### Grafana Dashboards

Pre-configured Grafana dashboards are available in the `deploy/grafana` directory:

1. `transaction-dashboard.json`: Transaction monitoring
2. `websocket-dashboard.json`: WebSocket connection monitoring
3. `performance-dashboard.json`: Performance metrics

## Error Handling

```typescript
try {
    const tx = await sdk.getTransaction('txid');
} catch (error) {
    if (error instanceof RunesError) {
        // Handle SDK-specific errors
        console.error('SDK Error:', error.message);
        console.error('Error Code:', error.code);
    } else {
        // Handle other errors
        console.error('Unexpected error:', error);
    }
}
```

## Best Practices

1. Always handle WebSocket disconnections
2. Implement proper error handling
3. Monitor performance metrics
4. Use appropriate timeouts
5. Clean up resources when done

## Examples

See the `examples/` directory for complete usage examples:

- `examples/basic/transaction.ts`: Basic transaction querying
- `examples/websocket/realtime.ts`: Real-time updates
- `examples/monitoring/metrics.ts`: Metrics monitoring 