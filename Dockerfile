# Build aşaması
FROM rust:1.70-slim as builder

# Build bağımlılıklarını kur
RUN apt-get update && \
    apt-get install -y pkg-config libssl-dev && \
    rm -rf /var/lib/apt/lists/*

# Çalışma dizinini oluştur
WORKDIR /usr/src/runes-sdk

# Cargo.toml ve Cargo.lock dosyalarını kopyala
COPY Cargo.toml Cargo.lock ./

# Kaynak kodları kopyala
COPY src ./src

# Release build
RUN cargo build --release

# Çalışma aşaması
FROM debian:bullseye-slim

# Çalışma zamanı bağımlılıklarını kur
RUN apt-get update && \
    apt-get install -y ca-certificates libssl1.1 && \
    rm -rf /var/lib/apt/lists/*

# Binary'yi kopyala
COPY --from=builder /usr/src/runes-sdk/target/release/runes-sdk /usr/local/bin/

# Çalışma dizinini oluştur
WORKDIR /app

# Gerekli dizinleri oluştur
RUN mkdir -p /app/logs

# Non-root kullanıcı oluştur
RUN useradd -r -u 1001 -g root runes-sdk
USER runes-sdk

# Port'u aç
EXPOSE 8080

# Sağlık kontrolü
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/health || exit 1

# Uygulamayı çalıştır
CMD ["runes-sdk"] 