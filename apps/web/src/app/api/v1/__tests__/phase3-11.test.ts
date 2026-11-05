import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as verifyWallet } from '../wallets/verify/route';
import { GET as resolveStealth } from '../stealth/resolve/route';
import { POST as prepareEthPayment } from '../payments/eth/prepare/route';
import { POST as confirmEthPayment } from '../payments/eth/confirm/route';
import { GET as getTransactions } from '../transactions/route';
import { GET as getNotifications } from '../notifications/route';
import { PATCH as updateSettings } from '../settings/route';

function makeRequest(url: string, method: string, body?: unknown, headers?: Record<string, string>): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('Stealth Pay Backend Endpoints (Phases 3 - 11)', () => {
  describe('Phase 4: Wallets verification endpoint', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const req = makeRequest('/api/v1/wallets/verify', 'POST', {
        address: '0x1111111111111111111111111111111111111111',
        message: 'hello',
        signature: '0x1234',
      });
      const res = await verifyWallet(req);
      expect(res.status).toBe(401);
    });
  });

  describe('Phase 5: Stealth identity resolution endpoint', () => {
    it('returns 400 when both metaAddress and userId are omitted', async () => {
      const req = makeRequest('/api/v1/stealth/resolve', 'GET');
      const res = await resolveStealth(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Phase 8: Ethereum stealth payment preparation', () => {
    it('returns 400 for invalid meta-address URI format', async () => {
      const req = makeRequest('/api/v1/payments/eth/prepare', 'POST', {
        stealthMetaAddressURI: 'invalid-uri',
        amountWei: '1000000000000000000',
      });
      const res = await prepareEthPayment(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for non-positive or invalid amountWei', async () => {
      const req = makeRequest('/api/v1/payments/eth/prepare', 'POST', {
        stealthMetaAddressURI: 'st:eth:0x' + '0'.repeat(132),
        amountWei: 'not-a-number',
      });
      const res = await prepareEthPayment(req);
      expect(res.status).toBe(400);
    });
  });

  describe('Phase 8: Payment confirmation endpoint', () => {
    it('returns 400 for invalid txHash format', async () => {
      const req = makeRequest('/api/v1/payments/eth/confirm', 'POST', {
        paymentId: '123e4567-e89b-12d3-a456-426614174000',
        txHash: '0xinvalidhash',
      });
      const res = await confirmEthPayment(req);
      expect(res.status).toBe(400);
    });
  });

  describe('Phase 10: Transactions listing endpoint', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const req = makeRequest('/api/v1/transactions', 'GET');
      const res = await getTransactions(req);
      expect(res.status).toBe(401);
    });
  });

  describe('Phase 11: Notifications listing endpoint', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const req = makeRequest('/api/v1/notifications', 'GET');
      const res = await getNotifications(req);
      expect(res.status).toBe(401);
    });
  });

  describe('Phase 11: Settings update endpoint', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const req = makeRequest('/api/v1/settings', 'PATCH', {
        theme: 'dark',
      });
      const res = await updateSettings(req);
      expect(res.status).toBe(401);
    });
  });
});

