import { config } from 'dotenv';
import { z } from 'zod';

config({ quiet: true });

const envSchema = z.object({
  CARBON_INTENSITY_API: z.string().url().default('https://api.carbonintensity.org.uk')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', z.treeifyError(parsed.error));
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;
