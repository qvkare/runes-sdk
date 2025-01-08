# CEX Integration Guide

This guide explains how to integrate the Runes SDK into a cryptocurrency exchange (CEX) environment.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Basic Setup](#basic-setup)
- [Key Features](#key-features)
- [Best Practices](#best-practices)
- [Common Issues](#common-issues)
- [Examples](#examples)

## Prerequisites

Before integrating the Runes SDK, ensure you have:
- Node.js v16 or higher
- Access to a Bitcoin node (or use public nodes like mempool.space)
- WebSocket support enabled
- Secure environment for handling private keys
- Database system for tracking balances

## Installation

```bash
npm install runes-sdk
# or
yarn add runes-sdk
```

## Basic Setup

```typescript
import { RunesSDK } from 'runes-sdk';

const sdk = new RunesSDK({
  rpcUrl: 'your-rpc-endpoint',
  wsUrl: 'your-websocket-endpoint'
});

// Initialize connection
await sdk.connect();
```

## Key Features

### 1. Deposit Monitoring

```typescript
// Track deposits for specific token
sdk.on('transaction', async (tx) => {
  if (tx.runeToken === 'DOG') {
    const confirmations = await sdk.getConfirmations(tx.id);
    if (confirmations >= 3) {
      // Process confirmed deposit
      await processDeposit({
        token: 'DOG',
        amount: tx.amount,
        address: tx.to,
        txId: tx.id
      });
    }
  }
});
```

### 2. Balance Management

```typescript
// Check single address balance
const balance = await sdk.getRuneBalance(address);

// Batch balance check
const balances = await Promise.all(
  addresses.map(addr => sdk.getRuneBalance(addr))
);
```

### 3. Withdrawal Processing

```typescript
async function handleWithdrawal(withdrawal: Withdrawal) {
  try {
    // 1. Verify balance
    const balance = await sdk.getRuneBalance(fromAddress);
    if (balance < withdrawal.amount) {
      throw new Error('Insufficient balance');
    }

    // 2. Send transaction
    const tx = await sdk.sendRunes(
      withdrawal.token,
      withdrawal.toAddress,
      withdrawal.amount
    );

    // 3. Wait for confirmations
    await waitForConfirmations(tx.id, 3);

    return tx.id;
  } catch (error) {
    // Handle error appropriately
    throw error;
  }
}
```

## Best Practices

### Security

1. **Multiple Confirmations**
   - Wait for at least 3 confirmations before processing deposits
   - Use higher confirmation counts for large amounts

2. **Address Management**
   - Generate unique deposit addresses for each user
   - Implement address validation
   - Use cold storage for large holdings

3. **Error Handling**
   - Implement proper error recovery
   - Log all critical operations
   - Set up monitoring and alerts

### Performance

1. **Batch Processing**
   - Use batch operations for balance updates
   - Implement caching where appropriate
   - Monitor performance metrics

2. **Connection Management**
   - Handle WebSocket reconnections
   - Implement failover mechanisms
   - Monitor connection health

### Monitoring

1. **Transaction Monitoring**
   - Track all transactions in real-time
   - Implement alerts for large transactions
   - Monitor failed transactions

2. **Balance Reconciliation**
   - Regular balance checks
   - Automated reconciliation
   - Alert on discrepancies

## Common Issues

### 1. Connection Issues
```typescript
sdk.on('error', async (error) => {
  console.error('Connection error:', error);
  // Implement reconnection logic
  await reconnect();
});
```

### 2. Transaction Verification
```typescript
async function verifyTransaction(txId: string): Promise<boolean> {
  try {
    const confirmations = await sdk.getConfirmations(txId);
    return confirmations >= 3;
  } catch (error) {
    console.error('Verification failed:', error);
    return false;
  }
}
```

### 3. Balance Synchronization
```typescript
async function syncBalances() {
  const onChainBalances = await sdk.getRuneBalance(address);
  const dbBalance = await getBalanceFromDB(address);
  
  if (onChainBalances !== dbBalance) {
    await updateDBBalance(address, onChainBalances);
    logDiscrepancy(address, dbBalance, onChainBalances);
  }
}
```

## Examples

See the [examples/cex-integration](../examples/cex-integration) directory for complete implementation examples, including:
- Deposit tracking
- Withdrawal processing
- Balance monitoring
- Error handling
- Batch operations

## Support

For additional support:
- Check our [GitHub Issues](https://github.com/your-repo/issues)
- Join our [Discord community](https://discord.gg/your-server)
- Email support at support@your-domain.com 