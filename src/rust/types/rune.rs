use serde::{Deserialize, Serialize};
use std::collections::HashMap;

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
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Serialize, Deserialize)]
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