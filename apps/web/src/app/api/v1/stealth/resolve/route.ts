import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@stealth/db';

const resolveQuerySchema = z.object({
  metaAddress: z.string().optional(),
  userId: z.string().uuid().optional(),
});

/**
 * GET /api/v1/stealth/resolve?metaAddress=... or ?userId=...
 * Public resolution endpoint to fetch public stealth identity details for payment derivation.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const metaAddress = searchParams.get('metaAddress') ?? undefined;
  const userId = searchParams.get('userId') ?? undefined;

  const parsed = resolveQuerySchema.safeParse({ metaAddress, userId });
  if (!parsed.success || (!metaAddress && !userId)) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Either metaAddress or userId query parameter is required.',
        },
      },
      { status: 400 }
    );
  }

  try {
    const admin = getSupabaseAdmin();
    let query = admin
      .from('stealth_identities')
      .select('id, meta_address, scheme_id, chain_id, network_name, public_spend_key, public_view_key, status')
      .eq('status', 'active');

    if (metaAddress) {
      query = query.eq('meta_address', metaAddress);
    } else if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: identity, error } = await query.maybeSingle();

    if (error) throw error;

    if (!identity) {
      return NextResponse.json(
        { error: { code: 'IDENTITY_NOT_FOUND', message: 'No active stealth identity found for this query.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: identity,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'RESOLUTION_FAILED', message: 'Failed to resolve stealth identity.' } },
      { status: 500 }
    );
  }
}

