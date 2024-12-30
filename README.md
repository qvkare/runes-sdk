# Runes SDK

TypeScript SDK for interacting with Bitcoin Runes protocol.

## Features

- 🚀 Full TypeScript support with type definitions
- 🔒 Secure transaction handling
- 🔄 Automatic retry mechanism
- 📊 Comprehensive runes statistics
- 💼 Advanced batch operations
- 🔍 Detailed transaction history
- 💧 Performance monitoring
- 🔔 Real-time metrics and logging

## Installation

```bash
npm install runes-sdk
```

## Quick Start

```typescript
import { RunesService } from 'runes-sdk';

// Initialize SDK
const runesService = new RunesService({
  bitcoinRpc: {
    host: 'localhost',
    port: 8332,
    username: 'your-rpc-username',
    password: 'your-rpc-password'
  },
  network: 'testnet',
  monitoring: {
    enabled: true,
    port: 9090
  }
});

// Mint new runes
const mintResult = await runesService.mintRunes({
  symbol: 'TEST',
  supply: 1000000
});

// Send runes
const sendResult = await runesService.sendRunes({
  symbol: 'TEST',
  amount: 1000,
  to: 'tb1qtest...'
});

// Get balance
const balance = await runesService.getBalance('tb1qtest...', 'TEST');
```

## Batch Operations

```typescript
import { BatchService } from 'runes-sdk';

// Initialize batch service
const batchService = new BatchService(runesService, {
  batchSize: 100,
  processingInterval: 1000
});

// Start batch processing
batchService.start();

// Add operations to batch
const batchId = 'batch1';
await batchService.addMintOperation(batchId, {
  symbol: 'TEST',
  supply: 1000000
});

await batchService.addTransferOperation(batchId, {
  symbol: 'TEST',
  amount: 1000,
  to: 'tb1qtest...'
});

// Wait for batch completion
const results = await batchService.waitForBatchCompletion(batchId);
```

## Monitoring & Metrics

The SDK includes built-in monitoring capabilities:

- Prometheus metrics at `/metrics`
- Health check endpoint at `/health`
- Detailed logging with Winston

```typescript
// Metrics are automatically collected
// Access Prometheus metrics at http://localhost:9090/metrics

// Health check
// GET http://localhost:9090/health
// Response: { "status": "ok" }

// Available metrics:
// - runes_transactions_total
// - runes_transaction_duration_seconds
// - runes_utxo_count
// - runes_errors_total
// - runes_balance
```

## Configuration

```typescript
interface RunesConfig {
  // Bitcoin Core RPC configuration
  bitcoinRpc: {
    host: string;
    port: number;
    username: string;
    password: string;
    timeout?: number;
  };

  // Network selection
  network: 'mainnet' | 'testnet' | 'regtest';

  // Retry configuration
  maxRetries?: number;
  retryDelay?: number;

  // Monitoring configuration
  monitoring?: {
    enabled: boolean;
    port?: number;
    logLevel?: 'error' | 'warn' | 'info' | 'debug';
    metricsPath?: string;
    healthCheckPath?: string;
  };
}
```

## API Reference

### RunesService

#### `mintRunes(params: MintParams): Promise<RunesTransaction>`

Create new runes with specified parameters.

```typescript
interface MintParams {
  symbol: string;    // 1-4 characters
  supply: number;    // Total supply
  limit?: number;    // Optional max supply
}
```

#### `sendRunes(params: SendParams): Promise<RunesTransaction>`

Transfer runes to another address.

```typescript
interface SendParams {
  symbol: string;    // Rune symbol
  amount: number;    // Amount to send
  to: string;        // Recipient address
}
```

#### `getBalance(address: string, symbol: string): Promise<RunesBalance>`

Get rune balance for an address.

```typescript
interface RunesBalance {
  symbol: string;
  amount: number;
  address: string;
  lastUpdated: number;
}
```

### BatchService

#### `addMintOperation(batchId: string, params: MintParams): Promise<string>`

Add a mint operation to a batch.

#### `addTransferOperation(batchId: string, params: SendParams): Promise<string>`

Add a transfer operation to a batch.

#### `waitForBatchCompletion(batchId: string, timeout?: number): Promise<BatchOperation[]>`

Wait for all operations in a batch to complete.

## Error Handling

The SDK uses typed errors for better error handling:

```typescript
try {
  const result = await runesService.mintRunes({
    symbol: 'TEST',
    supply: 1000000
  });
} catch (error) {
  if (error instanceof RunesError) {
    console.error(`Error code: ${error.code}`);
    console.error(`Error message: ${error.message}`);
  }
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

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT 