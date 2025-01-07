import { RunesSDK } from '../sdk';
import { WebSocketClientService } from '../services/websocket/websocket.client.service';

jest.mock('../services/websocket/websocket.client.service');

describe('RunesSDK', () => {
  let sdk: RunesSDK;
  const mockConfig = {
    rpcUrl: 'http://test-host:8080',
    wsUrl: 'ws://localhost:8080'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize without WebSocket when wsUrl is not provided', () => {
    const configWithoutWs = {
      rpcUrl: 'http://test-host:8080'
    };

    sdk = new RunesSDK(configWithoutWs);
    expect(sdk['webSocketService']).toBeUndefined();
  });

  it('should initialize WebSocket service when wsUrl is provided', () => {
    sdk = new RunesSDK(mockConfig);
    expect(WebSocketClientService).toHaveBeenCalledWith({
      url: mockConfig.wsUrl
    });
    expect(sdk['webSocketService']).toBeDefined();
  });

  it('should connect WebSocket service', () => {
    sdk = new RunesSDK(mockConfig);
    const mockConnect = jest.fn();
    (sdk['webSocketService'] as any).connect = mockConnect;

    sdk.connect();
    expect(mockConnect).toHaveBeenCalled();
  });

  it('should disconnect WebSocket service', () => {
    sdk = new RunesSDK(mockConfig);
    const mockClose = jest.fn();
    (sdk['webSocketService'] as any).close = mockClose;

    sdk.disconnect();
    expect(mockClose).toHaveBeenCalled();
  });
});
