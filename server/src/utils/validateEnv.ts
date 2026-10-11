import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  AI_PROVIDER: z.string().default('openai'),
  AI_API_KEY: z.string().default(''),
  AI_MODEL: z.string().default('gpt-4o'),
  AI_BASE_URL: z.string().default('https://api.openai.com/v1'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  REDIS_URL: z.string().default(''),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function validateEnv(): Env {
  if (cachedEnv) return cachedEnv;
  
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }
  
  cachedEnv = result.data;
  return cachedEnv;
}
