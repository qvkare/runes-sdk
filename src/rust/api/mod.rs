pub mod runes;
pub mod webhook;
pub mod middleware;
pub mod docs;

use actix_web::{web, App, HttpServer, HttpResponse};
use std::sync::Arc;
use utoipa_swagger_ui::SwaggerUi;

use crate::services::{
    node::connection::NodeConnection,
    cache::RunesCache,
    rate_limit::{RateLimiter, RateLimitConfig, RateLimitMetrics},
    metrics::{register_metrics, metrics_handler},
    logging::{init_logging, LoggingConfig},
};

use self::{
    runes::handlers::RunesApiContext,
    middleware::{
        rate_limit::RateLimitMiddleware,
        request_id::RequestId,
        error_handler::ErrorHandler,
        metrics::MetricsMiddleware,
        logging::LoggingMiddleware,
    },
    docs::{ApiDoc, SecurityAddon, RateLimitHeaders},
};

pub struct ApiServer {
    node: Arc<NodeConnection>,
    cache: Arc<RunesCache>,
    rate_limiter: Arc<RateLimiter>,
}

impl ApiServer {
    pub fn new(
        node: Arc<NodeConnection>,
        cache: Arc<RunesCache>,
        rate_limiter: Arc<RateLimiter>,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        // Loglama sistemini başlat
        init_logging(LoggingConfig::default())?;
        
        // Metrikleri kaydet
        register_metrics();
        
        Ok(Self {
            node,
            cache,
            rate_limiter,
        })
    }

    pub async fn run(&self, bind_address: &str) -> std::io::Result<()> {
        let node = self.node.clone();
        let cache = self.cache.clone();
        let rate_limiter = self.rate_limiter.clone();

        // OpenAPI dokümantasyonunu oluştur
        let openapi = ApiDoc::openapi()
            .merge_with(&SecurityAddon)
            .merge_with(&RateLimitHeaders);

        tracing::info!("Starting API server on {}", bind_address);

        HttpServer::new(move || {
            App::new()
                // Middleware sıralaması önemli
                .wrap(ErrorHandler::new())  // En dıştaki middleware
                .wrap(RequestId::new())     // Request ID'yi ekle
                .wrap(LoggingMiddleware)    // Loglamayı ekle
                .wrap(MetricsMiddleware)    // Metrikleri topla
                .wrap(RateLimitMiddleware::new(rate_limiter.clone()))
                // Swagger UI'ı ekle
                .service(
                    SwaggerUi::new("/swagger-ui/{_:.*}")
                        .url("/api-docs/openapi.json", openapi.clone())
                        .config(|c| {
                            c.docExpansion("list")
                             .defaultModelsExpandDepth(3)
                             .defaultModelExpandDepth(3)
                             .displayRequestDuration(true)
                             .filter(true)
                             .showExtensions(true)
                             .showCommonExtensions(true)
                             .tryItOutEnabled(true)
                        })
                )
                // Metrik endpoint'i
                .route("/metrics", web::get().to(|| async {
                    HttpResponse::Ok()
                        .content_type("text/plain")
                        .body(metrics_handler())
                }))
                .app_data(web::Data::new(RunesApiContext {
                    node: node.clone(),
                    cache: cache.clone(),
                }))
                .configure(runes::routes::configure_routes)
                .configure(webhook::routes::configure_routes)
        })
        .bind(bind_address)?
        .run()
        .await
    }
} 