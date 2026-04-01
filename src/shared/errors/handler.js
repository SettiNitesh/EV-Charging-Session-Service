import { ERROR_WHILE_PROCESSING_REQUEST, INTERNAL_SERVER_ERROR } from './constants.js';
import CustomError from './custom-error.js';
import { getError, getRequest } from './helper.js';
import { DEFAULT_MAPPERS } from './mappers/index.js';

export const errorHandler = (options, mappers = DEFAULT_MAPPERS) => {
  return async function ErrorHandler(error, request, reply) {
    /* Error handling */
    const errorObject = {
      request: getRequest(request),
      error: getError(error),
      log_trace: request.logTrace,
      message: ERROR_WHILE_PROCESSING_REQUEST,
    };

    for (const mapper of mappers) {
      const resp = mapper(error, options);
      if (resp) {
        if (!(request.raw.method === 'GET' && resp.code === 404)) {
          request.log.error(errorObject);
        }
        return reply.code(resp.code || 500).send(resp.response);
      }
    }

    request.log.error(errorObject);

    const unhandledError = CustomError.create({
      httpCode: 500,
      httpStatusCode: INTERNAL_SERVER_ERROR,
      message: INTERNAL_SERVER_ERROR,
    });

    return reply.code(unhandledError.code || 500).send(unhandledError.response);
  };
};
