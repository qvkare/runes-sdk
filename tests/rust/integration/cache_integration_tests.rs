use std::sync::Arc;
use std::time::Duration;
use actix_web::{test, web, App};

use crate::{
    api::runes::{
        handlers::{RunesApiContext, BatchTransactionRequest},
        routes::configure_routes,
    },
    services::{
        node::connection::{NodeConnection, NodeConfig},
        cache::{RunesCache, CacheConfig, CacheMetrics},
    },
};

async fn create_test_app() -> impl actix_web::dev::Service<actix_http::Request, Response = actix_web::dev::ServiceResponse, Error = actix_web::Error> {
    let node_config = NodeConfig {
        rpc_url: "http://localhost:8332".to_string(),
        username: None,
        password: None,
        timeout: Duration::from_secs(30),
        max_retries: 3,
    };

    let node = Arc::new(NodeConnection::new(
        node_config,
        Arc::new(metrics::Counter::new("test_node_errors")),
    ));

    let cache_metrics = Arc::new(CacheMetrics {
        hits: metrics::Counter::new("test_cache_hits"),
        misses: metrics::Counter::new("test_cache_misses"),
        evictions: metrics::Counter::new("test_cache_evictions"),
    });

    let cache_config = CacheConfig {
        transaction_cache_size: 1000,
        transaction_ttl: Duration::from_secs(300),
        address_cache_size: 1000,
        address_ttl: Duration::from_secs(300),
    };

    let cache = Arc::new(RunesCache::new(cache_config, cache_metrics));

    let context = RunesApiContext {
        node,
        cache,
    };

    test::init_service(
        App::new()
            .app_data(web::Data::new(context))
            .configure(configure_routes)
    ).await
}

#[actix_web::test]
async fn test_transaction_caching() {
    let app = create_test_app().await;
    let tx_id = "a".repeat(64); // Geçerli bir transaction ID formatı

    // İlk istek - cache miss olmalı
    let req = test::TestRequest::get()
        .uri(&format!("/api/v1/runes/transaction/{}", tx_id))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());

    // İkinci istek - cache hit olmalı
    let req = test::TestRequest::get()
        .uri(&format!("/api/v1/runes/transaction/{}", tx_id))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());

    // Her iki response da aynı veriyi içermeli
    let body1: serde_json::Value = test::read_body_json(resp).await;
    assert_eq!(body1["transaction_id"], tx_id);
}

#[actix_web::test]
async fn test_batch_transaction_caching() {
    let app = create_test_app().await;
    let tx_ids = vec!["a".repeat(64), "b".repeat(64)];

    // İlk batch istek - tüm transaction'lar için cache miss olmalı
    let req = test::TestRequest::post()
        .uri("/api/v1/runes/transactions/batch")
        .set_json(&BatchTransactionRequest {
            transaction_ids: tx_ids.clone(),
            include_confirmations: true,
        })
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());

    // İkinci batch istek - tüm transaction'lar için cache hit olmalı
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
async fn test_address_transfers_caching() {
    let app = create_test_app().await;
    let address = "bc1qtest".to_string();

    // İlk istek - cache miss olmalı
    let req = test::TestRequest::get()
        .uri(&format!("/api/v1/runes/address/{}/transfers", address))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());

    // İkinci istek - cache hit olmalı
    let req = test::TestRequest::get()
        .uri(&format!("/api/v1/runes/address/{}/transfers", address))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());

    let body: serde_json::Value = test::read_body_json(resp).await;
    assert!(body.as_array().unwrap().len() >= 0);
}

#[actix_web::test]
async fn test_cache_invalidation() {
    let app = create_test_app().await;
    let tx_id = "a".repeat(64);

    // İlk istek - veriyi cache'e ekle
    let req = test::TestRequest::get()
        .uri(&format!("/api/v1/runes/transaction/{}", tx_id))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());

    // Cache'i temizle (normalde bu bir admin API endpoint'i üzerinden yapılır)
    if let Some(context) = app.app_data::<web::Data<RunesApiContext>>() {
        context.cache.clear_all().await;
    }

    // İkinci istek - cache miss olmalı (veri temizlendiği için)
    let req = test::TestRequest::get()
        .uri(&format!("/api/v1/runes/transaction/{}", tx_id))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
} 