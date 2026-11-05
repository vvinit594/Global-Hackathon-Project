import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@stealth/db';

const updateProfileSchema = z.object({
  display_name: z.string().trim().max(100).optional(),
  avatar_url: z.string().url().max(500).optional().nullable(),
});

// GET /api/v1/users/profile
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const admin = getSupabaseAdmin();

    const { data: profile, error } = await admin
      .from('profiles')
      .select('id, email, display_name, avatar_url, created_at, updated_at')
      .eq('id', auth.userId)
      .maybeSingle();

    if (error) throw error;

    if (!profile) {
      return NextResponse.json(
        { error: { code: 'PROFILE_NOT_FOUND', message: 'Profile record not found.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: profile,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'PROFILE_FETCH_FAILED', message: 'Unable to fetch user profile.' } },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/users/profile
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

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid profile data.',
        },
      },
      { status: 400 }
    );
  }

  const { display_name, avatar_url } = parsed.data;

  try {
    const admin = getSupabaseAdmin();

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (display_name !== undefined) updatePayload['display_name'] = display_name;
    if (avatar_url !== undefined) updatePayload['avatar_url'] = avatar_url;

    const { data: updated, error } = await admin
      .from('profiles')
      .update(updatePayload)
      .eq('id', auth.userId)
      .select('id, email, display_name, avatar_url, updated_at')
      .single();

    if (error) throw error;

    return NextResponse.json({
      data: updated,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'PROFILE_UPDATE_FAILED', message: 'Failed to update user profile.' } },
      { status: 500 }
    );
  }
}

