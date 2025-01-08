# Runes SDK

A robust TypeScript and Rust SDK for seamless interaction with the Runes protocol.

[![npm version](https://badge.fury.io/js/runes-sdk.svg)](https://badge.fury.io/js/runes-sdk)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Architecture](#architecture)
- [Development](#development)
- [CEX Integration](#cex-integration)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Hybrid Architecture**
  - Core functionality in Rust for performance
  - TypeScript wrapper for ease of use
  - Comprehensive type definitions

- **Connectivity**
  - RPC client for blockchain interaction
  - WebSocket support for real-time updates
  - Automatic reconnection handling

- **Trading Operations**
  - Market data streaming
  - Order management
  - Balance tracking
  - Transaction monitoring

- **Security**
  - API key management
  - Secure transaction handling
  - Comprehensive test coverage

## Installation

```bash
npm install runes-sdk
# or
yarn add runes-sdk
```

## Quick Start

```typescript
import { RunesSDK } from 'runes-sdk';

// Initialize SDK
const sdk = new RunesSDK({
    rpcUrl: 'http://your-node:8332',
    wsUrl: 'ws://your-node:8333'
});

// Connect and monitor transactions
await sdk.connect();
sdk.on('transaction', tx => {
    console.log('New transaction:', tx);
});

// Query transaction
const tx = await sdk.getTransaction('your-tx-id');
console.log('Transaction details:', tx);

// Cleanup
sdk.disconnect();
```

## Documentation

Comprehensive documentation is available:

- **Guides**
  - [API Reference](docs/api/README.md)
  - [WebSocket Guide](docs/websocket.md)
  - [CEX Integration Guide](docs/cex-integration.md)

- **Examples**
  - [Basic Transaction](examples/basic-transaction.md)
  - [WebSocket Integration](examples/websocket-example.md)
  - [Security Examples](examples/security-example.md)
  - [CEX Integration](examples/cex-integration)

## Architecture

The SDK employs a hybrid architecture:

```
src/
├── typescript/         # TypeScript implementation
│   ├── api/           # API endpoints
│   ├── services/      # Core services
│   ├── types/         # TypeScript types
│   └── utils/         # Utilities
├── rust/              # Rust implementation
    ├── api/           # Rust API
    ├── services/      # Core services
    └── types/         # Rust types
```

## Development

### Prerequisites
- Node.js (v16 or later)
- Rust (latest stable)
- Git

### Setup
```bash
# Clone repository
git clone https://github.com/qvkare/runes-sdk.git
cd runes-sdk

# Install dependencies
npm install

# Run tests
npm run test        # All tests
npm run test:ts     # TypeScript tests
cargo test         # Rust tests

# Build
npm run build
```

### Configuration

```typescript
const sdk = new RunesSDK({
    rpcUrl: process.env.RUNES_RPC_URL,
    wsUrl: process.env.RUNES_WS_URL,
    network: 'mainnet',
    timeout: 30000
});
```

## CEX Integration

The SDK provides built-in support for cryptocurrency exchange integrations. Key features include real-time transaction monitoring, secure deposit/withdrawal handling, and balance tracking.

For detailed integration instructions and examples, see:
- [CEX Integration Guide](docs/cex-integration.md)
- [Integration Examples](examples/cex-integration)

## Contributing

Feel free to open issues for questions or suggestions, and submit pull requests for any improvements you'd like to share.

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Support

- [GitHub Issues](https://github.com/qvkare/runes-sdk/issues)
- [Documentation](docs/)
- [Examples](examples/) 