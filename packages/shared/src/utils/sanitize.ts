const SENSITIVE_KEY_PATTERNS = [
  /private_?key/i,
  /secret/i,
  /password/i,
  /seed/i,
  /mnemonic/i,
  /token/i,
  /auth/i,
  /credential/i,
  /service_?role/i,
];

/**
 * Recursively redacts sensitive values from objects or arrays.
 * Safe for structured logging and telemetry.
 */
export function sanitizeData<T>(data: T, depth = 0): T {
  if (depth > 5 || data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Redact 64-char hex strings that look like raw private keys
    if (/^[0-9a-fA-F]{64}$/.test(data)) {
      return `[REDACTED_HEX_KEY:${data.slice(0, 4)}…${data.slice(-4)}]` as unknown as T;
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, depth + 1)) as unknown as T;
  }

  if (typeof data === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const isSensitiveKey = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
      if (isSensitiveKey) {
        sanitizedObj[key] = '[REDACTED]';
      } else {
        sanitizedObj[key] = sanitizeData(value, depth + 1);
      }
    }
    return sanitizedObj as T;
  }

  return data;
}

