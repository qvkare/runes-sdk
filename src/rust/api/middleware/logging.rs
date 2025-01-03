use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};
use std::time::Instant;

use actix_web::dev::{Service, ServiceRequest, ServiceResponse, Transform};
use actix_web::Error;
use futures::future::LocalBoxFuture;
use tracing::{Span, Level};

pub struct LoggingMiddleware;

impl<S, B> Transform<S, ServiceRequest> for LoggingMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = LoggingMiddlewareService<S>;
    type Future = LocalBoxFuture<'static, Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        Box::pin(async move { Ok(LoggingMiddlewareService { service }) })
    }
}

pub struct LoggingMiddlewareService<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for LoggingMiddlewareService<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(&self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let start = Instant::now();
        
        // İstek bilgilerini topla
        let method = req.method().as_str().to_string();
        let path = req.path().to_string();
        let version = req.version();
        let connection_info = req.connection_info();
        let remote_addr = connection_info.realip_remote_addr()
            .unwrap_or("unknown")
            .to_string();
        
        // Request ID'yi al
        let request_id = req.headers()
            .get("x-request-id")
            .and_then(|h| h.to_str().ok())
            .unwrap_or("unknown")
            .to_string();

        // İstek span'ini oluştur
        let span = tracing::span!(
            Level::INFO,
            "http_request",
            request_id = %request_id,
            method = %method,
            path = %path,
            version = ?version,
            remote_addr = %remote_addr,
        );
        let _enter = span.enter();

        // İstek başlangıcını logla
        tracing::info!(
            "Started {} {} from {}",
            method,
            path,
            remote_addr,
        );

        let fut = self.service.call(req);
        Box::pin(async move {
            let result = fut.await;
            
            let elapsed = start.elapsed();
            
            match &result {
                Ok(response) => {
                    // Başarılı yanıtı logla
                    let status = response.status();
                    tracing::info!(
                        "Completed {} {} {} in {:?}",
                        method,
                        path,
                        status.as_u16(),
                        elapsed,
                    );
                }
                Err(error) => {
                    // Hatayı logla
                    tracing::error!(
                        "Failed {} {} with error: {} in {:?}",
                        method,
                        path,
                        error,
                        elapsed,
                    );
                }
            }
            
            result
        })
    }
} 