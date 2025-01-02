import { RunesSDK } from '../src';

async function main() {
  const sdk = new RunesSDK({
    host: 'your-host',
    username: 'your-username',
    password: 'your-password',
    websocket: {
      port: 8080,
      host: 'localhost',
      maxConnections: 1000,
      rateLimit: {
        maxRequestsPerMinute: 1200,
        maxConnectionsPerIP: 50
      },
      security: {
        enableIPWhitelist: true,
        whitelistedIPs: ['127.0.0.1', '192.168.1.1'],
        requireAuthentication: true
      }
    }
  });

  const wsService = sdk.getWebSocketService();
  if (!wsService) {
    console.error('WebSocket service not initialized');
    return;
  }

  // Market data update simulation
  function simulateMarketData() {
    const symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'];
    
    setInterval(() => {
      symbols.forEach(symbol => {
        const mockData = {
          symbol,
          price: Math.random() * 50000,
          volume: Math.random() * 1000,
          timestamp: Date.now()
        };

        wsService.updateMarketData(`orderbook:${symbol}`, {
          type: 'orderbook',
          data: mockData
        });
      });
    }, 1000);
  }

  // Listen for incoming messages
  wsService.on('message', async ({ client, message }) => {
    console.log(`Received message from client ${client.id}:`, message);

    // Handle different message types
    switch (message.type) {
      case 'subscribe':
        // Example subscription validation
        if (message.data.symbols && Array.isArray(message.data.symbols)) {
          await wsService.handleSubscription(client, message.data);
        }
        break;

      case 'unsubscribe':
        // Handle unsubscribe
        break;

      case 'ping':
        wsService.sendTo(client.id, 'pong', { timestamp: Date.now() });
        break;

      default:
        wsService.sendTo(client.id, 'error', { message: 'Unknown message type' });
    }
  });

  // Start market data simulation
  simulateMarketData();

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    sdk.shutdown();
    process.exit(0);
  });
}

main().catch(console.error); 