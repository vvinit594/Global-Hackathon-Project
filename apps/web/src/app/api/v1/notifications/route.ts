import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@stealth/db';

const notificationQuerySchema = z.object({
  unreadOnly: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

/**
 * GET /api/v1/notifications
 * Lists notifications for the authenticated user with unread count and pagination.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const parsed = notificationQuerySchema.safeParse({
    unreadOnly: searchParams.get('unreadOnly') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    offset: searchParams.get('offset') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid query parameters.',
        },
      },
      { status: 400 }
    );
  }

  const { unreadOnly, limit, offset } = parsed.data;

  try {
    const admin = getSupabaseAdmin();

    let query = admin
      .from('notifications')
      .select('id, user_id, type, title, message, is_read, metadata, created_at', { count: 'exact' })
      .eq('user_id', auth.userId);

    if (unreadOnly === 'true') {
      query = query.eq('is_read', false);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: notifications, count, error } = await query;
    if (error) throw error;

    // Count total unread
    const { count: unreadCount } = await admin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', auth.userId)
      .eq('is_read', false);

    return NextResponse.json({
      data: notifications ?? [],
      meta: {
        total: count ?? 0,
        unreadCount: unreadCount ?? 0,
        limit,
        offset,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'NOTIFICATIONS_FETCH_FAILED', message: 'Failed to retrieve notifications.' } },
      { status: 500 }
    );
  }
}

