use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct RunesTransactionResponse {
    pub transaction_id: String,
    pub runes: Vec<RuneTransfer>,
    pub block_height: Option<u32>,
    pub confirmation_count: u32,
    pub timestamp: u64,
    pub network_type: NetworkType,
    pub status: TransactionStatus,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RuneTransfer {
    pub rune_id: String,
    pub from_address: String,
    pub to_address: String,
    pub amount: u64,
    pub transfer_type: TransferType,
    pub fee: Option<u64>,
    pub metadata: Option<HashMap<String, Value>>,
}

#[derive(Debug, Serialize, Deserialize, PartialEq)]
pub enum TransferType {
    Mint,
    Transfer,
    Burn,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum TransactionStatus {
    Pending,
    Confirmed,
    Failed,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum NetworkType {
    Mainnet,
    Testnet,
}

#[derive(Debug)]
pub struct RpcClient {
    url: String,
    timeout: u64,
}

impl RpcClient {
    pub fn new(url: String, timeout: u64) -> Self {
        Self { url, timeout }
    }

    pub async fn call<T: serde::de::DeserializeOwned>(&self, method: &str, params: Vec<String>) -> Result<T, Error> {
        let client = reqwest::Client::new();
        
        let request_body = serde_json::json!({
            "jsonrpc": "2.0",
            "method": method,
            "params": params,
            "id": 1
        });

        let response = client
            .post(&self.url)
            .timeout(std::time::Duration::from_secs(self.timeout))
            .json(&request_body)
            .send()
            .await
            .map_err(|e| Error::NetworkError(e.to_string()))?;

        if !response.status().is_success() {
            return Err(Error::NetworkError(format!(
                "HTTP error: {}",
                response.status()
            )));
        }

        let response_body: serde_json::Value = response
            .json()
            .await
            .map_err(|e| Error::ParseError(e.to_string()))?;

        if let Some(error) = response_body.get("error") {
            return Err(Error::InvalidTransaction(error.to_string()));
        }

        let result = response_body
            .get("result")
            .ok_or_else(|| Error::ParseError("Missing 'result' field".to_string()))?;

        serde_json::from_value(result.clone())
            .map_err(|e| Error::ParseError(e.to_string()))
    }

    pub async fn health_check(&self) -> Result<(), Error> {
        let params = vec![];
        self.call::<serde_json::Value>("getblockchaininfo", params).await?;
        Ok(())
    }
}

#[derive(Debug)]
#[allow(dead_code)]
pub struct RunesAPI {
    client: RpcClient,
}

impl RunesAPI {
    pub fn new(client: RpcClient) -> Self {
        Self { client }
    }

    pub async fn get_transaction(&self, txid: &str) -> Result<Transaction, Error> {
        let params = vec![txid.to_string()];
        self.client.call("gettransaction", params).await
    }
}

#[derive(Debug)]
pub struct WebSocketConfig {
    pub url: String,
    pub reconnect_interval: Option<u64>,
    pub max_reconnect_attempts: Option<u32>,
}

#[derive(Debug)]
pub struct WebSocketService {
    config: WebSocketConfig,
}

impl WebSocketService {
    pub fn new(config: WebSocketConfig) -> Self {
        Self { config }
    }

    pub async fn connect(&self) -> Result<(), Error> {
        // WebSocket bağlantı implementasyonu için config kullanılacak
        let _ws_url = &self.config.url;
        let _reconnect_interval = self.config.reconnect_interval;
        let _max_attempts = self.config.max_reconnect_attempts;
        todo!("Implement WebSocket connection using config")
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Transaction {
    pub txid: String,
    pub block_height: Option<u64>,
    pub confirmations: u32,
    pub timestamp: u64,
    pub transaction_type: TransactionType,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum TransactionType {
    Mint,
    Transfer,
    Burn,
}

#[derive(Debug)]
pub enum Error {
    InvalidTransaction(String),
    NetworkError(String),
    RateLimitExceeded,
    DatabaseError(String),
    NodeConnectionError(String),
    ParseError(String),
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Error::InvalidTransaction(msg) => write!(f, "Invalid transaction: {}", msg),
            Error::NetworkError(msg) => write!(f, "Network error: {}", msg),
            Error::RateLimitExceeded => write!(f, "Rate limit exceeded"),
            Error::DatabaseError(msg) => write!(f, "Database error: {}", msg),
            Error::NodeConnectionError(msg) => write!(f, "Node connection error: {}", msg),
            Error::ParseError(msg) => write!(f, "Parse error: {}", msg),
        }
    }
}

impl std::error::Error for Error {}

#[cfg(test)]
mod tests {
    use super::*;
    use wiremock::{Mock, MockServer, ResponseTemplate};
    use wiremock::matchers::{method, path};

    #[tokio::test]
    async fn test_rpc_client_health_check() {
        let mock_server = MockServer::start().await;

        Mock::given(method("POST"))
            .and(path("/"))
            .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!({
                "jsonrpc": "2.0",
                "result": {
                    "chain": "test",
                    "blocks": 100,
                    "headers": 100
                },
                "id": 1
            })))
            .mount(&mock_server)
            .await;

        let client = RpcClient::new(mock_server.uri(), 5000);
        let result = client.health_check().await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_runes_api_get_transaction() {
        let mock_server = MockServer::start().await;

        Mock::given(method("POST"))
            .and(path("/"))
            .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!({
                "jsonrpc": "2.0",
                "result": {
                    "txid": "test_tx",
                    "block_height": 12345,
                    "confirmations": 6,
                    "timestamp": 1234567890,
                    "transaction_type": "Transfer"
                },
                "id": 1
            })))
            .mount(&mock_server)
            .await;

        let client = RpcClient::new(mock_server.uri(), 5000);
        let api = RunesAPI::new(client);
        let tx = api.get_transaction("test_tx").await.unwrap();
        
        assert_eq!(tx.txid, "test_tx");
        assert_eq!(tx.block_height, Some(12345));
        assert_eq!(tx.confirmations, 6);
        assert_eq!(tx.timestamp, 1234567890);
        assert!(matches!(tx.transaction_type, TransactionType::Transfer));
    }
} 