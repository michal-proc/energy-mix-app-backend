import { ResponseStatus } from '../enums/response-status.enum';
import { ApiError, ApiErrorResponse, ApiSuccessResponse } from './response.types';

export const createSuccessResponse = <T>(data: T): ApiSuccessResponse<T> => ({
  success: true,
  data
});

export const createErrorResponse = (httpStatus: number, status: ResponseStatus, message: string): ApiErrorResponse => ({
  success: false,
  error: { httpStatus, status, message } satisfies ApiError
});
