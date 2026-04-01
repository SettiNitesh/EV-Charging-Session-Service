const requestParams = (request) => {
  return {
    url: request.url,
    method: request.method,
    query_params: request.query,
    body: request.body,
    raw_headers: request.headers,
  };
};

export const requestLogging = async (request) => {
  if (request.url === '/health') return;

  request.log.info({
    message: 'Incoming Request',
    log_trace: request.logTrace,
    request: requestParams(request),
  });
};

export const responseLogging = async (request, reply) => {
  if (request.url === '/health') return;

  request.log.info({
    message: 'Server Response',
    log_trace: request.logTrace,
    request: requestParams(request),
    response: {
      status_code: reply.statusCode,
      response_time: reply.elapsedTime,
    },
  });
};

export const extractLogTrace = async (request) => {
  const key = request.headers['idempotency-key'];
  request.logTrace = key ? { 'idempotency-key': key } : {};
};
