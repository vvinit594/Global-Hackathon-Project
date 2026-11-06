import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUniswapQuote } from '@/lib/uniswap';

const quoteSchema = z.object({
  tokenIn: z.string().min(1),
  tokenOut: z.string().min(1),
  amountIn: z.string().min(1),
  slippageTolerancePercent: z.number().min(0.01).max(5).default(0.5),
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

  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid quote request.',
        },
      },
      { status: 400 }
    );
  }

  try {
    const quote = await getUniswapQuote(parsed.data);
    return NextResponse.json({
      data: quote,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'QUOTE_FAILED', message: 'Unable to retrieve swap quote.' } },
      { status: 500 }
    );
  }
}
