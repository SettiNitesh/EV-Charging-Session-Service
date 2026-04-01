import { logQuery } from "../../shared/utils/helpers.js";

const SessionRepository = function (fastify) {
  const insertOne = async function ({ data }) {
    const mongo = this;

    logQuery({
      logger: fastify.log,
      collection: "sessions",
      operation: "insertOne",
      filter: data,
      context: "Create Session",
    });

    await mongo.sessions.insertOne(data);

    return data;
  };

  const findOne = async function ({ filters = {}, session = null }) {
    const mongo = this;

    logQuery({
      logger: fastify.log,
      collection: "sessions",
      operation: "findOne",
      filter: filters,
      context: "Find By Session",
    });

    return mongo.sessions.findOne(filters, { session });
  };

  const updateOne = async function ({ filters = {}, update, options }) {
    const mongo = this;

    logQuery({
      logger: fastify.log,
      collection: "sessions",
      operation: "updateOne",
      filter: filters,
      context: "Update Session",
    });

    const result = await mongo.sessions.updateOne(filters, update, options);

    return result;
  };

  const findOneAndUpdate = async function ({
    filters = {},
    update,
    options = {},
  }) {
    const mongo = this;

    logQuery({
      logger: fastify.log,
      collection: "sessions",
      operation: "findOneAndUpdate",
      filter: filters,
      context: "Find One And Update Session",
    });

    const result = await mongo.sessions.findOneAndUpdate(
      filters,
      update,
      options,
    );

    return result;
  };

  return { insertOne, findOne, updateOne, findOneAndUpdate };
};

export default SessionRepository;
