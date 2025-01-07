# Runes SDK API Reference

## Transaction Operations
### validateTransaction
Validates a blockchain transaction.

```typescript
async validateTransaction(txid: string): Promise<boolean>
```

#### Parameters
- `txid` (string): Transaction ID to validate

#### Returns
- `Promise<boolean>`: Transaction validity status

#### Error Handling
- Throws if RPC connection fails
- Throws if transaction validation fails

## WebSocket Integration
### subscribeToTransactions
Subscribe to real-time transaction updates.

```typescript
subscribeToTransactions(options: SubscriptionOptions): WebSocketConnection
```

#### Options
- `filter`: Transaction filter criteria
- `batchSize`: Number of transactions per batch

## Error Handling Guide

### Common Errors
- `ConnectionError`: RPC connection issues
- `ValidationError`: Transaction validation failures
- `TimeoutError`: Request timeout

### Best Practices
- Implement retry logic for unstable connections
- Use proper error boundaries in your application
- Log errors appropriately for debugging
- Handle edge cases and timeouts
- Implement proper cleanup for WebSocket connections 