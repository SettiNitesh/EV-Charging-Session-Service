import { errorSchemas } from '../../../shared/schemas/error-schema.js';
import { TAGS } from '../../../shared/schemas/index.js';
import { sessionRouteHeaders } from '../../../shared/schemas/request-headers.js';

const tariffRatesSchema = {
  type: 'object',
  properties: {
    energyRate: { type: 'number' },
    timeRate: { type: 'number' },
  },
  additionalProperties: true,
};

const tariffBreakdownSchema = {
  type: 'object',
  properties: {
    energyCost: { type: 'number' },
    timeCost: { type: 'number' },
    totalCost: { type: 'number' },
    tariff: tariffRatesSchema,
  },
  additionalProperties: true,
};

const postStopSessionSchema = {
  tags: [TAGS.SESSION],
  summary: 'Stop a charging session and produce a charge detail record (CDR)',
  headers: sessionRouteHeaders,
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
    required: ['id'],
    additionalProperties: false,
  },
  response: {
    201: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', format: 'uuid' },
        totalEnergy: { type: 'number' },
        totalDuration: { type: 'number' },
        totalCost: { type: 'number' },
        tariff: tariffBreakdownSchema,
        stoppedAt: { type: 'string', format: 'date-time' },
      },
      additionalProperties: true,
    },
    ...errorSchemas,
  },
};

export default postStopSessionSchema;
