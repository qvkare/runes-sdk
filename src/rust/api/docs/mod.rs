use utoipa::OpenApi;
use crate::types::{
    error::ErrorResponse,
    rune::{RunesTransactionResponse, RuneTransfer},
};

#[derive(OpenApi)]
#[openapi(
    paths(
        crate::api::runes::handlers::get_transaction,
        crate::api::runes::handlers::get_batch_transactions,
        crate::api::runes::handlers::get_address_transfers,
        crate::api::webhook::handlers::register_webhook,
        crate::api::webhook::handlers::unregister_webhook,
    ),
    components(
        schemas(
            RunesTransactionResponse,
            RuneTransfer,
            ErrorResponse,
            crate::api::runes::handlers::BatchTransactionRequest,
            crate::api::webhook::handlers::RegisterWebhookRequest,
            crate::api::webhook::handlers::WebhookResponse,
        )
    ),
    tags(
        (name = "transactions", description = "Rune transaction operations"),
        (name = "webhooks", description = "Webhook management operations"),
    ),
    info(
        title = "Runes SDK API",
        version = env!("CARGO_PKG_VERSION"),
        description = "A secure and scalable SDK for Runes",
        license(
            name = "MIT",
            url = "https://opensource.org/licenses/MIT"
        ),
        contact(
            name = "Runes SDK Team",
            url = "https://github.com/yourusername/runes-sdk",
            email = "support@runesdk.com"
        )
    ),
    servers(
        (url = "http://localhost:8080", description = "Local development server"),
        (url = "https://api.runesdk.com", description = "Production server")
    ),
    external_docs(
        url = "https://docs.runesdk.com",
        description = "Find more information here"
    ),
    security(
        ("api_key" = [])
    )
)]
pub struct ApiDoc;

// API Key güvenlik şeması
pub struct SecurityAddon;

impl utoipa::Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "api_key",
                utoipa::openapi::security::SecurityScheme::ApiKey(
                    utoipa::openapi::security::ApiKey::Header(
                        utoipa::openapi::security::ApiKeyValue::new("X-API-Key")
                    )
                )
            );
        }
    }
}

// Header definitions for rate limit information
pub struct RateLimitHeaders;

impl utoipa::Modify for RateLimitHeaders {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        // Tüm path'lere rate limit header'larını ekle
        for path in openapi.paths.iter_mut() {
            for operation in path.1.operations.iter_mut() {
                operation.1.responses.default = Some(
                    utoipa::openapi::Response::new("Rate limit information")
                        .add_header(
                            "X-RateLimit-Limit",
                            utoipa::openapi::Header::new()
                                .description("The number of allowed requests in the current period")
                                .schema(Some(utoipa::openapi::Schema::Integer(
                                    utoipa::openapi::IntegerType::new()
                                )))
                        )
                        .add_header(
                            "X-RateLimit-Remaining",
                            utoipa::openapi::Header::new()
                                .description("The number of remaining requests in the current period")
                                .schema(Some(utoipa::openapi::Schema::Integer(
                                    utoipa::openapi::IntegerType::new()
                                )))
                        )
                        .add_header(
                            "X-RateLimit-Reset",
                            utoipa::openapi::Header::new()
                                .description("The remaining window before the rate limit resets in UTC epoch seconds")
                                .schema(Some(utoipa::openapi::Schema::Integer(
                                    utoipa::openapi::IntegerType::new()
                                )))
                        )
                );
            }
        }
    }
} 