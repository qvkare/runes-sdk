use std::sync::Arc;
use std::time::Duration;
use tokio::time;
use crate::services::node::{
    connection::{NodeConnection, NodeConfig, MetricsCollector},
    sync::{SyncService, SyncStatus},
};
use metrics::{Counter, Gauge, Histogram};

#[tokio::test]
async fn test_sync_service_initialization() {
    let node = create_test_node();
    let sync_service = SyncService::new(
        Arc::new(node),
        Duration::from_millis(100),
    );

    let status = sync_service.get_sync_status().await.unwrap();
    assert!(!status.is_syncing);
    assert_eq!(status.current_height, 0);
    assert_eq!(status.target_height, 0);
    assert_eq!(status.progress, 0.0);
    assert!(status.estimated_time_remaining.is_none());
}

#[tokio::test]
async fn test_start_sync() {
    let node = create_test_node();
    let sync_service = SyncService::new(
        Arc::new(node),
        Duration::from_millis(100),
    );

    let result = sync_service.start_sync().await;
    assert!(result.is_ok());

    let status = sync_service.get_sync_status().await.unwrap();
    assert!(status.is_syncing);
    assert!(status.target_height > 0);
}

#[tokio::test]
async fn test_stop_sync() {
    let node = create_test_node();
    let sync_service = SyncService::new(
        Arc::new(node),
        Duration::from_millis(100),
    );

    // Start sync
    sync_service.start_sync().await.unwrap();
    
    // Wait a bit
    time::sleep(Duration::from_millis(200)).await;
    
    // Stop sync
    let result = sync_service.stop_sync().await;
    assert!(result.is_ok());

    let status = sync_service.get_sync_status().await.unwrap();
    assert!(!status.is_syncing);
}

#[tokio::test]
async fn test_sync_progress() {
    let node = create_test_node();
    let sync_service = SyncService::new(
        Arc::new(node),
        Duration::from_millis(100),
    );

    sync_service.start_sync().await.unwrap();
    
    // Wait for some progress
    time::sleep(Duration::from_millis(500)).await;
    
    let status = sync_service.get_sync_status().await.unwrap();
    assert!(status.progress > 0.0);
    assert!(status.progress <= 1.0);
    assert!(status.estimated_time_remaining.is_some());
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