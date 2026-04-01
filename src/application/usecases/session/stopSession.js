import { SESSION_STATUS } from '../../../domain/constants/constants.js';
import TariffService from '../../../domain/services/tariffService.js';
import {
  IdempotencyRepository,
  SessionRepository,
} from '../../../infrastructure/repositories/index.js';
import { InvalidStopRequestError } from '../../../shared/errors/domain/errors.js';

const computeCdr = ({ session, calculate }) => {
  const totalEnergy = session.energyLogs.reduce((sum, e) => sum + e.value, 0);
  const totalDuration = (Date.now() - new Date(session.createdAt)) / 60000;
  const tariff = calculate({ energy: totalEnergy, duration: totalDuration });

  return {
    sessionId: session.sessionId,
    totalEnergy,
    totalDuration,
    totalCost: tariff.totalCost,
    tariff,
    stoppedAt: new Date(),
  };
};

const findIdempotencyRecord = ({ findOne, mongo, idempotencyKey, type }) =>
  findOne.call(mongo, { filters: { idempotencyKey, type } });

const saveIdempotencyRecord = ({ insertOne, mongo, idempotencyKey, type, response }) =>
  insertOne.call(mongo, {
    data: { idempotencyKey, type, response, createdAt: new Date() },
  });

const stopSessionUsecase = (fastify) => {
  const { updateOne, findOneAndUpdate, findOne } = SessionRepository(fastify);
  const { findOne: findIdempotency, insertOne: saveIdempotency } = IdempotencyRepository(fastify);
  const { calculate } = TariffService();

  return async ({ sessionId, idempotencyKey }) => {
    // 1. Check idempotency — return early if request was already processed
    if (idempotencyKey) {
      const existing = await findIdempotencyRecord({
        findOne: findIdempotency,
        mongo: fastify.mongo,
        idempotencyKey,
        type: 'STOP',
      });
      if (existing?.response) return existing.response;
    }

    // 2. Atomically mark session as stopped (outside transaction)
    const session = await findOneAndUpdate.call(fastify.mongo, {
      filters: { sessionId, status: SESSION_STATUS.ACTIVE, cdr: null },
      update: {
        $set: { status: SESSION_STATUS.STOPPED, stoppedAt: new Date() },
      },
      options: { returnDocument: 'before' },
    });

    // 3. Guard: session already stopped or not found
    if (!session) {
      const existing = await findOne.call(fastify.mongo, {
        filters: { sessionId },
      });
      if (existing?.cdr) return existing.cdr;
      throw InvalidStopRequestError();
    }

    // 4. Compute billing and persist CDR inside a transaction
    const mongoSession = fastify.mongo.client.startSession();

    try {
      let cdr;

      await mongoSession.withTransaction(async () => {
        cdr = computeCdr({ session, calculate });

        await updateOne.call(fastify.mongo, {
          filters: { sessionId },
          update: { $set: { status: SESSION_STATUS.COMPLETED, cdr } },
          options: { session: mongoSession },
        });
      });

      // 5. Persist idempotency record
      if (idempotencyKey) {
        try {
          await saveIdempotencyRecord({
            insertOne: saveIdempotency,
            mongo: fastify.mongo,
            idempotencyKey,
            type: 'STOP',
            response: cdr,
          });
        } catch (error) {
          if (error.code === 11000) {
            const existing = await findIdempotencyRecord({
              findOne: findIdempotency,
              mongo: fastify.mongo,
              idempotencyKey,
              type: 'STOP',
            });
            return existing.response;
          }
          throw error;
        }
      }

      return cdr;
    } finally {
      await mongoSession.endSession();
    }
  };
};

export default stopSessionUsecase;
