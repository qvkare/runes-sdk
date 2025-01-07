# Basic Transactions

This documentation covers the fundamental concepts and implementation details for handling basic transactions with the Runes SDK.

## Overview

Basic transactions are the foundation of blockchain operations. This guide explains how to create, validate, send, and monitor transactions using the Runes SDK.

## Prerequisites

- Runes SDK installed
- Valid RPC credentials
- Basic understanding of blockchain concepts

## Configuration

### SDK Configuration

Configure the SDK with these essential parameters:

```typescript
{
  host: string;          // RPC host URL
  username: string;      // RPC username
  password: string;      // RPC password
  mempoolConfig: {
    monitorInterval: number;  // Status check interval
    maxTransactions: number;  // Maximum tracked transactions
    minFeeRate: number;      // Minimum transaction fee rate
  }
}
```

## Transaction Lifecycle

### 1. Transaction Creation

Create a transaction object with required parameters:
- Transaction ID
- Fee amount
- Input/output details
- Additional metadata as needed

### 2. Validation

Before sending, validate the transaction:
- Structure validation
- Fee validation
- Input/output validation
- Business rule validation

### 3. Transaction Submission

Submit the validated transaction:
- Send to the network
- Receive transaction ID
- Handle submission errors

### 4. Transaction Monitoring

Monitor the transaction status:
- Track confirmation status
- Monitor mempool status
- Handle status updates

## API Reference

### Core Methods

#### `validateTransaction(tx: Transaction): Promise<ValidationResult>`
Validates a transaction before submission.

**Parameters:**
- `tx`: Transaction object to validate

**Returns:**
- `ValidationResult` with validation status and any errors

#### `sendTransaction(tx: Transaction): Promise<string>`
Sends a validated transaction to the network.

**Parameters:**
- `tx`: Validated transaction object

**Returns:**
- Transaction ID (string)

#### `watchTransaction(txid: string): Promise<void>`
Monitors a transaction's status.

**Parameters:**
- `txid`: Transaction ID to monitor

#### `getTransactionStatus(txid: string): Promise<TransactionStatus>`
Retrieves current transaction status.

**Parameters:**
- `txid`: Transaction ID to check

**Returns:**
- Current transaction status

## Error Handling

### Common Errors

1. **Validation Errors**
   - Invalid transaction structure
   - Insufficient fees
   - Invalid inputs/outputs

2. **Network Errors**
   - Connection failures
   - Timeout issues
   - RPC errors

3. **Status Errors**
   - Transaction rejection
   - Confirmation delays
   - Mempool issues

### Best Practices

1. **Error Prevention**
   - Validate all inputs
   - Check network status
   - Verify fee calculations

2. **Error Recovery**
   - Implement retry logic
   - Handle timeouts gracefully
   - Log errors appropriately

## Examples

For practical implementation examples, refer to `examples/basic-transaction.md`. 