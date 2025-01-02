# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Enhanced WebSocket Service
  - Improved connection management
  - Added market data handling
  - Implemented real-time updates for positions, trades, and liquidations
  - Added monitoring and health check system
  - Enhanced error handling and logging
  - Improved test coverage

### Pending
- Complete RBF (Replace-By-Fee) support in MempoolMonitorService
- Enhance performance testing suite
- Add more edge case tests

## [0.1.10] - 2024-01-01

### Changed
- Converted all Turkish content to English
- Updated .gitignore and .npmignore files for better file management

### Added
- Mempool Monitoring System
  - Transaction status tracking
  - Confirmation monitoring
  - Basic RBF support
- Transaction Validation Mechanisms
  - Address format validation
  - Balance verification
  - Fee validation
- API Security System
  - API key management
  - Request signature validation
  - IP whitelist functionality
- Rate Limiting System
  - Time-window based limiting
  - Per-user and per-action limits
  - Automatic cleanup

### Changed
- Improved error handling across all services
- Enhanced logging system
- Updated test coverage

### Fixed
- Memory leak in rate limiter
- Race condition in transaction validation
- Incorrect error messages in security service

## [1.0.0] - 2023-12-31

### Added
- Initial release of Runes SDK
- Basic transaction functionality
- RPC client implementation
- Core validation system
- Basic security features

### Security
- Implemented input validation
- Added API key authentication
- Basic rate limiting 