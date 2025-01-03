use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use utoipa::ToSchema;

use crate::services::webhook::manager::{WebhookManager, WebhookConfig, WebhookEventType};
use crate::types::error::RuneError;

#[derive(Debug, Deserialize, ToSchema)]
pub struct RegisterWebhookRequest {
    #[schema(example = "https://example.com/webhook")]
    pub url: String,
    #[schema(example = "your-secret-key")]
    pub secret: Option<String>,
    #[schema(example = json!(["TransactionConfirmed", "RuneTransfer"]))]
    pub events: Vec<WebhookEventType>,
    #[schema(default = 3)]
    pub max_retries: u32,
    #[schema(default = 1000)]
    pub retry_delay: u64,
}

fn default_max_retries() -> u32 {
    3
}

fn default_retry_delay() -> u64 {
    1000 // 1 second
}

#[derive(Debug, Serialize, ToSchema)]
pub struct WebhookResponse {
    pub success: bool,
    pub message: Option<String>,
}

pub struct WebhookApiContext {
    pub webhook_manager: Arc<WebhookManager>,
}

/// Register a new webhook
#[utoipa::path(
    post,
    path = "/api/v1/webhooks",
    request_body = RegisterWebhookRequest,
    responses(
        (status = 200, description = "Webhook registered successfully", body = WebhookResponse),
        (status = 400, description = "Invalid webhook configuration", body = ErrorResponse),
        (status = 429, description = "Too many requests", body = ErrorResponse),
    ),
    security(
        ("api_key" = [])
    ),
    tag = "webhooks"
)]
pub async fn register_webhook(
    request: web::Json<RegisterWebhookRequest>,
    context: web::Data<WebhookApiContext>,
) -> impl Responder {
    let config = WebhookConfig {
        url: request.url.clone(),
        secret: request.secret.clone(),
        events: request.events.clone(),
        max_retries: request.max_retries,
        retry_delay: request.retry_delay,
    };

    match context.webhook_manager.register_webhook(config).await {
        Ok(_) => HttpResponse::Ok().json(WebhookResponse {
            success: true,
            message: Some("Webhook registered successfully".to_string()),
        }),
        Err(e) => {
            tracing::error!("Failed to register webhook: {}", e);
            HttpResponse::BadRequest().json(WebhookResponse {
                success: false,
                message: Some(e.to_string()),
            })
        }
    }
}

/// Unregister an existing webhook
#[utoipa::path(
    delete,
    path = "/api/v1/webhooks/{url}",
    responses(
        (status = 200, description = "Webhook unregistered successfully", body = WebhookResponse),
        (status = 404, description = "Webhook not found", body = ErrorResponse),
        (status = 429, description = "Too many requests", body = ErrorResponse),
    ),
    params(
        ("url" = String, Path, description = "URL of the webhook to unregister")
    ),
    security(
        ("api_key" = [])
    ),
    tag = "webhooks"
)]
pub async fn unregister_webhook(
    url: web::Path<String>,
    context: web::Data<WebhookApiContext>,
) -> impl Responder {
    match context.webhook_manager.unregister_webhook(&url).await {
        Ok(_) => HttpResponse::Ok().json(WebhookResponse {
            success: true,
            message: Some("Webhook unregistered successfully".to_string()),
        }),
        Err(e) => {
            tracing::error!("Failed to unregister webhook: {}", e);
            match e {
                RuneError::ConfigError(_) => HttpResponse::NotFound().json(WebhookResponse {
                    success: false,
                    message: Some(e.to_string()),
                }),
                _ => HttpResponse::InternalServerError().json(WebhookResponse {
                    success: false,
                    message: Some(e.to_string()),
                }),
            }
        }
    }
} 