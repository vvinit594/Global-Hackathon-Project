import { NextResponse } from 'next/server';
import { getSafePublicConfig, createSuccessResponse, normalizeError, logger } from '@stealth/shared';
import type { HealthCheckResponse } from '@stealth/shared';

export const dynamic = 'force-dynamic';

const healthLogger = logger.withContext({ module: 'api/health' });

export async function GET() {
  try {
    const publicConfig = getSafePublicConfig();

    const healthData: HealthCheckResponse = {
      status: 'ok',
      backend: 'available',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: publicConfig.environment,
      version: publicConfig.version,
      chain: publicConfig.chain,
    };

    healthLogger.debug('Health check succeeded', { status: healthData.status });

    return NextResponse.json(createSuccessResponse(healthData), {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    healthLogger.error('Health check failed', { error });
    const { statusCode, response } = normalizeError(error);
    return NextResponse.json(response, { status: statusCode });
  }
}
