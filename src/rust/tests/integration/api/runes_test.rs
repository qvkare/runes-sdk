use actix_web::http::StatusCode;
use crate::{
    api::runes::handlers::BatchTransactionRequest,
    tests::helpers::{
        create_test_app,
        create_test_transaction,
        send_test_request,
        MockNodeConnection,
        MockRunesCache,
    },
    types::error::RuneError,
};

#[actix_web::test]
async fn test_get_transaction_success() {
    // Mock node'u hazırla
    let mut mock_node = MockNodeConnection::new();
    mock_node
        .expect_get_transaction()
        .with(mockall::predicate::eq("test_tx"))
        .times(1)
        .returning(|tx_id| Ok(create_test_transaction(tx_id)));

    // Create test application
    let app = create_test_app(Some(mock_node), None, None).await;

    // İsteği gönder
    let response = send_test_request(
        &app,
        "GET",
        "/api/v1/runes/transaction/test_tx",
        Option::<()>::None,
    ).await;

    // Sonuçları kontrol et
    assert_eq!(response.status(), StatusCode::OK);
    
    let body: serde_json::Value = test::read_body_json(response).await;
    assert_eq!(body["transaction_id"], "test_tx");
    assert_eq!(body["block_height"], 100);
    assert_eq!(body["confirmations"], 10);
}

#[actix_web::test]
async fn test_get_transaction_from_cache() {
    // Mock cache'i hazırla
    let mut mock_cache = MockRunesCache::new();
    mock_cache
        .expect_get_transaction()
        .with(mockall::predicate::eq("test_tx"))
        .times(1)
        .returning(|tx_id| Some(Arc::new(create_test_transaction(tx_id))));

    // Create test application
    let app = create_test_app(None, Some(mock_cache), None).await;

    // İsteği gönder
    let response = send_test_request(
        &app,
        "GET",
        "/api/v1/runes/transaction/test_tx",
        Option::<()>::None,
    ).await;

    // Sonuçları kontrol et
    assert_eq!(response.status(), StatusCode::OK);
    
    let body: serde_json::Value = test::read_body_json(response).await;
    assert_eq!(body["transaction_id"], "test_tx");
}

#[actix_web::test]
async fn test_get_transaction_not_found() {
    // Mock node'u hazırla
    let mut mock_node = MockNodeConnection::new();
    mock_node
        .expect_get_transaction()
        .with(mockall::predicate::eq("not_found_tx"))
        .times(1)
        .returning(|_| Err(RuneError::NotFound("Transaction not found".into())));

    // Create test application
    let app = create_test_app(Some(mock_node), None, None).await;

    // İsteği gönder
    let response = send_test_request(
        &app,
        "GET",
        "/api/v1/runes/transaction/not_found_tx",
        Option::<()>::None,
    ).await;

    // Sonuçları kontrol et
    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}

#[actix_web::test]
async fn test_get_batch_transactions() {
    // Mock node'u hazırla
    let mut mock_node = MockNodeConnection::new();
    mock_node
        .expect_get_batch_transactions()
        .times(1)
        .returning(|tx_ids| {
            Ok(tx_ids.iter()
                .map(|id| create_test_transaction(id))
                .collect())
        });

    // Create test application
    let app = create_test_app(Some(mock_node), None, None).await;

    // İsteği hazırla
    let request = BatchTransactionRequest {
        transaction_ids: vec!["tx1".to_string(), "tx2".to_string()],
        include_confirmations: true,
    };

    // İsteği gönder
    let response = send_test_request(
        &app,
        "POST",
        "/api/v1/runes/transactions/batch",
        Some(request),
    ).await;

    // Sonuçları kontrol et
    assert_eq!(response.status(), StatusCode::OK);
    
    let body: serde_json::Value = test::read_body_json(response).await;
    assert_eq!(body["transactions"].as_array().unwrap().len(), 2);
    assert_eq!(body["failed_transactions"].as_array().unwrap().len(), 0);
}

#[actix_web::test]
async fn test_get_address_transfers() {
    // Mock node'u hazırla
    let mut mock_node = MockNodeConnection::new();
    mock_node
        .expect_get_address_transfers()
        .with(mockall::predicate::eq("test_address"))
        .times(1)
        .returning(|_| Ok(vec![create_test_rune_transfer()]));

    // Create test application
    let app = create_test_app(Some(mock_node), None, None).await;

    // İsteği gönder
    let response = send_test_request(
        &app,
        "GET",
        "/api/v1/runes/address/test_address/transfers",
        Option::<()>::None,
    ).await;

    // Sonuçları kontrol et
    assert_eq!(response.status(), StatusCode::OK);
    
    let body: serde_json::Value = test::read_body_json(response).await;
    assert_eq!(body.as_array().unwrap().len(), 1);
    assert_eq!(body[0]["rune_id"], "TEST123");
} 