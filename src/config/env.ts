import { config } from 'dotenv';
import { z } from 'zod';

config({ quiet: true });

const envSchema = z.object({
  CARBON_INTENSITY_API: z.string().url().default('https://api.carbonintensity.org.uk')
});

const parsed = envSchema.safeParse(process.env);

export const env = parsed.data;
