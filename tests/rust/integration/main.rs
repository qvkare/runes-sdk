use runes_sdk_rust::*;
use wiremock::{Mock, MockServer, ResponseTemplate};
use wiremock::matchers::{method, path};

#[tokio::test]
async fn test_runes_api_integration() {
    // Start mock server
    let mock_server = MockServer::start().await;

    // Mock transaction response
    Mock::given(method("POST"))
        .and(path("/"))
        .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!({
            "result": {
                "transaction_id": "test_tx",
                "runes": [{
                    "rune_id": "test_rune",
                    "from_address": "addr1",
                    "to_address": "addr2",
                    "amount": 100,
                    "transfer_type": "Transfer",
                    "fee": 10
                }],
                "block_height": 12345,
                "confirmation_count": 6,
                "timestamp": 1234567890,
                "network_type": "Testnet",
                "status": "Confirmed"
            }
        })))
        .mount(&mock_server)
        .await;

    // Create client with mock server URL
    let client = RpcClient::new(&mock_server.uri(), 5000);
    let api = RunesAPI::new(client);

    // Test get transaction
    let tx = api.get_transaction("test_tx").await.unwrap();
    assert_eq!(tx.transaction_id, "test_tx");
    assert_eq!(tx.block_height, Some(12345));
    assert_eq!(tx.confirmation_count, 6);
}

#[tokio::test]
async fn test_websocket_integration() {
    let ws_server = MockServer::start().await;
    
    // Create WebSocket client
    let config = WebSocketConfig {
        url: format!("ws://{}", ws_server.address()),
        reconnect_interval: Some(1000),
        max_reconnect_attempts: Some(3),
    };

    let ws_client = WebSocketService::new(config);
    let result = ws_client.connect().await;
    assert!(result.is_ok());
} 