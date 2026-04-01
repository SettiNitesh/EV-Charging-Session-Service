import CustomError from '../custom-error.js';

import { ERROR_CODES } from './error-codes.js';

export const SessionNotActiveError = () =>
  CustomError.create({
    httpCode: ERROR_CODES.SESSION_NOT_ACTIVE_ERROR.statusCode,
    message: ERROR_CODES.SESSION_NOT_ACTIVE_ERROR.message,
    httpStatusCode: ERROR_CODES.SESSION_NOT_ACTIVE_ERROR.name,
    description: ERROR_CODES.SESSION_NOT_ACTIVE_ERROR.description,
  });

export const InvalidStopRequestError = () =>
  CustomError.create({
    httpCode: ERROR_CODES.INVALID_STOP_REQUEST_ERROR.statusCode,
    message: ERROR_CODES.INVALID_STOP_REQUEST_ERROR.message,
    httpStatusCode: ERROR_CODES.INVALID_STOP_REQUEST_ERROR.name,
    description: ERROR_CODES.INVALID_STOP_REQUEST_ERROR.description,
  });
