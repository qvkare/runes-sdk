# Runes SDK Examples

This directory contains example usage of the Runes SDK.

## Prerequisites

- Node.js 16+
- Bitcoin Core node running (testnet or regtest)
- Environment variables:
  - `BTC_RPC_USER`: Bitcoin Core RPC username
  - `BTC_RPC_PASS`: Bitcoin Core RPC password

## Setup

```bash
# Install dependencies
npm install

# Set environment variables
export BTC_RPC_USER=your-rpc-username
export BTC_RPC_PASS=your-rpc-password
```

## Running Examples

### Basic Usage

Demonstrates basic SDK functionality like minting and transferring runes.

```bash
npm run basic
```

### Batch Operations

Shows how to use batch operations for processing multiple transactions.

```bash
npm run batch
```

### Monitoring

Demonstrates the monitoring and metrics functionality.

```bash
npm run monitoring
```

Then visit:
- http://localhost:9090/metrics - View Prometheus metrics
- http://localhost:9090/health - Check health status

## Example Files

- `basic-usage.ts`: Basic SDK operations
- `batch-operations.ts`: Batch processing example
- `monitoring.ts`: Monitoring and metrics example

## Notes

- Examples use testnet by default
- Make sure your Bitcoin Core node is fully synced
- For production use, replace placeholder addresses with real ones
- Monitor the logs for detailed operation information 