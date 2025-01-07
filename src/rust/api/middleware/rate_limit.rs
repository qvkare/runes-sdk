use std::sync::Arc;
use std::task::{Context, Poll};
use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpResponse,
};
use futures::future::{ok, Ready};
use futures::Future;
use std::pin::Pin;

use crate::services::rate_limit::RateLimiter;
use crate::types::error::RuneError;

pub struct RateLimitMiddleware {
    limiter: Arc<RateLimiter>,
}

impl RateLimitMiddleware {
    pub fn new(limiter: Arc<RateLimiter>) -> Self {
        Self { limiter }
    }
}

impl<S, B> Transform<S, ServiceRequest> for RateLimitMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = RateLimitMiddlewareService<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(RateLimitMiddlewareService {
            service,
            limiter: self.limiter.clone(),
        })
    }
}

pub struct RateLimitMiddlewareService<S> {
    service: S,
    limiter: Arc<RateLimiter>,
}

impl<S, B> Service<ServiceRequest> for RateLimitMiddlewareService<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;

    fn poll_ready(&self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let limiter = self.limiter.clone();
        let fut = self.service.call(req);

        Box::pin(async move {
            // Client IP'sini al
            let ip = if let Some(ip) = get_client_ip(&fut.await?.request()) {
                ip
            } else {
                return Ok(ServiceResponse::new(
                    fut.await?.request().clone(),
                    HttpResponse::BadRequest().json("Invalid IP address"),
                ));
            };

            // Rate limit kontrolü
            match limiter.check_rate_limit(&ip, 1).await {
                Ok(_) => fut.await,
                Err(RuneError::RateLimitExceeded) => {
                    let resp = HttpResponse::TooManyRequests()
                        .json("Rate limit exceeded. Please try again later.");
                    Ok(ServiceResponse::new(fut.await?.request().clone(), resp))
                }
                Err(e) => {
                    let resp = HttpResponse::InternalServerError()
                        .json(format!("Rate limit error: {}", e));
                    Ok(ServiceResponse::new(fut.await?.request().clone(), resp))
                }
            }
        })
    }
}

fn get_client_ip(req: &actix_web::HttpRequest) -> Option<String> {
    // X-Forwarded-For header'ını kontrol et
    if let Some(forwarded_for) = req.headers().get("X-Forwarded-For") {
        if let Ok(forwarded_str) = forwarded_for.to_str() {
            if let Some(first_ip) = forwarded_str.split(',').next() {
                return Some(first_ip.trim().to_string());
            }
        }
    }

    // Real IP header'ını kontrol et
    if let Some(real_ip) = req.headers().get("X-Real-IP") {
        if let Ok(ip_str) = real_ip.to_str() {
            return Some(ip_str.to_string());
        }
    }

    // Connection bilgisinden IP'yi al
    req.connection_info().realip_remote_addr()
        .map(|ip| ip.to_string())
} 