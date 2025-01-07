use std::sync::Arc;
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use reqwest::Client;
use crate::types::error::RuneError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebhookConfig {
    pub url: String,
    pub secret: Option<String>,
    pub events: Vec<WebhookEventType>,
    pub max_retries: u32,
    pub retry_delay: u64, // milliseconds
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum WebhookEventType {
    TransactionConfirmed,
    TransactionFailed,
    RuneTransfer,
    BlockSynced,
}

#[derive(Debug, Serialize)]
pub struct WebhookEvent {
    pub event_type: WebhookEventType,
    pub timestamp: u64,
    pub payload: serde_json::Value,
}

pub struct WebhookManager {
    config: Arc<RwLock<Vec<WebhookConfig>>>,
    client: Client,
    metrics: Arc<metrics::Counter>,
}

impl WebhookManager {
    pub fn new(metrics: Arc<metrics::Counter>) -> Self {
        Self {
            config: Arc::new(RwLock::new(Vec::new())),
            client: Client::new(),
            metrics,
        }
    }

    pub async fn register_webhook(&self, config: WebhookConfig) -> Result<(), RuneError> {
        // URL formatını kontrol et
        reqwest::Url::parse(&config.url)
            .map_err(|e| RuneError::ConfigError(format!("Invalid webhook URL: {}", e)))?;

        let mut configs = self.config.write().await;
        configs.push(config);
        Ok(())
    }

    pub async fn unregister_webhook(&self, url: &str) -> Result<(), RuneError> {
        let mut configs = self.config.write().await;
        if let Some(pos) = configs.iter().position(|c| c.url == url) {
            configs.remove(pos);
            Ok(())
        } else {
            Err(RuneError::ConfigError("Webhook not found".to_string()))
        }
    }

    pub async fn send_event(&self, event: WebhookEvent) -> Result<(), RuneError> {
        let configs = self.config.read().await;
        let mut tasks = Vec::new();

        for config in configs.iter() {
            if config.events.contains(&event.event_type) {
                let task = self.send_to_endpoint(config.clone(), event.clone());
                tasks.push(task);
            }
        }

        for result in futures::future::join_all(tasks).await {
            if let Err(e) = result {
                tracing::error!("Webhook delivery failed: {}", e);
                self.metrics.increment(1);
            }
        }

        Ok(())
    }

    async fn send_to_endpoint(&self, config: WebhookConfig, event: WebhookEvent) -> Result<(), RuneError> {
        let mut last_error = None;

        for attempt in 0..config.max_retries {
            if attempt > 0 {
                tokio::time::sleep(tokio::time::Duration::from_millis(
                    config.retry_delay * 2_u64.pow(attempt - 1)
                )).await;
            }

            let mut request = self.client
                .post(&config.url)
                .json(&event);

            // Eğer secret varsa, HMAC imzası ekle
            if let Some(secret) = &config.secret {
                let signature = self.generate_signature(secret, &event);
                request = request.header("X-Webhook-Signature", signature);
            }

            match request.send().await {
                Ok(response) if response.status().is_success() => {
                    return Ok(());
                }
                Ok(response) => {
                    last_error = Some(RuneError::WebhookError(
                        format!("Webhook request failed with status: {}", response.status())
                    ));
                }
                Err(e) => {
                    last_error = Some(RuneError::WebhookError(
                        format!("Webhook request failed: {}", e)
                    ));
                }
            }
        }

        Err(last_error.unwrap_or_else(|| {
            RuneError::WebhookError("Max retries exceeded".to_string())
        }))
    }

    fn generate_signature(&self, secret: &str, event: &WebhookEvent) -> String {
        use hmac::{Hmac, Mac};
        use sha2::Sha256;

        let payload = serde_json::to_string(event).unwrap_or_default();
        let mut mac = Hmac::<Sha256>::new_from_slice(secret.as_bytes())
            .expect("HMAC can take key of any size");
        
        mac.update(payload.as_bytes());
        let result = mac.finalize();
        hex::encode(result.into_bytes())
    }
} 