import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@stealth/db';

const updateSettingsSchema = z.object({
  notify_payment_detected: z.boolean().optional(),
  notify_payment_confirmed: z.boolean().optional(),
  notify_payment_claimed: z.boolean().optional(),
  notify_system: z.boolean().optional(),
  default_chain_id: z.number().int().positive().optional(),
  default_token: z.string().min(1).max(10).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

/**
 * GET /api/v1/settings
 * Returns current user configuration & preferences.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const admin = getSupabaseAdmin();

    let { data: settings } = await admin
      .from('user_settings')
      .select('*')
      .eq('user_id', auth.userId)
      .maybeSingle();

    if (!settings) {
      // Auto-initialize default settings if not exists
      const { data: created } = await admin
        .from('user_settings')
        .insert({ user_id: auth.userId })
        .select('*')
        .single();

      settings = created;
    }

    return NextResponse.json({
      data: settings,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'SETTINGS_FETCH_FAILED', message: 'Failed to retrieve settings.' } },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/settings
 * Updates preferences and security configurations for the authenticated user.
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
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

  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid settings configuration.',
        },
      },
      { status: 400 }
    );
  }

  try {
    const admin = getSupabaseAdmin();

    const updatePayload: Record<string, unknown> = {
      ...parsed.data,
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error } = await admin
      .from('user_settings')
      .upsert({
        user_id: auth.userId,
        ...updatePayload,
      })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({
      data: updated,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'SETTINGS_UPDATE_FAILED', message: 'Failed to update settings.' } },
      { status: 500 }
    );
  }
}

