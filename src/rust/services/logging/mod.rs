use std::sync::Arc;
use tracing::{Level, Subscriber};
use tracing_subscriber::{
    fmt::{self, format::FmtSpan},
    EnvFilter,
    layer::SubscriberExt,
    Registry,
};
use tracing_bunyan_formatter::{BunyanFormattingLayer, JsonStorageLayer};
use tracing_log::LogTracer;
use tracing_appender::rolling::{RollingFileAppender, Rotation};

pub struct LoggingConfig {
    pub log_level: Level,
    pub log_file_path: String,
    pub json_logging: bool,
    pub console_logging: bool,
}

impl Default for LoggingConfig {
    fn default() -> Self {
        Self {
            log_level: Level::INFO,
            log_file_path: "logs/runes-sdk.log".to_string(),
            json_logging: true,
            console_logging: true,
        }
    }
}

pub fn init_logging(config: LoggingConfig) -> Result<(), Box<dyn std::error::Error>> {
    // Log kütüphanesini tracing'e yönlendir
    LogTracer::init()?;

    // Dosyaya yazma için appender oluştur
    let file_appender = RollingFileAppender::new(
        Rotation::DAILY,
        "logs",
        "runes-sdk.log",
    );

    let mut layers = Vec::new();

    // JSON formatında loglama katmanı
    if config.json_logging {
        let (non_blocking, _guard) = tracing_appender::non_blocking(file_appender);
        let bunyan_formatting_layer = BunyanFormattingLayer::new(
            "runes-sdk".into(),
            non_blocking,
        );
        layers.push(Arc::new(JsonStorageLayer));
        layers.push(Arc::new(bunyan_formatting_layer));
    }

    // Konsol loglama katmanı
    if config.console_logging {
        let console_layer = fmt::layer()
            .with_target(true)
            .with_thread_ids(true)
            .with_thread_names(true)
            .with_file(true)
            .with_line_number(true)
            .with_span_events(FmtSpan::CLOSE)
            .pretty();
        layers.push(Arc::new(console_layer));
    }

    // Log seviyesi filtresi
    let env_filter = EnvFilter::from_default_env()
        .add_directive(config.log_level.into());

    // Subscriber'ı oluştur ve kaydet
    let subscriber = Registry::default()
        .with(env_filter);

    for layer in layers {
        subscriber = subscriber.with(layer);
    }

    // Global subscriber'ı ayarla
    tracing::subscriber::set_global_default(subscriber)?;

    Ok(())
}

// Log makroları
#[macro_export]
macro_rules! log_error {
    ($($arg:tt)*) => {
        tracing::error!(
            target: "runes-sdk",
            $($arg)*
        )
    };
}

#[macro_export]
macro_rules! log_warn {
    ($($arg:tt)*) => {
        tracing::warn!(
            target: "runes-sdk",
            $($arg)*
        )
    };
}

#[macro_export]
macro_rules! log_info {
    ($($arg:tt)*) => {
        tracing::info!(
            target: "runes-sdk",
            $($arg)*
        )
    };
}

#[macro_export]
macro_rules! log_debug {
    ($($arg:tt)*) => {
        tracing::debug!(
            target: "runes-sdk",
            $($arg)*
        )
    };
}

#[macro_export]
macro_rules! log_trace {
    ($($arg:tt)*) => {
        tracing::trace!(
            target: "runes-sdk",
            $($arg)*
        )
    };
} 