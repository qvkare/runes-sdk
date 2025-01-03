use actix_web::http::StatusCode;
use crate::{
    api::webhook::handlers::RegisterWebhookRequest,
    services::webhook::manager::{WebhookConfig, WebhookEventType},
    tests::helpers::{
        create_test_app,
        send_test_request,
        MockWebhookManager,
    },
    types::error::RuneError,
};

#[actix_web::test]
async fn test_register_webhook_success() {
    // Mock webhook manager'ı hazırla
    let mut mock_manager = MockWebhookManager::new();
    mock_manager
        .expect_register_webhook()
        .with(mockall::predicate::function(|config: &WebhookConfig| {
            config.url == "https://test.com/webhook" &&
            config.events.contains(&WebhookEventType::TransactionConfirmed)
        }))
        .times(1)
        .returning(|_| Ok(()));

    // Test uygulamasını oluştur
    let app = create_test_app(None, None, Some(mock_manager)).await;

    // İsteği hazırla
    let request = RegisterWebhookRequest {
        url: "https://test.com/webhook".to_string(),
        secret: Some("test-secret".to_string()),
        events: vec![WebhookEventType::TransactionConfirmed],
        max_retries: 3,
        retry_delay: 1000,
    };

    // İsteği gönder
    let response = send_test_request(
        &app,
        "POST",
        "/api/v1/webhooks",
        Some(request),
    ).await;

    // Sonuçları kontrol et
    assert_eq!(response.status(), StatusCode::OK);
    
    let body: serde_json::Value = test::read_body_json(response).await;
    assert_eq!(body["success"], true);
    assert!(body["message"].as_str().unwrap().contains("registered successfully"));
}

#[actix_web::test]
async fn test_register_webhook_invalid_url() {
    // Mock webhook manager'ı hazırla
    let mut mock_manager = MockWebhookManager::new();
    mock_manager
        .expect_register_webhook()
        .times(1)
        .returning(|_| Err(RuneError::ValidationError("Invalid webhook URL".into())));

    // Test uygulamasını oluştur
    let app = create_test_app(None, None, Some(mock_manager)).await;

    // İsteği hazırla
    let request = RegisterWebhookRequest {
        url: "invalid-url".to_string(),
        secret: None,
        events: vec![WebhookEventType::TransactionConfirmed],
        max_retries: 3,
        retry_delay: 1000,
    };

    // İsteği gönder
    let response = send_test_request(
        &app,
        "POST",
        "/api/v1/webhooks",
        Some(request),
    ).await;

    // Sonuçları kontrol et
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
    
    let body: serde_json::Value = test::read_body_json(response).await;
    assert_eq!(body["success"], false);
    assert!(body["message"].as_str().unwrap().contains("Invalid webhook URL"));
}

#[actix_web::test]
async fn test_unregister_webhook_success() {
    // Mock webhook manager'ı hazırla
    let mut mock_manager = MockWebhookManager::new();
    mock_manager
        .expect_unregister_webhook()
        .with(mockall::predicate::eq("https://test.com/webhook"))
        .times(1)
        .returning(|_| Ok(()));

    // Test uygulamasını oluştur
    let app = create_test_app(None, None, Some(mock_manager)).await;

    // İsteği gönder
    let response = send_test_request(
        &app,
        "DELETE",
        "/api/v1/webhooks/https%3A%2F%2Ftest.com%2Fwebhook",
        Option::<()>::None,
    ).await;

    // Sonuçları kontrol et
    assert_eq!(response.status(), StatusCode::OK);
    
    let body: serde_json::Value = test::read_body_json(response).await;
    assert_eq!(body["success"], true);
    assert!(body["message"].as_str().unwrap().contains("unregistered successfully"));
}

#[actix_web::test]
async fn test_unregister_webhook_not_found() {
    // Mock webhook manager'ı hazırla
    let mut mock_manager = MockWebhookManager::new();
    mock_manager
        .expect_unregister_webhook()
        .times(1)
        .returning(|_| Err(RuneError::NotFound("Webhook not found".into())));

    // Test uygulamasını oluştur
    let app = create_test_app(None, None, Some(mock_manager)).await;

    // İsteği gönder
    let response = send_test_request(
        &app,
        "DELETE",
        "/api/v1/webhooks/not-found",
        Option::<()>::None,
    ).await;

    // Sonuçları kontrol et
    assert_eq!(response.status(), StatusCode::NOT_FOUND);
    
    let body: serde_json::Value = test::read_body_json(response).await;
    assert_eq!(body["success"], false);
    assert!(body["message"].as_str().unwrap().contains("Webhook not found"));
} 