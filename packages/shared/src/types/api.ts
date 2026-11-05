// ─── API Envelope Types ────────────────────────────────────────────────────────

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  requestId?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiErrorPayload;
  meta?: Record<string, unknown>;
}

// ─── Health Check Types ────────────────────────────────────────────────────────

export interface HealthCheckChainInfo {
  name: string;
  chainId: number;
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  backend: 'available' | 'unavailable';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  chain: HealthCheckChainInfo;
}
