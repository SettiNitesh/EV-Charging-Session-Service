import { randomUUID } from 'node:crypto';
import { SESSION_STATUS } from '../../../domain/constants/constants.js';
import { sessionEntity } from '../../../domain/entities/session.entity.js';
import {
  IdempotencyRepository,
  SessionRepository,
} from '../../../infrastructure/repositories/index.js';

const findExistingIdempotency = ({ findOne, mongo, idempotencyKey, type }) =>
  findOne.call(mongo, { filters: { idempotencyKey, ...(type && { type }) } });

const saveIdempotencyRecord = ({ insertOne, mongo, idempotencyKey, type, response }) =>
  insertOne.call(mongo, {
    data: { idempotencyKey, type, response, createdAt: new Date() },
  });

const startSessionUsecase = (fastify) => {
  const { insertOne: insertSession, updateOne: updateSession } = SessionRepository(fastify);
  const { insertOne: saveIdempotency, findOne: findIdempotency } = IdempotencyRepository(fastify);

  return async ({ data, idempotencyKey }) => {
    // 1. Check idempotency — return early if request was already processed
    if (idempotencyKey) {
      const existing = await findExistingIdempotency({
        findOne: findIdempotency,
        mongo: fastify.mongo,
        idempotencyKey,
        type: 'START',
      });
      if (existing?.response) return existing.response;
    }

    // 2. Create as CREATED, then move to ACTIVE (lifecycle: CREATED → ACTIVE)
    const session = sessionEntity({
      id: randomUUID(),
      userId: data.userId,
      stationId: data.stationId,
    });

    await insertSession.call(fastify.mongo, { data: session });

    await updateSession.call(fastify.mongo, {
      filters: { sessionId: session.sessionId },
      update: { $set: { status: SESSION_STATUS.ACTIVE } },
    });

    const activeSession = { ...session, status: SESSION_STATUS.ACTIVE };

    // 3. Persist idempotency record (safe — handles duplicate key race condition)
    if (idempotencyKey) {
      try {
        await saveIdempotencyRecord({
          insertOne: saveIdempotency,
          mongo: fastify.mongo,
          idempotencyKey,
          type: 'START',
          response: activeSession,
        });
      } catch (error) {
        if (error.code === 11000) {
          const existing = await findExistingIdempotency({
            findOne: findIdempotency,
            mongo: fastify.mongo,
            idempotencyKey,
            type: 'START',
          });
          return existing.response;
        }
        throw error;
      }
    }

    return activeSession;
  };
};

export default startSessionUsecase;
