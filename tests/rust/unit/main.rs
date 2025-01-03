use runes_sdk_rust::*;

#[cfg(test)]
mod tests {
    use super::*;
    use mockall::predicate::*;
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
    }

    #[test_case("valid_txid" => true; "when valid transaction id")]
    #[test_case("invalid#txid" => false; "when invalid transaction id")]
    fn test_validate_transaction_id(txid: &str) -> bool {
        // Transaction ID validation logic would go here
        txid.chars().all(|c| c.is_ascii_alphanumeric())
    }

    #[tokio::test]
    async fn test_rpc_client() {
        let client = RpcClient::new("http://localhost:8332", 5000);
        let result = client.health_check().await;
        assert!(result.is_ok());
    }
} 