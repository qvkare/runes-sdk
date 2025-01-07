# Runes SDK

A TypeScript and Rust SDK for interacting with the Runes protocol.

## Features

- Hybrid architecture with TypeScript and Rust
- RPC client for blockchain interaction
- WebSocket support for real-time updates
- Market data streaming
- Trading operations support
- Type-safe API
- Comprehensive test coverage
- Security features and API key management

## Documentation

- [API Reference](docs/api/README.md)
- [WebSocket Guide](docs/websocket.md)
- [Examples](examples/)
  - [Basic Transaction](examples/basic-transaction.md)
  - [WebSocket Integration](examples/websocket-example.md)
  - [Security Examples](examples/security-example.md)

## Installation

```bash
npm install runes-sdk
```

## Quick Start

```typescript
import { RunesSDK } from 'runes-sdk';

// Initialize SDK
const sdk = new RunesSDK({
    rpcUrl: 'http://your-node:8332',
    wsUrl: 'ws://your-node:8333'  // Optional WebSocket support
});

// Connect to WebSocket (optional)
sdk.connect();

// Query transaction
const tx = await sdk.getTransaction('your-tx-id');
console.log(tx);

// Cleanup
sdk.disconnect();
```

## Architecture

The SDK follows a hybrid architecture:
- Core functionality implemented in Rust
- TypeScript wrapper for ease of use
- WebSocket support for real-time updates
- Comprehensive type definitions
- Built-in security features

## Development Setup

### Prerequisites

- Node.js (v16 or later)
- Rust (latest stable)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/qvkare/runes-sdk.git
cd runes-sdk
```

2. Install dependencies:
```bash
npm install
```

3. Run tests:
```bash
npm run test        # Run all tests
npm run test:ts     # Run TypeScript tests
cargo test         # Run Rust tests
```

4. Build the project:
```bash
npm run build
```

## Project Structure

```
src/
├── typescript/              # TypeScript implementation
│   ├── api/                # API endpoints
│   ├── services/           # Core services
│   ├── types/             # TypeScript types
│   └── utils/             # Utilities
├── rust/                   # Rust implementation
    ├── api/               # Rust API
    ├── services/          # Core services
    └── types/            # Rust types

docs/                      # Documentation
examples/                  # Usage examples
tests/                    # Test files
```

## Configuration

The SDK can be configured through the configuration object:

```typescript
const sdk = new RunesSDK({
    rpcUrl: process.env.RUNES_RPC_URL,
    wsUrl: process.env.RUNES_WS_URL,
    network: 'mainnet',
    timeout: 30000
});
```

## Testing

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:ts
cargo test

# Run with coverage
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC License - see the [LICENSE](LICENSE) file for details 