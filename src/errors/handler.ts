import { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { ResponseStatus } from '../enums/response-status.enum';
import { createErrorResponse } from '../responses/apiResponseCreator';
import { ApiError } from '../responses/response.types';
import { AppError, NotFoundError } from './app-error';

type ErrorResolver = {
  match: (error: unknown) => boolean;
  resolve: (error: unknown) => ApiError;
};

const formatZodError = (error: ZodError): string =>
  error.issues
    .map((issue) => {
      const path = issue.path.join('.');
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join('; ');

const isMalformedJsonError = (error: unknown): error is SyntaxError & { status: number } =>
  error instanceof SyntaxError && 'status' in error && (error as SyntaxError & { status?: number }).status === 400;

const errorResolvers: ErrorResolver[] = [
  {
    match: (error): error is AppError => error instanceof AppError,
    resolve: (error) => {
      const appError = error as AppError;
      return {
        httpStatus: appError.httpStatus,
        status: appError.status,
        message: appError.message
      };
    }
  },
  {
    match: (error): error is ZodError => error instanceof ZodError,
    resolve: (error) => ({
      httpStatus: 422,
      status: ResponseStatus.VALIDATION_ERROR,
      message: formatZodError(error as ZodError)
    })
  },
  {
    match: isMalformedJsonError,
    resolve: () => ({
      httpStatus: 400,
      status: ResponseStatus.BAD_REQUEST,
      message: 'Malformed JSON in request body'
    })
  }
];

const defaultError: ApiError = {
  httpStatus: 500,
  status: ResponseStatus.INTERNAL_SERVER_ERROR,
  message: 'An unexpected internal server error occurred'
};

const resolveError = (error: unknown): { error: ApiError; unhandled: boolean } => {
  const resolver = errorResolvers.find(({ match }) => match(error));

  if (resolver) {
    return { error: resolver.resolve(error), unhandled: false };
  }

  return { error: defaultError, unhandled: true };
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const { error, unhandled } = resolveError(err);

  if (unhandled) {
    console.error('Unhandled error:', err);
  }

  res.status(error.httpStatus).json(createErrorResponse(error.httpStatus, error.status, error.message));
};

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
};
