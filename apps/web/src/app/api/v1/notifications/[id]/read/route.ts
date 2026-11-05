import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@stealth/db';

/**
 * PATCH /api/v1/notifications/[id]/read
 * Marks a specific notification as read.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return auth.response;
  }

  const notificationId = params.id;

  try {
    const admin = getSupabaseAdmin();

    const { data: updated, error } = await admin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', auth.userId)
      .select('id, is_read')
      .maybeSingle();

    if (error || !updated) {
      return NextResponse.json(
        { error: { code: 'NOTIFICATION_NOT_FOUND', message: 'Notification not found or access denied.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: updated,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'UPDATE_FAILED', message: 'Failed to mark notification as read.' } },
      { status: 500 }
    );
  }
}

