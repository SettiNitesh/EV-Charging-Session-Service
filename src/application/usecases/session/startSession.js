import { randomUUID } from "node:crypto";

import { sessionEntity } from "../../../domain/entities/session.entity.js";
import {
  IdempotencyRepository,
  SessionRepository,
} from "../../../infrastructure/repositories/index.js";

const startSessionUsecase = (fastify) => {
  const { insertOne } = SessionRepository(fastify);
  const { insertOne: saveIdempotency, findOne: findIdempotency } =
    IdempotencyRepository(fastify);

  return async ({ data, idempotencyKey }) => {
    if (idempotencyKey) {
      const existing = await findIdempotency.call(fastify.mongo, {
        filters: { idempotencyKey },
      });

      if (existing?.session) return existing.session;
    }

    const session = sessionEntity({
      id: randomUUID(),
      userId: data.userId,
      stationId: data.stationId,
    });

    await insertOne.call(fastify.mongo, { data: session });

    if (idempotencyKey) {
      await saveIdempotency.call(fastify.mongo, {
        data: {
          idempotencyKey,
          session,
        },
      });
    }

    return session;
  };
};

export default startSessionUsecase;
