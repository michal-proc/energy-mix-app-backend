import { ResponseStatus } from '../enums/response-status.enum';

export class AppError extends Error {
  public readonly httpStatus: number;
  public readonly status: ResponseStatus;

  constructor(httpStatus: number, status: ResponseStatus, message: string) {
    super(message);
    this.name = new.target.name;
    this.httpStatus = httpStatus;
    this.status = status;
    Error.captureStackTrace?.(this, new.target);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, ResponseStatus.NOT_FOUND, message);
  }
}
