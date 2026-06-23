import { ResponseStatus } from '../../enums/response-status.enum';
import { AppError } from '../../errors/app-error';

export enum CarbonIntensityFailure {
  UNREACHABLE = 'UNREACHABLE',
  HTTP_ERROR = 'HTTP_ERROR',
  INVALID_JSON = 'INVALID_JSON',
  INVALID_PAYLOAD = 'INVALID_PAYLOAD'
}

const failureMessages: Record<CarbonIntensityFailure, string> = {
  [CarbonIntensityFailure.UNREACHABLE]: 'Failed to reach the Carbon Intensity API',
  [CarbonIntensityFailure.HTTP_ERROR]: 'Carbon Intensity API responded with an error',
  [CarbonIntensityFailure.INVALID_JSON]: 'Carbon Intensity API returned an invalid JSON payload',
  [CarbonIntensityFailure.INVALID_PAYLOAD]: 'Carbon Intensity API returned an unexpected payload'
};

const isCarbonIntensityFailure = (value: CarbonIntensityFailure | string): value is CarbonIntensityFailure =>
  Object.values(CarbonIntensityFailure).includes(value as CarbonIntensityFailure);

export class CarbonIntensityError extends AppError {
  constructor(failureOrMessage: CarbonIntensityFailure | string, detail?: string) {
    const message = isCarbonIntensityFailure(failureOrMessage)
      ? `${failureMessages[failureOrMessage]}${detail ? `: ${detail}` : ''}`
      : failureOrMessage;

    super(502, ResponseStatus.CARBON_INTENSITY_ERROR, message);
  }
}
