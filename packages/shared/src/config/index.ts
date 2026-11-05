import { z } from 'zod';

// ─── Environment Configuration Schema ──────────────────────────────────────────

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  SITE_URL: z.string().default('http://localhost:3000'),

  // Blockchain Configuration (Ethereum Sepolia Testnet default)
  CHAIN_ID: z.coerce.number().default(11155111),
  CHAIN_NAME: z.string().default('Sepolia Testnet'),
  ETHEREUM_RPC_URL: z
    .string()
    .url()
    .default('https://rpc.sepolia.org'),
  ERC5564_ANNOUNCER_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Must be a valid 20-byte Ethereum address')
    .optional(),

  // Supabase Configuration (Optional during Phase 1 foundation)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  DATABASE_URL: z.string().optional(),

  // Scanner Configuration
  SCAN_INTERVAL_MS: z.coerce.number().default(15000),
  SCAN_CONFIRMATION_BLOCKS: z.coerce.number().default(2),
});

export type AppConfig = z.infer<typeof envSchema>;

export interface SafePublicConfig {
  environment: string;
  version: string;
  chain: {
    name: string;
    chainId: number;
  };
  hasAnnouncerConfigured: boolean;
}

const APP_VERSION = '1.0.0';

/**
 * Returns parsed and validated application configuration.
 * Fallbacks are provided for required non-secret fields.
 */
export function getAppConfig(customEnv: Record<string, string | undefined> = process.env): AppConfig {
  const result = envSchema.safeParse({
    NODE_ENV: customEnv['NODE_ENV'],
    PORT: customEnv['PORT'] || customEnv['WEB_PORT'],
    SITE_URL: customEnv['SITE_URL'] || customEnv['NEXT_PUBLIC_SITE_URL'],
    CHAIN_ID: customEnv['CHAIN_ID'] || customEnv['NEXT_PUBLIC_CHAIN_ID'],
    CHAIN_NAME: customEnv['CHAIN_NAME'] || customEnv['NEXT_PUBLIC_CHAIN_NAME'],
    ETHEREUM_RPC_URL: customEnv['ETHEREUM_RPC_URL'] || customEnv['NEXT_PUBLIC_RPC_URL'],
    ERC5564_ANNOUNCER_ADDRESS: customEnv['ERC5564_ANNOUNCER_ADDRESS'] || customEnv['NEXT_PUBLIC_ERC5564_ANNOUNCER_ADDRESS'],
    NEXT_PUBLIC_SUPABASE_URL: customEnv['NEXT_PUBLIC_SUPABASE_URL'],
    NEXT_PUBLIC_SUPABASE_ANON_KEY: customEnv['NEXT_PUBLIC_SUPABASE_ANON_KEY'],
    SUPABASE_SERVICE_ROLE_KEY: customEnv['SUPABASE_SERVICE_ROLE_KEY'],
    DATABASE_URL: customEnv['DATABASE_URL'],
    SCAN_INTERVAL_MS: customEnv['SCAN_INTERVAL_MS'],
    SCAN_CONFIRMATION_BLOCKS: customEnv['SCAN_CONFIRMATION_BLOCKS'],
  });

  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    console.warn(`[Config Warning] Invalid environment configuration, using safe defaults: ${issues}`);
    return envSchema.parse({});
  }

  return result.data;
}

/**
 * Extracts strictly safe, non-sensitive configuration suitable for public / health-check exposure.
 * Never includes secrets, database credentials, or internal tokens.
 */
export function getSafePublicConfig(config: AppConfig = getAppConfig()): SafePublicConfig {
  return {
    environment: config.NODE_ENV,
    version: APP_VERSION,
    chain: {
      name: config.CHAIN_NAME,
      chainId: config.CHAIN_ID,
    },
    hasAnnouncerConfigured: Boolean(config.ERC5564_ANNOUNCER_ADDRESS),
  };
}
