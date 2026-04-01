import { logQuery } from '../../shared/utils/helpers.js';

const IdempotencyRepository = function (fastify) {
  const insertOne = async function ({ data }) {
    const mongo = this;

    logQuery({
      logger: fastify.log,
      collection: 'idempotency',
      operation: 'insertOne',
      filter: data,
      context: 'Create Idempotency Record',
    });

    await mongo.idempotency.insertOne(data);

    return data;
  };

  const findOne = async function ({ filters = {} }) {
    const mongo = this;

    logQuery({
      logger: fastify.log,
      collection: 'idempotency',
      operation: 'findOne',
      filter: filters,
      context: 'Find Idempotency Record',
    });

    return mongo.idempotency.findOne(filters);
  };

  return { insertOne, findOne };
};

export default IdempotencyRepository;
