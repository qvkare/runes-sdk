use std::fmt;
use serde::{Serialize, Deserialize};
use actix_web::{HttpResponse, ResponseError};

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub code: String,
    pub message: String,
    pub details: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub request_id: Option<String>,
}

#[derive(Debug)]
pub enum RuneError {
    // Node ile ilgili hatalar
    NodeConnectionError(String),
    NodeResponseError(String),
    NodeSyncError(String),
    
    // API ile ilgili hatalar
    InvalidTransaction(String),
    InvalidAddress(String),
    InvalidRequest(String),
    RateLimitExceeded,
    
    // Cache ile ilgili hatalar
    CacheError(String),
    
    // Webhook ile ilgili hatalar
    WebhookError(String),
    WebhookValidationError(String),
    
    // Genel hatalar
    ConfigError(String),
    DatabaseError(String),
    SerializationError(String),
    InternalError(String),
}

impl fmt::Display for RuneError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            RuneError::NodeConnectionError(msg) => write!(f, "Node connection error: {}", msg),
            RuneError::NodeResponseError(msg) => write!(f, "Node response error: {}", msg),
            RuneError::NodeSyncError(msg) => write!(f, "Node sync error: {}", msg),
            RuneError::InvalidTransaction(msg) => write!(f, "Invalid transaction: {}", msg),
            RuneError::InvalidAddress(msg) => write!(f, "Invalid address: {}", msg),
            RuneError::InvalidRequest(msg) => write!(f, "Invalid request: {}", msg),
            RuneError::RateLimitExceeded => write!(f, "Rate limit exceeded"),
            RuneError::CacheError(msg) => write!(f, "Cache error: {}", msg),
            RuneError::WebhookError(msg) => write!(f, "Webhook error: {}", msg),
            RuneError::WebhookValidationError(msg) => write!(f, "Webhook validation error: {}", msg),
            RuneError::ConfigError(msg) => write!(f, "Configuration error: {}", msg),
            RuneError::DatabaseError(msg) => write!(f, "Database error: {}", msg),
            RuneError::SerializationError(msg) => write!(f, "Serialization error: {}", msg),
            RuneError::InternalError(msg) => write!(f, "Internal error: {}", msg),
        }
    }
}

impl std::error::Error for RuneError {}

impl ResponseError for RuneError {
    fn error_response(&self) -> HttpResponse {
        let error_response = ErrorResponse {
            code: self.error_code(),
            message: self.to_string(),
            details: self.error_details(),
            request_id: None, // Request ID middleware tarafından eklenecek
        };

        match self {
            RuneError::NodeConnectionError(_) => HttpResponse::ServiceUnavailable().json(error_response),
            RuneError::NodeResponseError(_) => HttpResponse::BadGateway().json(error_response),
            RuneError::NodeSyncError(_) => HttpResponse::ServiceUnavailable().json(error_response),
            RuneError::InvalidTransaction(_) => HttpResponse::BadRequest().json(error_response),
            RuneError::InvalidAddress(_) => HttpResponse::BadRequest().json(error_response),
            RuneError::InvalidRequest(_) => HttpResponse::BadRequest().json(error_response),
            RuneError::RateLimitExceeded => HttpResponse::TooManyRequests().json(error_response),
            RuneError::CacheError(_) => HttpResponse::InternalServerError().json(error_response),
            RuneError::WebhookError(_) => HttpResponse::BadRequest().json(error_response),
            RuneError::WebhookValidationError(_) => HttpResponse::BadRequest().json(error_response),
            RuneError::ConfigError(_) => HttpResponse::InternalServerError().json(error_response),
            RuneError::DatabaseError(_) => HttpResponse::InternalServerError().json(error_response),
            RuneError::SerializationError(_) => HttpResponse::InternalServerError().json(error_response),
            RuneError::InternalError(_) => HttpResponse::InternalServerError().json(error_response),
        }
    }
}

impl RuneError {
    fn error_code(&self) -> String {
        match self {
            RuneError::NodeConnectionError(_) => "NODE_CONNECTION_ERROR",
            RuneError::NodeResponseError(_) => "NODE_RESPONSE_ERROR",
            RuneError::NodeSyncError(_) => "NODE_SYNC_ERROR",
            RuneError::InvalidTransaction(_) => "INVALID_TRANSACTION",
            RuneError::InvalidAddress(_) => "INVALID_ADDRESS",
            RuneError::InvalidRequest(_) => "INVALID_REQUEST",
            RuneError::RateLimitExceeded => "RATE_LIMIT_EXCEEDED",
            RuneError::CacheError(_) => "CACHE_ERROR",
            RuneError::WebhookError(_) => "WEBHOOK_ERROR",
            RuneError::WebhookValidationError(_) => "WEBHOOK_VALIDATION_ERROR",
            RuneError::ConfigError(_) => "CONFIG_ERROR",
            RuneError::DatabaseError(_) => "DATABASE_ERROR",
            RuneError::SerializationError(_) => "SERIALIZATION_ERROR",
            RuneError::InternalError(_) => "INTERNAL_ERROR",
        }.to_string()
    }

    fn error_details(&self) -> Option<serde_json::Value> {
        match self {
            RuneError::NodeConnectionError(msg) => Some(json!({
                "reason": msg,
                "suggestion": "Please check node connection settings and try again"
            })),
            RuneError::NodeResponseError(msg) => Some(json!({
                "reason": msg,
                "suggestion": "Please verify node response format"
            })),
            RuneError::InvalidTransaction(msg) => Some(json!({
                "reason": msg,
                "suggestion": "Please check transaction ID format"
            })),
            RuneError::InvalidAddress(msg) => Some(json!({
                "reason": msg,
                "suggestion": "Please check address format"
            })),
            RuneError::RateLimitExceeded => Some(json!({
                "reason": "Too many requests",
                "suggestion": "Please wait before making more requests",
                "retry_after": 60 // seconds
            })),
            _ => None,
        }
    }
}

// Alias for Result type
pub type RuneResult<T> = Result<T, RuneError>; 