import controllers from '../controllers/index.js';
import schemas from '../schemas/index.js';

const sessionRoutes = async (fastify) => {
  const { sessionControllers } = controllers;
  const { sessionSchemas } = schemas;

  fastify.route({
    method: 'POST',
    url: '/session',
    schema: sessionSchemas.postStartSession,
    handler: sessionControllers.postSessionStart(fastify),
  });
  fastify.route({
    method: 'PATCH',
    url: '/session/:id',
    schema: sessionSchemas.patchSession,
    handler: sessionControllers.patchSession(fastify),
  });
  fastify.route({
    method: 'POST',
    url: '/session/:id/stop',
    schema: sessionSchemas.postStopSession,
    handler: sessionControllers.postSessionStop(fastify),
  });
};

export default sessionRoutes;
