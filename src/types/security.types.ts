export interface SecurityConfig {
  keyExpirationTime: number;
  maxKeysPerUser: number;
  maxKeyLength: number;
  requireSignature: boolean;
  ipWhitelistEnabled: boolean;
}

export interface APIKey {
  id: string;
  key: string;
  userId: string;
  createdAt: number | string;
  expiresAt: number | string;
  lastUsed?: number | string;
  ipWhitelist?: string[];
  permissions?: string[];
  isActive: boolean;
}

export interface SecurityValidationResult {
  isValid: boolean;
  error?: string;
}

export interface SecurityValidation {
  validateAPIKey(key: string): boolean;
  validateSignature?(payload: string, signature: string, secret: string): boolean;
  validateIPAddress?(ipAddress: string, whitelist?: string[]): boolean;
}

export interface SecurityCheck {
  isValid: boolean;
  signatures: string[];
  vulnerabilities: string[];
  details?: Record<string, any>;
}
