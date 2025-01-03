use actix_web::{test, web, App};
use std::sync::Arc;
use crate::api::runes::{
    handlers::{RunesApiContext, BatchTransactionRequest},
    routes::configure_routes,
};
use crate::services::node::connection::{NodeConnection, NodeConfig, MetricsCollector};
use metrics::{Counter, Gauge, Histogram};
use std::time::Duration;

async fn create_test_app() -> impl actix_web::dev::Service<actix_http::Request, Response = actix_web::dev::ServiceResponse, Error = actix_web::Error> {
    let node = create_test_node();
    let context = RunesApiContext {
        node: Arc::new(node),
    };

    test::init_service(
        App::new()
            .app_data(web::Data::new(context))
            .configure(configure_routes)
    ).await
}

fn create_test_node() -> NodeConnection {
    let config = NodeConfig {
        rpc_url: "http://localhost:8332".to_string(),
        username: None,
        password: None,
        timeout: Duration::from_secs(30),
        max_retries: 3,
    };

    let metrics = Arc::new(MetricsCollector {
        transaction_counter: Counter::new("test_tx_counter"),
        error_counter: Counter::new("test_error_counter"),
        response_time: Histogram::new("test_response_time"),
        active_connections: Gauge::new("test_active_connections"),
    });

    NodeConnection::new(config, metrics)
}

#[actix_web::test]
async fn test_get_transaction() {
    let app = create_test_app().await;
    let tx_id = "a".repeat(64); // Valid transaction ID format

    let req = test::TestRequest::get()
        .uri(&format!("/api/v1/runes/transaction/{}", tx_id))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());

    let body: serde_json::Value = test::read_body_json(resp).await;
    assert_eq!(body["transaction_id"], tx_id);
    assert!(body["runes"].as_array().unwrap().len() > 0);
}

#[actix_web::test]
async fn test_get_transaction_invalid_id() {
    let app = create_test_app().await;
    let tx_id = "invalid"; // Invalid transaction ID

    let req = test::TestRequest::get()
        .uri(&format!("/api/v1/runes/transaction/{}", tx_id))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), 400);
}

#[actix_web::test]
async fn test_batch_transactions() {
    let app = create_test_app().await;
    let tx_ids = vec!["a".repeat(64), "b".repeat(64)];

    let req = test::TestRequest::post()
        .uri("/api/v1/runes/transactions/batch")
        .set_json(&BatchTransactionRequest {
            transaction_ids: tx_ids.clone(),
            include_confirmations: true,
        })
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());

    let body: serde_json::Value = test::read_body_json(resp).await;
    let transactions = body["transactions"].as_array().unwrap();
    assert_eq!(transactions.len(), 2);
    assert!(body["failed_transactions"].as_array().unwrap().is_empty());
}

#[actix_web::test]
async fn test_batch_transactions_with_invalid() {
    let app = create_test_app().await;
    let tx_ids = vec!["a".repeat(64), "invalid".to_string()];

    let req = test::TestRequest::post()
        .uri("/api/v1/runes/transactions/batch")
        .set_json(&BatchTransactionRequest {
            transaction_ids: tx_ids,
            include_confirmations: true,
        })
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());

    let body: serde_json::Value = test::read_body_json(resp).await;
    let transactions = body["transactions"].as_array().unwrap();
    let failed = body["failed_transactions"].as_array().unwrap();
    assert_eq!(transactions.len(), 1);
    assert_eq!(failed.len(), 1);
} 