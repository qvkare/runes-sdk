# Runes SDK

TypeScript SDK for interacting with Bitcoin Runes protocol.

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

// Get rune information
const runeInfo = await sdk.getRune('EXAMPLE');

// Get rune balance
const balance = await sdk.getRuneBalance('bc1qxxx', 'EXAMPLE');

// Get rune history
const history = await sdk.getRuneHistory('EXAMPLE');

// List all runes
const runes = await sdk.listRunes();
```

## Configuration

```typescript
interface SDKConfig {
  ordServer: string;      // Ord server URL
  network: 'mainnet' | 'testnet';
  timeout?: number;       // Request timeout in ms
  retryAttempts?: number; // Number of retry attempts
}
```

## API Reference

### Core Methods

#### `getRune(id: string): Promise<RuneInfo>`
Get information about a specific rune.

#### `getRuneBalance(address: string, rune: string): Promise<RuneBalance>`
Get rune balance for a specific address.

#### `getRuneHistory(rune: string): Promise<RuneTransaction[]>`
Get transfer history of a rune.

#### `listRunes(options?: PaginationOptions): Promise<PaginatedResponse<RuneInfo>>`
List all available runes.

### Advanced Methods

#### `validateRuneTransaction(txHex: string): Promise<ValidationResult>`
Validate a rune transaction.

#### `getRuneStats(rune: string): Promise<RuneStats>`
Get statistics for a rune.

#### `searchRunes(query: SearchOptions): Promise<SearchResult>`
Search for runes.

## Error Handling

The SDK throws typed errors for different scenarios:

```typescript
try {
  const rune = await sdk.getRune('EXAMPLE');
} catch (error) {
  if (error instanceof RuneSDKError) {
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

## License

MIT 