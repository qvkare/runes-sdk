use std::sync::Arc;
use actix_web::{test, App, web};
use mockall::mock;
use crate::{
    api::{
        runes::handlers::RunesApiContext,
        webhook::handlers::WebhookApiContext,
    },
    services::{
        node::connection::NodeConnection,
        cache::RunesCache,
        webhook::manager::WebhookManager,
    },
};

// Mock NodeConnection
mock! {
    pub NodeConnection {
        pub async fn get_transaction(&self, tx_id: &str) -> Result<RunesTransactionResponse, RuneError>;
        pub async fn get_batch_transactions(&self, tx_ids: &[String]) -> Result<Vec<RunesTransactionResponse>, RuneError>;
        pub async fn get_address_transfers(&self, address: &str) -> Result<Vec<RuneTransfer>, RuneError>;
    }
}

// Mock RunesCache
mock! {
    pub RunesCache {
        pub async fn get_transaction(&self, tx_id: &str) -> Option<Arc<RunesTransactionResponse>>;
        pub async fn set_transaction(&self, tx_id: String, tx: RunesTransactionResponse) -> Result<(), RuneError>;
        pub async fn get_address_transfers(&self, address: &str) -> Option<Arc<Vec<RuneTransfer>>>;
        pub async fn set_address_transfers(&self, address: String, transfers: Vec<RuneTransfer>) -> Result<(), RuneError>;
    }
}

// Mock WebhookManager
mock! {
    pub WebhookManager {
        pub async fn register_webhook(&self, config: WebhookConfig) -> Result<(), RuneError>;
        pub async fn unregister_webhook(&self, url: &str) -> Result<(), RuneError>;
        pub async fn send_event(&self, event: WebhookEvent) -> Result<(), RuneError>;
    }
}

// Test application builder
pub async fn create_test_app(
    node: Option<MockNodeConnection>,
    cache: Option<MockRunesCache>,
    webhook_manager: Option<MockWebhookManager>,
) -> impl actix_web::dev::Service<
    actix_http::Request,
    Response = actix_web::dev::ServiceResponse,
    Error = actix_web::Error,
> {
    let node = Arc::new(node.unwrap_or_else(|| {
        let mut mock = MockNodeConnection::new();
        mock.expect_get_transaction()
            .returning(|_| Ok(RunesTransactionResponse::default()));
        mock.expect_get_batch_transactions()
            .returning(|_| Ok(vec![RunesTransactionResponse::default()]));
        mock.expect_get_address_transfers()
            .returning(|_| Ok(vec![RuneTransfer::default()]));
        mock
    }));

    let cache = Arc::new(cache.unwrap_or_else(|| {
        let mut mock = MockRunesCache::new();
        mock.expect_get_transaction()
            .returning(|_| None);
        mock.expect_set_transaction()
            .returning(|_, _| Ok(()));
        mock.expect_get_address_transfers()
            .returning(|_| None);
        mock.expect_set_address_transfers()
            .returning(|_, _| Ok(()));
        mock
    }));

    let webhook_manager = Arc::new(webhook_manager.unwrap_or_else(|| {
        let mut mock = MockWebhookManager::new();
        mock.expect_register_webhook()
            .returning(|_| Ok(()));
        mock.expect_unregister_webhook()
            .returning(|_| Ok(()));
        mock.expect_send_event()
            .returning(|_| Ok(()));
        mock
    }));

    test::init_service(
        App::new()
            .app_data(web::Data::new(RunesApiContext {
                node: node.clone(),
                cache: cache.clone(),
            }))
            .app_data(web::Data::new(WebhookApiContext {
                webhook_manager: webhook_manager.clone(),
            }))
            .configure(crate::api::runes::routes::configure_routes)
            .configure(crate::api::webhook::routes::configure_routes)
    ).await
}

// Test data generators
pub fn create_test_transaction(tx_id: &str) -> RunesTransactionResponse {
    RunesTransactionResponse {
        transaction_id: tx_id.to_string(),
        block_height: Some(100),
        confirmations: Some(10),
        timestamp: Some(1234567890),
        runes: vec![create_test_rune_transfer()],
    }
}

pub fn create_test_rune_transfer() -> RuneTransfer {
    RuneTransfer {
        rune_id: "TEST123".to_string(),
        amount: 1000,
        from_address: "sender123".to_string(),
        to_address: "receiver456".to_string(),
        transfer_type: TransferType::Transfer,
    }
}

// Test helper functions
pub async fn send_test_request<T: serde::Serialize>(
    app: &impl actix_web::dev::Service<actix_http::Request>,
    method: &str,
    path: &str,
    body: Option<T>,
) -> actix_web::dev::ServiceResponse {
    let mut req = test::TestRequest::with_uri(path)
        .method(method.parse().unwrap());
    
    if let Some(body) = body {
        req = req.set_json(body);
    }

    test::call_service(app, req.to_request()).await
} 