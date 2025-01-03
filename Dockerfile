# Build stage
FROM rust:1.74-slim as builder

# Install required packages
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/runes-sdk

# Copy dependencies and build
COPY Cargo.toml Cargo.lock ./
COPY src ./src

# Release build
RUN cargo build --release

# Runtime stage
FROM debian:bullseye-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libssl1.1 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy compiled binary
COPY --from=builder /usr/src/runes-sdk/target/release/librunes_sdk_rust.so /usr/local/lib/
COPY --from=builder /usr/src/runes-sdk/target/release/librunes_sdk_rust.rlib /usr/local/lib/

# Set library path
ENV LD_LIBRARY_PATH=/usr/local/lib

# Create working directory
WORKDIR /app

# Create required directories
RUN mkdir -p /app/logs

# Create non-root user
RUN useradd -r -u 1001 -g root runes-sdk
USER runes-sdk

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/health || exit 1

# Run application
CMD ["runes-sdk"] 