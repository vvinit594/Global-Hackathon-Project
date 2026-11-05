import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@stealth/db';

export type AuthResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; response: NextResponse };

/**
 * Verify the Supabase Bearer token from the Authorization header.
 * Uses getUser(token) — validates against the Supabase Auth server.
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header.' } },
        { status: 401 }
      ),
    };
  }

  const token = header.slice(7).trim();
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Bearer token is empty.' } },
        { status: 401 }
      ),
    };
  }

  const url = process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? process.env['SUPABASE_URL'];
  const anonKey =
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ??
    process.env['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY'] ??
    process.env['SUPABASE_ANON_KEY'];

  if (!url || !anonKey) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: { code: 'CONFIGURATION_ERROR', message: 'Auth service is temporarily misconfigured.' } },
        { status: 500 }
      ),
    };
  }

  try {
    const supabase = createClient<Database>(url, anonKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: error?.message ?? 'Token expired or invalid.' } },
          { status: 401 }
        ),
      };
    }

    return {
      ok: true,
      userId: data.user.id,
      email: data.user.email ?? '',
    };
  } catch (err) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: { code: 'AUTH_VERIFICATION_FAILED', message: 'Failed to verify session.' } },
        { status: 401 }
      ),
    };
  }
}
