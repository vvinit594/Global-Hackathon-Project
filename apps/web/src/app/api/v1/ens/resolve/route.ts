import { NextRequest, NextResponse } from 'next/server';
import { resolveEnsName } from '@/lib/ens';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Query parameter "name" is required (e.g., name=vitalik.eth).' } },
      { status: 400 }
    );
  }

  const result = await resolveEnsName(name);

  if (!result.resolved) {
    return NextResponse.json(
      { error: { code: 'ENS_NOT_FOUND', message: result.error ?? 'Unable to resolve ENS name.' }, data: result },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data: result,
    meta: { timestamp: new Date().toISOString() },
  });
}
