import { describe, it, expect } from 'vitest';
import { GET } from '../health/route';
import {
  getSafePublicConfig,
  AppError,
  ValidationError,
  normalizeError,
  sanitizeData,
} from '@stealth/shared';

describe('Health Check API & Backend Foundation', () => {
  it('GET /api/v1/health returns 200 with ok status and safe environment info', async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.status).toBe('ok');
    expect(body.data.backend).toBe('available');
    expect(body.data.version).toBe('1.0.0');
    expect(body.data.chain).toBeDefined();
    expect(typeof body.data.uptime).toBe('number');
    expect(body.data.timestamp).toBeDefined();

    // Verify no secret values are leaked
    expect(body.data.SUPABASE_SERVICE_ROLE_KEY).toBeUndefined();
    expect(body.data.DATABASE_URL).toBeUndefined();
  });

  it('getSafePublicConfig extracts public fields only', () => {
    const config = getSafePublicConfig();
    expect(config.version).toBe('1.0.0');
    expect(config.chain).toBeDefined();
    expect(config.chain.chainId).toBe(11155111);
  });

  it('normalizeError handles AppError correctly', () => {
    const validationError = new ValidationError('Field is required', { field: 'email' });
    const normalized = normalizeError(validationError);
    expect(normalized.statusCode).toBe(400);
    expect(normalized.response.success).toBe(false);
    expect(normalized.response.error?.code).toBe('VALIDATION_ERROR');
    expect(normalized.response.error?.message).toBe('Field is required');
  });

  it('sanitizeData redacts private keys and sensitive fields', () => {
    const input = {
      username: 'alice',
      password: 'supersecretpassword',
      privateKey: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      meta: {
        token: 'jwt-token-string',
      },
    };
    const sanitized = sanitizeData(input);
    expect(sanitized.username).toBe('alice');
    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.privateKey).toBe('[REDACTED]');
    expect(sanitized.meta.token).toBe('[REDACTED]');
  });
});
