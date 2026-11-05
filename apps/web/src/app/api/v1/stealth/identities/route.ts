import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@stealth/db';

const createIdentitySchema = z.object({
  metaAddress: z.string().regex(/^st:eth:0x[0-9a-fA-F]{132}$/, {
    message: 'Invalid ERC-5564 stealth meta-address format (st:eth:0x<Pv><Ps>).',
  }),
  publicSpendKey: z.string().regex(/^0x[0-9a-fA-F]{66}$/, {
    message: 'Public spend key must be a 33-byte compressed hex string prefixed with 0x.',
  }),
  publicViewKey: z.string().regex(/^0x[0-9a-fA-F]{66}$/, {
    message: 'Public view key must be a 33-byte compressed hex string prefixed with 0x.',
  }),
  chainId: z.number().int().default(11155111),
  networkName: z.string().default('sepolia'),
  schemeId: z.number().int().default(1),
});

/**
 * GET /api/v1/stealth/identities
 * Returns all stealth identities owned by the authenticated user.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const admin = getSupabaseAdmin();

    const { data: identities, error } = await admin
      .from('stealth_identities')
      .select('id, user_id, meta_address, scheme_id, chain_id, network_name, public_spend_key, public_view_key, status, created_at, updated_at')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      data: identities ?? [],
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'IDENTITIES_FETCH_FAILED', message: 'Failed to fetch stealth identities.' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/stealth/identities
 * Registers a new stealth identity for the authenticated receiver.
 * Non-custodial: only public key material and meta-address are stored.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return auth.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON request body.' } },
      { status: 400 }
    );
  }

  const parsed = createIdentitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid stealth identity parameters.',
        },
      },
      { status: 400 }
    );
  }

  const { metaAddress, publicSpendKey, publicViewKey, chainId, networkName, schemeId } = parsed.data;

  try {
    const admin = getSupabaseAdmin();

    // Check if metaAddress already exists
    const { data: existing } = await admin
      .from('stealth_identities')
      .select('id, user_id, meta_address, status')
      .eq('meta_address', metaAddress)
      .maybeSingle();

    if (existing) {
      if (existing.user_id !== auth.userId) {
        return NextResponse.json(
          { error: { code: 'IDENTITY_CONFLICT', message: 'This meta-address is already registered by another account.' } },
          { status: 409 }
        );
      }
      return NextResponse.json({
        data: existing,
        meta: { timestamp: new Date().toISOString(), message: 'Identity already registered.' },
      });
    }

    const { data: created, error } = await admin
      .from('stealth_identities')
      .insert({
        user_id: auth.userId,
        meta_address: metaAddress,
        scheme_id: schemeId,
        chain_id: chainId,
        network_name: networkName,
        public_spend_key: publicSpendKey,
        public_view_key: publicViewKey,
        status: 'active',
      })
      .select('id, user_id, meta_address, scheme_id, chain_id, network_name, public_spend_key, public_view_key, status, created_at')
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        data: created,
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'IDENTITY_CREATION_FAILED', message: 'Failed to create stealth identity record.' } },
      { status: 500 }
    );
  }
}

