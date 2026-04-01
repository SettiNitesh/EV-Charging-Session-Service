import { TAGS } from '../../../shared/schemas/index.js';
import { errorSchemas } from '../../../shared/schemas/error-schema.js';
import { sessionRouteHeaders } from '../../../shared/schemas/request-headers.js';

const postStartSessionSchema = {
  tags: [TAGS.SESSION],
  summary: 'This API is to create a session',
  headers: sessionRouteHeaders,
  body: {
    type: 'object',
    required: ['userId', 'stationId'],
    additionalProperties: false,
    properties: {
      userId: { type: 'string' },
      stationId: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', format: 'uuid' },
        userId: { type: 'string' },
        stationId: { type: 'string' },
        status: { type: 'string' },
        energyLogs: { type: 'array' },
        createdAt: { type: 'string', format: 'date-time' },
        stoppedAt: { type: ['string', 'null'], format: 'date-time' },
        cdr: { type: ['object', 'null'] },
      },
      additionalProperties: true,
    },
    ...errorSchemas,
  },
};

export default postStartSessionSchema;
