import { ResponseStatus } from '../enums/response-status.enum';
import { ChargingWindow, DailyEnergyMix } from './energy.types';

export interface ApiError {
  httpStatus: number;
  status: ResponseStatus;
  message: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type EnergyMixResponse = ApiResponse<DailyEnergyMix[]>;
export type ChargingWindowResponse = ApiResponse<ChargingWindow>;
