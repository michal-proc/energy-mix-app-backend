import { env } from '../../config/env';
import { formatApiDate } from '../../utils/date.util';
import { CarbonIntensityError, CarbonIntensityFailure } from './carbonIntensity.error';
import { GenerationInterval, GenerationRangeResponse } from './carbonIntensity.types';

const REQUEST_TIMEOUT_MS = 10_000;

const parseGenerationRange = (body: unknown): GenerationInterval[] => {
  if (!body || typeof body !== 'object' || !Array.isArray((body as GenerationRangeResponse).data)) {
    throw new CarbonIntensityError(CarbonIntensityFailure.INVALID_PAYLOAD);
  }

  return (body as GenerationRangeResponse).data;
};

export const fetchGenerationRange = async (from: Date, to: Date): Promise<GenerationInterval[]> => {
  const url = `${env.CARBON_INTENSITY_API}/generation/${formatApiDate(from)}/${formatApiDate(to)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });
  } catch {
    throw new CarbonIntensityError(CarbonIntensityFailure.UNREACHABLE);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new CarbonIntensityError(CarbonIntensityFailure.HTTP_ERROR, String(response.status));
  }

  try {
    return parseGenerationRange(await response.json());
  } catch (error) {
    if (error instanceof CarbonIntensityError) {
      throw error;
    }

    throw new CarbonIntensityError(CarbonIntensityFailure.INVALID_JSON);
  }
};
