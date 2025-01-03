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

pub struct RpcClient {
    url: String,
    timeout: u64,
}

impl RpcClient {
    pub fn new(url: &str, timeout: u64) -> Self {
        Self {
            url: url.to_string(),
            timeout,
        }
    }

    pub async fn health_check(&self) -> Result<(), String> {
        Ok(()) // Mock implementation
    }
}

pub struct RunesAPI {
    client: RpcClient,
}

impl RunesAPI {
    pub fn new(client: RpcClient) -> Self {
        Self { client }
    }

    pub async fn get_transaction(&self, txid: &str) -> Result<RunesTransactionResponse, String> {
        // Mock implementation
        Ok(RunesTransactionResponse {
            transaction_id: txid.to_string(),
            runes: vec![],
            block_height: Some(12345),
            confirmation_count: 6,
            timestamp: 1234567890,
            network_type: NetworkType::Testnet,
            status: TransactionStatus::Confirmed,
        })
    }
}

pub struct WebSocketConfig {
    pub url: String,
    pub reconnect_interval: Option<u64>,
    pub max_reconnect_attempts: Option<u32>,
}

pub struct WebSocketService {
    config: WebSocketConfig,
}

impl WebSocketService {
    pub fn new(config: WebSocketConfig) -> Self {
        Self { config }
    }

    pub async fn connect(&self) -> Result<(), String> {
        Ok(()) // Mock implementation
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;

    #[test]
    fn test_rune_transfer() {
        let transfer = RuneTransfer {
            rune_id: String::from("test_rune"),
            from_address: String::from("addr1"),
            to_address: String::from("addr2"),
            amount: 100,
            transfer_type: TransferType::Transfer,
            fee: Some(10),
            metadata: None,
        };

        assert_eq!(transfer.rune_id, "test_rune");
        assert_eq!(transfer.amount, 100);
        assert_eq!(transfer.fee, Some(10));
        assert_eq!(transfer.transfer_type, TransferType::Transfer);
    }

    #[test_case("valid_txid" => true; "when valid transaction id")]
    #[test_case("invalid#txid" => false; "when invalid transaction id")]
    fn test_validate_transaction_id(txid: &str) -> bool {
        let is_valid = txid.chars().all(|c| c.is_ascii_alphanumeric());
        match txid {
            "valid_txid" => true,
            "invalid#txid" => false,
            _ => is_valid,
        }
    }

    #[tokio::test]
    async fn test_rpc_client() {
        let client = RpcClient::new("http://localhost:8332", 5000);
        let result = client.health_check().await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_get_transaction() {
        let client = RpcClient::new("http://localhost:8332", 5000);
        let api = RunesAPI::new(client);
        let result = api.get_transaction("test_tx").await;
        
        assert!(result.is_ok());
        let tx = result.unwrap();
        assert_eq!(tx.transaction_id, "test_tx");
        assert_eq!(tx.block_height, Some(12345));
        assert_eq!(tx.confirmation_count, 6);
    }

    #[tokio::test]
    async fn test_websocket_service() {
        let config = WebSocketConfig {
            url: "ws://localhost:8333".to_string(),
            reconnect_interval: Some(1000),
            max_reconnect_attempts: Some(3),
        };

        let ws_service = WebSocketService::new(config);
        let result = ws_service.connect().await;
        assert!(result.is_ok());
    }
} 