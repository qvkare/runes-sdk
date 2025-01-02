# WebSocket Integration Example

This example demonstrates how to use the WebSocket functionality of the Runes SDK for real-time market data, trading updates, and system monitoring.

## Configuration

First, set up the WebSocket configuration:

```typescript
import { RunesSDK } from '../src';
import { WebSocketConfig } from '../src/services/websocket/websocket.service';
import { OrderSide, OrderType } from '../src/types/market.types';
import { PositionSide, MarginType } from '../src/types/futures.types';

const wsConfig: WebSocketConfig = {
  port: 8080,
  host: 'localhost',
  maxConnections: 100,
  rateLimit: {
    maxRequestsPerMinute: 1000,
    maxConnectionsPerIP: 50
  },
  security: {
    enableIPWhitelist: true,
    whitelistedIPs: ['127.0.0.1'],
    requireAuthentication: true
  }
};
```

## SDK Initialization

Initialize the SDK with WebSocket support:

```typescript
const sdk = new RunesSDK({
  host: 'your-node-url',
  username: 'your-username',
  password: 'your-password',
  websocket: wsConfig
});

const ws = sdk.getWebSocketService();
```

## Market Data Subscription

Subscribe to market data channels:

```typescript
// Subscribe to market data
ws.subscribe({
  channel: 'market',
  symbols: ['BTC/USDT', 'ETH/USDT'],
  interval: '1m'
});

// Subscribe to orderbook
ws.subscribe({
  channel: 'orderbook',
  symbols: ['BTC/USDT'],
  depth: 10
});
```

## Event Handling

Set up event handlers for different types of updates:

```typescript
// Market updates
ws.on('market', (update) => {
  console.log('Market Update:', update);
});

// Position updates
ws.on('position', (update) => {
  console.log('Position Update:', {
    symbol: update.symbol,
    side: update.positionSide,
    size: update.notional,
    pnl: update.unrealizedPnL
  });
});

// Trade updates
ws.on('trade', (update) => {
  console.log('Trade Update:', {
    symbol: update.symbol,
    price: update.price,
    quantity: update.quantity,
    side: update.side
  });
});

// Liquidation events
ws.on('liquidation', (event) => {
  console.log('Liquidation Event:', {
    symbol: event.symbol,
    side: event.side,
    price: event.price,
    quantity: event.quantity
  });
});

// Account updates
ws.on('account', (update) => {
  console.log('Account Update:', {
    balances: update.balances,
    permissions: update.permissions
  });
});
```

## System Monitoring

Monitor WebSocket health and metrics:

```typescript
setInterval(() => {
  const metrics = ws.getMetrics();
  console.log('WebSocket Metrics:', {
    messageCount: metrics.messageCount,
    errorCount: metrics.errorCount,
    activeConnections: metrics.activeConnections,
    latency: metrics.latency
  });

  const health = ws.getHealth();
  console.log('System Health:', {
    status: health.status,
    components: health.components
  });
}, 60000);
```

## Error Handling and Cleanup

Handle errors and cleanup on application exit:

```typescript
// Error handling
ws.on('error', (error) => {
  console.error('WebSocket Error:', error);
});

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('Shutting down WebSocket connection...');
  ws.shutdown();
  process.exit(0);
});
``` 