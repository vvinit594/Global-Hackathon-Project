import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createSupabaseClient } from '@stealth/db';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();

    return NextResponse.json({
      data: { message: 'Logged out successfully.' },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'LOGOUT_ERROR', message: 'Failed to complete logout.' } },
      { status: 500 }
    );
  }
}

