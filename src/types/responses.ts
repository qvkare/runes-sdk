export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ErrorResponse {
  code: number;
  message: string;
  details?: Record<string, unknown>;
} 