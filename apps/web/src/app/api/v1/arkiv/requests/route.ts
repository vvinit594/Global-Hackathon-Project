import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { arkivClient } from '@/lib/arkiv';

const createRequestSchema = z.object({
  receiverAddress: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  receiverMetaAddress: z.string().regex(/^st:[a-zA-Z0-9]+:0x[0-9a-fA-F]{132}$/),
  amount: z.string().min(1),
  tokenSymbol: z.string().default('USDT'),
  network: z.string().default('Whitechain Testnet'),
  description: z.string().max(200).optional(),
  expiresInSeconds: z.number().int().positive().default(86400),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON request body.' } },
      { status: 400 }
    );
  }

  const parsed = createRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid request parameters.',
        },
      },
      { status: 400 }
    );
  }

  try {
    const paymentRequest = await arkivClient.createPaymentRequest(parsed.data);

    return NextResponse.json(
      {
        data: paymentRequest,
        meta: { timestamp: new Date().toISOString(), arkivIndexed: true },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'ARKIV_PUBLISH_FAILED', message: 'Failed to publish request to Arkiv.' } },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Query parameter "id" is required.' } },
      { status: 400 }
    );
  }

  const req = await arkivClient.getPaymentRequest(id);
  if (!req) {
    return NextResponse.json(
      { error: { code: 'REQUEST_NOT_FOUND', message: 'Payment request not found or expired.' } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data: req,
    meta: { timestamp: new Date().toISOString() },
  });
}
