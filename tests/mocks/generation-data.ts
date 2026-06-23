import moment from 'moment';
import type { GenerationInterval } from '../src/integrations/carbonIntensity/carbonIntensity.types';

export const createInterval = (from: string, to: string, cleanPercentage: number): GenerationInterval => ({
  from,
  to,
  generationmix: [
    { fuel: 'wind', perc: cleanPercentage },
    { fuel: 'gas', perc: 100 - cleanPercentage }
  ]
});

export const createMixIntervals = (startDate: string, days = 3): GenerationInterval[] => {
  const intervals: GenerationInterval[] = [];

  for (let day = 0; day < days; day += 1) {
    const date = moment.utc(startDate, 'YYYY-MM-DD').add(day, 'days').format('YYYY-MM-DD');
    intervals.push(createInterval(`${date}T00:00:00Z`, `${date}T00:30:00Z`, 40 + day * 5));
    intervals.push(createInterval(`${date}T12:00:00Z`, `${date}T12:30:00Z`, 45 + day * 5));
  }

  return intervals;
};

export const createRangeIntervals = (
  startDate: string,
  days = 3,
  highCleanWindow?: { startIndex: number; length: number; cleanPercentage: number }
): GenerationInterval[] => {
  const intervals: GenerationInterval[] = [];
  const start = moment.utc(startDate, 'YYYY-MM-DD').startOf('day');

  for (let index = 0; index < days * 48; index += 1) {
    const from = start.clone().add(index * 30, 'minutes');
    const to = from.clone().add(30, 'minutes');
    const inHighWindow =
      highCleanWindow &&
      index >= highCleanWindow.startIndex &&
      index < highCleanWindow.startIndex + highCleanWindow.length;
    const cleanPercentage = inHighWindow ? highCleanWindow.cleanPercentage : 20;

    intervals.push(
      createInterval(from.toISOString().replace('.000Z', 'Z'), to.toISOString().replace('.000Z', 'Z'), cleanPercentage)
    );
  }

  return intervals;
};

export const createForecastIntervals = (start: Date, hours = 48): GenerationInterval[] => {
  const intervals: GenerationInterval[] = [];
  const startMs = start.getTime();

  for (let index = 0; index < hours * 2; index += 1) {
    const from = new Date(startMs + index * 30 * 60 * 1000);
    const to = new Date(from.getTime() + 30 * 60 * 1000);
    const cleanPercentage = index >= 4 && index < 10 ? 90 : 20;

    intervals.push(
      createInterval(from.toISOString().replace('.000Z', 'Z'), to.toISOString().replace('.000Z', 'Z'), cleanPercentage)
    );
  }

  return intervals;
};
