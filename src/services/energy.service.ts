import { CLEAN_FUEL_TYPES, FuelType } from '../enums/fuel-type.enum';
import { CarbonIntensityError, fetchGenerationRange, GenerationInterval } from '../integrations/carbonIntensity';
import { ChargingWindow, DailyEnergyMix, FuelShare } from '../responses/energy.types';
import { addDays, formatDateOnly, startOfUtcDay } from '../utils/date.util';

const INTERVALS_PER_HOUR = 2;
const MIX_DAYS = 3;

const round2 = (value: number): number => Math.round(value * 100) / 100;

const getMixRange = (offsetDays: number) => {
  const start = addDays(startOfUtcDay(new Date()), offsetDays);
  const dates = Array.from({ length: MIX_DAYS }, (_, index) => formatDateOnly(addDays(start, index)));

  return {
    start,
    end: addDays(start, MIX_DAYS),
    dates,
    dateSet: new Set(dates)
  };
};

const cleanPercentageOfInterval = (interval: GenerationInterval): number =>
  interval.generationmix.reduce(
    (sum, entry) => (CLEAN_FUEL_TYPES.has(entry.fuel as FuelType) ? sum + entry.perc : sum),
    0
  );

const buildDailyMix = (date: string, intervals: GenerationInterval[]): DailyEnergyMix => {
  const sums = new Map<string, number>();

  for (const interval of intervals) {
    for (const entry of interval.generationmix) {
      sums.set(entry.fuel, (sums.get(entry.fuel) ?? 0) + entry.perc);
    }
  }

  const count = intervals.length;

  const generationMix: FuelShare[] = Object.values(FuelType).map((fuel) => ({
    fuel,
    percentage: count === 0 ? 0 : round2((sums.get(fuel) ?? 0) / count)
  }));

  const cleanEnergyPercentage = round2(
    generationMix.filter((share) => CLEAN_FUEL_TYPES.has(share.fuel)).reduce((sum, share) => sum + share.percentage, 0)
  );

  return {
    date,
    intervals: count,
    generationMix,
    cleanEnergyPercentage
  };
};

export const getEnergyMix = async (offsetDays = 0): Promise<DailyEnergyMix[]> => {
  const { start, end, dates, dateSet } = getMixRange(offsetDays);
  const intervals = await fetchGenerationRange(start, end);

  const intervalsByDate = new Map<string, GenerationInterval[]>();
  for (const interval of intervals) {
    const date = interval.from.slice(0, 10);
    if (!dateSet.has(date)) {
      continue;
    }
    const bucket = intervalsByDate.get(date);
    if (bucket) {
      bucket.push(interval);
    } else {
      intervalsByDate.set(date, [interval]);
    }
  }

  return dates.map((date) => buildDailyMix(date, intervalsByDate.get(date) ?? []));
};

const isContiguous = (window: GenerationInterval[]): boolean =>
  window.every((interval, index) => index === 0 || window[index - 1].to === interval.from);

export const getOptimalChargingWindow = async (hours: number, offsetDays = 0): Promise<ChargingWindow> => {
  const { start, end, dateSet } = getMixRange(offsetDays);

  const intervals = (await fetchGenerationRange(start, end))
    .filter((interval) => dateSet.has(interval.from.slice(0, 10)))
    .sort((a, b) => a.from.localeCompare(b.from));

  const windowSize = hours * INTERVALS_PER_HOUR;

  if (intervals.length < windowSize) {
    throw new CarbonIntensityError('No optimal charging window is available in the selected date range');
  }

  let best: ChargingWindow | null = null;

  for (let i = 0; i + windowSize <= intervals.length; i += 1) {
    const window = intervals.slice(i, i + windowSize);

    if (!isContiguous(window)) {
      continue;
    }

    const averageClean = window.reduce((sum, interval) => sum + cleanPercentageOfInterval(interval), 0) / windowSize;

    if (best === null || averageClean > best.averageCleanEnergyPercentage) {
      best = {
        windowHours: hours,
        from: window[0].from,
        to: window[window.length - 1].to,
        averageCleanEnergyPercentage: averageClean
      };
    }
  }

  if (best === null) {
    throw new CarbonIntensityError('No optimal charging window is available in the selected date range');
  }

  return {
    ...best,
    averageCleanEnergyPercentage: round2(best.averageCleanEnergyPercentage)
  };
};
