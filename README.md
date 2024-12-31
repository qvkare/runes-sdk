# Runes SDK

TypeScript SDK for interacting with Bitcoin Runes protocol.

## Features

- 🚀 Full TypeScript support with type definitions
- 🔒 Secure transaction handling
- 🔄 Automatic retry mechanism
- 📊 Comprehensive runes statistics
- 💼 Advanced batch operations
- 🔍 Detailed transaction history
- 💧 Liquidity pool management
- 📈 Performance monitoring
- 🔔 Webhook integration
- 🔍 Mempool tracking
- 📊 Real-time metrics

## Installation

```bash
npm install runes-sdk
```

## Quick Start

```typescript
import { RunesSDK } from 'runes-sdk';

// Initialize SDK with logger
const sdk = new RunesSDK(
  'http://localhost:8332',  // RPC URL
  'username',               // RPC username
  'password',              // RPC password
  logger                   // Optional logger
);

// Get transaction history
const history = await sdk.getTransactionHistory('address');

// Get specific transaction
const tx = await sdk.getTransaction('txid');

// Process batch transfers
const transfers = [
  {
    from: 'addr1',
    to: 'addr2',
    amount: '100',
    symbol: 'RUNE'
  }
];
const result = await sdk.processBatch(transfers);
```

## Advanced Features

### Webhook Integration

```typescript
// Register webhook
sdk.webhook.registerWebhook('http://your-server.com/webhook', ['transaction', 'block']);

// Handle webhook events
sdk.webhook.on('transaction', (event) => {
  console.log('New transaction:', event);
});
```

### Mempool Tracking

```typescript
// Watch mempool for transactions
sdk.mempool.watchMempool((transactions) => {
  console.log('New mempool transactions:', transactions);
});

// Get transaction status
const status = await sdk.mempool.getTransactionStatus('txid');
```

### Performance Monitoring

```typescript
// Get performance metrics
const metrics = await sdk.performance.getMetrics();

// Check rate limits
const isAllowed = await sdk.performance.checkRateLimit('operation');
```

### Security Features

```typescript
// Calculate risk score
const risk = await sdk.security.calculateRiskScore(transaction);

// Check blacklist
const isBlacklisted = await sdk.security.checkBlacklist('address');

// Validate transaction limits
const limitCheck = await sdk.security.checkTransactionLimits(transaction);
```

## Configuration

```typescript
interface SDKConfig {
  rpcUrl: string;         // Bitcoin RPC URL
  network: 'mainnet' | 'testnet' | 'regtest';
  username: string;       // RPC username
  password: string;       // RPC password
  timeout?: number;       // Request timeout in ms
  maxRetries?: number;    // Number of retry attempts
  retryDelay?: number;   // Delay between retries in ms
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

## Test Coverage

Current test coverage metrics:
- Statements: 100%
- Branch: 97.24%
- Functions: 94.66%
- Lines: 100%

## Error Handling

The SDK includes comprehensive error handling:

```typescript
try {
  const history = await sdk.getTransactionHistory('address');
} catch (error) {
  if (error instanceof RPCError) {
    console.error('RPC Error:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('Validation Error:', error.message);
  } else if (error instanceof SecurityError) {
    console.error('Security Error:', error.message);
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT 