use std::sync::Arc;
use actix_web::{test, web, App};
use serde_json::json;

use crate::{
    api::webhook::{
        handlers::{WebhookApiContext, RegisterWebhookRequest},
        routes::configure_routes,
    },
    services::webhook::manager::{WebhookManager, WebhookEventType},
};

async fn create_test_app() -> impl actix_web::dev::Service<actix_http::Request, Response = actix_web::dev::ServiceResponse, Error = actix_web::Error> {
    let webhook_manager = WebhookManager::new(
        Arc::new(metrics::Counter::new("test_webhook_errors"))
    );

    let context = WebhookApiContext {
        webhook_manager: Arc::new(webhook_manager),
    };

    test::init_service(
        App::new()
            .app_data(web::Data::new(context))
            .configure(configure_routes)
    ).await
}

#[actix_web::test]
async fn test_register_webhook() {
    let app = create_test_app().await;
    let request = RegisterWebhookRequest {
        url: "https://example.com/webhook".to_string(),
        secret: Some("test-secret".to_string()),
        events: vec![WebhookEventType::TransactionConfirmed],
        max_retries: 3,
        retry_delay: 1000,
    };

    let req = test::TestRequest::post()
        .uri("/api/v1/webhooks")
        .set_json(&request)
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());

    let body: serde_json::Value = test::read_body_json(resp).await;
    assert!(body["success"].as_bool().unwrap());
}

#[actix_web::test]
async fn test_register_webhook_invalid_url() {
    let app = create_test_app().await;
    let request = RegisterWebhookRequest {
        url: "invalid-url".to_string(),
        secret: None,
        events: vec![WebhookEventType::TransactionConfirmed],
        max_retries: 3,
        retry_delay: 1000,
    };

    let req = test::TestRequest::post()
        .uri("/api/v1/webhooks")
        .set_json(&request)
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), 400);

    let body: serde_json::Value = test::read_body_json(resp).await;
    assert!(!body["success"].as_bool().unwrap());
}

#[actix_web::test]
async fn test_unregister_webhook() {
    let app = create_test_app().await;
    
    // First register a webhook
    let register_request = RegisterWebhookRequest {
        url: "https://example.com/webhook".to_string(),
        secret: None,
        events: vec![WebhookEventType::TransactionConfirmed],
        max_retries: 3,
        retry_delay: 1000,
    };

    let req = test::TestRequest::post()
        .uri("/api/v1/webhooks")
        .set_json(&register_request)
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());

    // Then unregister it
    let encoded_url = urlencoding::encode("https://example.com/webhook");
    let req = test::TestRequest::delete()
        .uri(&format!("/api/v1/webhooks/{}", encoded_url))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());

    let body: serde_json::Value = test::read_body_json(resp).await;
    assert!(body["success"].as_bool().unwrap());
}

#[actix_web::test]
async fn test_unregister_nonexistent_webhook() {
    let app = create_test_app().await;
    
    let encoded_url = urlencoding::encode("https://nonexistent.com/webhook");
    let req = test::TestRequest::delete()
        .uri(&format!("/api/v1/webhooks/{}", encoded_url))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), 404);

    let body: serde_json::Value = test::read_body_json(resp).await;
    assert!(!body["success"].as_bool().unwrap());
} 