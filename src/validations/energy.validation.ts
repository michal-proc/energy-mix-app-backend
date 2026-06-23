import { z } from 'zod';

export const MIN_WINDOW_HOURS = 1;
export const MAX_WINDOW_HOURS = 6;

export const MIN_OFFSET_DAYS = -14;
export const MAX_OFFSET_DAYS = 14;

export const energyMixQuerySchema = z.object({
  offsetDays: z.coerce
    .number({ error: 'offsetDays must be a number' })
    .int('offsetDays must be a whole number')
    .min(MIN_OFFSET_DAYS, `offsetDays must be at least ${MIN_OFFSET_DAYS}`)
    .max(MAX_OFFSET_DAYS, `offsetDays must be at most ${MAX_OFFSET_DAYS}`)
    .default(0)
});

export const chargingWindowQuerySchema = z.object({
  hours: z.coerce
    .number({ error: 'hours must be a number' })
    .int('hours must be a whole number')
    .min(MIN_WINDOW_HOURS, `hours must be at least ${MIN_WINDOW_HOURS}`)
    .max(MAX_WINDOW_HOURS, `hours must be at most ${MAX_WINDOW_HOURS}`),
  offsetDays: z.coerce
    .number({ error: 'offsetDays must be a number' })
    .int('offsetDays must be a whole number')
    .min(MIN_OFFSET_DAYS, `offsetDays must be at least ${MIN_OFFSET_DAYS}`)
    .max(MAX_OFFSET_DAYS, `offsetDays must be at most ${MAX_OFFSET_DAYS}`)
    .default(0)
});

export type ChargingWindowQuery = z.infer<typeof chargingWindowQuerySchema>;
