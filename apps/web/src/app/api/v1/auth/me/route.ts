import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@stealth/db';

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

    if (error) {
      throw error;
    }

    return NextResponse.json({
      data: {
        user: {
          id: auth.userId,
          email: auth.email,
          displayName: profile?.display_name ?? null,
          avatarUrl: profile?.avatar_url ?? null,
          createdAt: profile?.created_at ?? null,
          updatedAt: profile?.updated_at ?? null,
        },
      },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'PROFILE_FETCH_FAILED', message: 'Failed to retrieve current user session.' } },
      { status: 500 }
    );
  }
}

