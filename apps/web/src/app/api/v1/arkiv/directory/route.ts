import { NextRequest, NextResponse } from 'next/server';
import { arkivClient } from '@/lib/arkiv';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';

  try {
    const entries = await arkivClient.getDirectoryEntries();
    const filtered = query
      ? entries.filter(
          (e) =>
            e.name.toLowerCase().includes(query.toLowerCase()) ||
            e.description.toLowerCase().includes(query.toLowerCase()) ||
            e.category.toLowerCase().includes(query.toLowerCase())
        )
      : entries;

    return NextResponse.json({
      data: filtered,
      meta: {
        total: filtered.length,
        network: 'Arkiv Testnet',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'DIRECTORY_FETCH_FAILED', message: 'Failed to fetch directory from Arkiv.' } },
      { status: 500 }
    );
  }
}
