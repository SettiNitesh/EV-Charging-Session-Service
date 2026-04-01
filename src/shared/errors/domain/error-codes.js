import { StatusCodes } from 'http-status-codes';

export const ERROR_CODES = {
  SESSION_NOT_ACTIVE_ERROR: {
    name: 'SESSION_NOT_ACTIVE_ERROR',
    message: 'Session not active or already stopped',
    statusCode: StatusCodes.NOT_FOUND,
    description: '',
  },
  INVALID_STOP_REQUEST_ERROR: {
    name: 'INVALID_STOP_REQUEST_ERROR',
    message: 'Session already stopped or invalid',
    statusCode: StatusCodes.NOT_FOUND,
    description: '',
  },
};
