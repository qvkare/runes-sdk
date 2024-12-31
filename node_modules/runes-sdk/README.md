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

## Installation

```bash
npm install runes-sdk
```

## Quick Start

```typescript
import { RunesSDK } from 'runes-sdk';

// Initialize SDK
const sdk = new RunesSDK({
  ordServer: 'http://localhost:8080',
  network: 'mainnet'
});

// Get runes information
const runesInfo = await sdk.getRunes('EXAMPLE');

// Get runes balance
const balance = await sdk.getRunesBalance('bc1qxxx', 'EXAMPLE');

// Get runes history
const history = await sdk.getRunesHistory('EXAMPLE');

// List all runes
const runes = await sdk.listRunes();
```

## Advanced Usage

### Batch Operations

```typescript
// Create multiple transfers in a single batch
const batch = sdk.createBatch();
batch.addTransfer('RUNES1', 'address1', 100);
batch.addTransfer('RUNES2', 'address2', 200);
await batch.execute();
```

### Liquidity Pool Management

```typescript
// Create a liquidity pool
await sdk.liquidity.createPool('RUNES1', 'RUNES2', {
  initialLiquidity: 1000
});

// Add liquidity
await sdk.liquidity.addLiquidity('POOL_ID', {
  runes1Amount: 500,
  runes2Amount: 500
});
```

### Performance Monitoring

```typescript
// Get performance metrics
const metrics = await sdk.performance.getMetrics('RUNES1');
console.log('Transaction throughput:', metrics.throughput);
console.log('Average confirmation time:', metrics.avgConfirmationTime);
```

## Configuration

```typescript
interface SDKConfig {
  ordServer: string;      // Ord server URL
  network: 'mainnet' | 'testnet';
  timeout?: number;       // Request timeout in ms
  retryAttempts?: number; // Number of retry attempts
  batchSize?: number;     // Maximum batch size
  security?: {
    validateAddresses: boolean;
    requireSignature: boolean;
  }
}
```

## API Reference

### Core Methods

#### `getRunes(id: string): Promise<RunesInfo>`
Get information about specific runes.

#### `getRunesBalance(address: string, runes: string): Promise<RunesBalance>`
Get runes balance for a specific address.

#### `getRunesHistory(runes: string): Promise<RunesTransaction[]>`
Get transfer history of runes.

#### `listRunes(options?: PaginationOptions): Promise<PaginatedResponse<RunesInfo>>`
List all available runes.

### Advanced Methods

#### `validateRunesTransaction(txHex: string): Promise<ValidationResult>`
Validate a runes transaction.

#### `getRunesStats(runes: string): Promise<RunesStats>`
Get statistics for runes.

#### `searchRunes(query: SearchOptions): Promise<SearchResult>`
Search for runes.

### Security Methods

```typescript
// Validate transaction security
const validation = await sdk.security.validateTransaction(txHex);
if (!validation.isSecure) {
  console.error('Security issues:', validation.issues);
}
```

## Error Handling

The SDK throws typed errors for different scenarios:

```typescript
try {
  const runes = await sdk.getRunes('EXAMPLE');
} catch (error) {
  if (error instanceof RunesSDKError) {
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

# Run linter
npm run lint

# Format code
npm run format
```

## Testing

The SDK includes comprehensive unit tests. To run tests with coverage:

```bash
npm test
```

Coverage requirements:
- Branches: 90%
- Functions: 90%
- Lines: 90%
- Statements: 90%

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the documentation

## License

MIT 