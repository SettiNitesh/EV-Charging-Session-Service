import fastifyPlugin from 'fastify-plugin';

const idempotencyPlugin = (fastify) => {
  fastify.decorateRequest('idempotencyKey', null);

  fastify.addHook('preHandler', async (request) => {
    request.idempotencyKey = request.headers['idempotency-key'];
  });
};

export default fastifyPlugin(idempotencyPlugin);
