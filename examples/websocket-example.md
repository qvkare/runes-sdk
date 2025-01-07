# WebSocket İstemci Örneği

Bu örnek, Runes SDK'nın WebSocket işlevselliğini kullanarak gerçek zamanlı market verisi, işlem güncellemeleri ve sistem izleme özelliklerini göstermektedir.

## Yapılandırma ve Başlatma

```typescript
import { RunesSDK } from '../src/sdk';

const sdk = new RunesSDK({
  rpcUrl: 'http://your-node-url:8080',
  wsUrl: 'wss://api.example.com/ws'
});

// WebSocket bağlantısını başlat
sdk.connect();
```

## Market Verisi İşlemleri

```typescript
// Market verisi almak için
sdk.subscribeToMarketData('BTC/USDT', '1m', (data) => {
  console.log('Market Güncellemesi:', {
    symbol: data.symbol,
    price: data.price,
    volume: data.volume,
    timestamp: data.timestamp
  });
});

// İşlem defteri verisi almak için
sdk.subscribeToOrderBook('BTC/USDT', (data) => {
  console.log('İşlem Defteri:', {
    bids: data.bids,
    asks: data.asks,
    timestamp: data.timestamp
  });
});
```

## İşlem Güncellemeleri

```typescript
// İşlem güncellemelerini dinle
sdk.subscribeToTrades('BTC/USDT', (trade) => {
  console.log('İşlem:', {
    symbol: trade.symbol,
    price: trade.price,
    quantity: trade.quantity,
    side: trade.side,
    timestamp: trade.timestamp
  });
});

// Pozisyon güncellemelerini dinle
sdk.subscribeToPositions((position) => {
  console.log('Pozisyon:', {
    symbol: position.symbol,
    size: position.size,
    entryPrice: position.entryPrice,
    liquidationPrice: position.liquidationPrice,
    unrealizedPnl: position.unrealizedPnl
  });
});
```

## Hata Yönetimi

```typescript
// Bağlantı hatalarını yakala
sdk.onWebSocketError((error) => {
  console.error('WebSocket Hatası:', error);
  
  // Yeniden bağlanma stratejisi
  setTimeout(() => {
    console.log('Yeniden bağlanılıyor...');
    sdk.connect();
  }, 5000);
});

// Bağlantı durumu değişikliklerini izle
sdk.onWebSocketStateChange((state) => {
  console.log('WebSocket Durumu:', state);
});
```

## Temizleme

```typescript
// Uygulamadan çıkarken bağlantıyı kapat
process.on('SIGINT', () => {
  console.log('WebSocket bağlantısı kapatılıyor...');
  sdk.disconnect();
  process.exit(0);
});
``` 