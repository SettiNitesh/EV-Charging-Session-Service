import 'dotenv/config';

import fastifyCors from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import fastify from 'fastify';
import fastifyHealthcheck from 'fastify-healthcheck';

import {
  extractLogTrace,
  requestLogging,
  responseLogging,
} from './infrastructure/hooks/logging/index.js';
import { ajv, idempotency, mongo, swagger } from './infrastructure/plugins/index.js';
import routes from './interfaces/routes/index.js';
import { errorHandler } from './shared/errors/handler.js';
import { schema } from './shared/schemas/env-schema.js';
import { getFastifyLoggerOptions } from './shared/utils/logger.js';

async function buildFastify() {
  const server = fastify({
    logger: getFastifyLoggerOptions(),
  });

  const options = {
    dotenv: true,
    confKey: 'config',
    schema,
    data: process.env,
  };

  await server.register(fastifyHealthcheck);
  await server.register(fastifyEnv, options);

  await server.register(fastifyCors, {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'idempotency-key'],
  });

  await server.register(swagger);
  await server.register(ajv);
  await server.register(mongo);
  await server.register(idempotency);

  server.setErrorHandler(errorHandler());

  server.addHook('onRequest', extractLogTrace);
  server.addHook('preValidation', requestLogging);
  server.addHook('onResponse', responseLogging);

  await server.register(routes.sessionRoutes, { prefix: '/api/v1' });

  return server;
}

let _fastify = null;

function getFastify() {
  if (!_fastify) {
    _fastify = buildFastify().then(async (app) => {
      await app.ready();
      return app;
    });
  }
  return _fastify;
}

export { getFastify };

export default async function handler(req, res) {
  const app = await getFastify();

  app.server.emit('request', req, res);
}
