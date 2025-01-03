# Runes SDK

A comprehensive SDK for interacting with the Runes protocol, built with TypeScript and Rust.

## Features

- 🚀 High-performance Rust core with TypeScript bindings
- 🔄 Real-time WebSocket support for live updates
- 💾 Efficient caching with Redis integration
- 📊 Built-in monitoring with Prometheus & Grafana
- 🔒 Secure transaction handling
- 🔌 CEX integration support
- 🧪 Comprehensive test coverage

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
- Core functionality implemented in Rust for performance
- TypeScript wrapper for ease of use
- Shared types between Rust and TypeScript
- WebSocket support for real-time updates
- Redis caching for improved performance
- Prometheus & Grafana integration for monitoring

## Development Setup

### Prerequisites

- Node.js (v16 or later)
- Rust (latest stable)
- Docker (for local development)

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

3. Start development environment:
```bash
docker-compose up
```

4. Run tests:
```bash
npm run test        # Run all tests
npm run test:ts     # Run TypeScript tests
npm run test:rust   # Run Rust tests
```

5. Build the project:
```bash
npm run build
```

## Project Structure

```
src/
├── typescript/           # TypeScript implementation
│   ├── api/
│   ├── services/
│   ├── types/
│   └── utils/
├── rust/                # Rust core implementation
│   ├── api/
│   ├── services/
│   └── types/
└── shared/             # Shared types and utilities
    ├── constants/
    └── interfaces/

deploy/
├── helm/              # Kubernetes Helm charts
├── prometheus/        # Prometheus configuration
└── grafana/          # Grafana dashboards

docs/                 # Documentation
└── api/             # API documentation

examples/            # Usage examples
├── basic/
├── websocket/
└── monitoring/
```

## Configuration

The SDK can be configured through environment variables or the configuration object:

```typescript
const sdk = new RunesSDK({
    rpcUrl: process.env.RUNES_RPC_URL,
    wsUrl: process.env.RUNES_WS_URL,
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    },
    monitoring: {
        enabled: true,
        prometheusPort: 9090
    }
});
```

## Monitoring

The SDK includes built-in monitoring with Prometheus and Grafana:

1. Metrics available at `:9090/metrics`
2. Pre-configured Grafana dashboards
3. Performance monitoring
4. Error tracking
5. WebSocket connection status

## Testing

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:ts
npm run test:rust

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