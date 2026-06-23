import { config } from 'dotenv';
import { z } from 'zod';

config({ quiet: true });

const envSchema = z.object({
  CARBON_INTENSITY_API: z.string().url()
});

export const env = envSchema.parse(process.env);

export type Env = typeof env;