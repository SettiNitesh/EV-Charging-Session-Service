import { SESSION_STATUS } from "../../../domain/constants/constants.js";
import TraiffService from "../../../domain/services/tariffService.js";
import SessionRepository from "../../../infrastructure/repositories/session-repository.js";
import { InvalidStopRequestError } from "../../../shared/errors/domain/errors.js";

const stopSessionUsecase = (fastify) => {
  const { updateOne, findOneAndUpdate } = SessionRepository(fastify);

  const { calculate } = TraiffService();

  return async ({ sessionId }) => {
    const mongoSession = fastify.mongo.client.startSession();

    try {
      let result;

      await mongoSession.withTransaction(async () => {
        const sessionData = await findOneAndUpdate.call(fastify.mongo, {
          filters: { sessionId, status: SESSION_STATUS.ACTIVE, cdr: null },
          update: {
            $set: {
              status: SESSION_STATUS.STOPPED,
              stoppedAt: new Date(),
            },
          },
          options: { returnDocument: "before", session: mongoSession },
        });

        if (!sessionData) throw InvalidStopRequestError();

        const session = sessionData;

        const totalEnergy = session.energyLogs.reduce(
          (sum, e) => sum + e.value,
          0,
        );

        const duration = (Date.now() - new Date(session.createdAt)) / 60000;

        const tariff = calculate({ energy: totalEnergy, duration });

        const cdr = {
          sessionId,
          totalEnergy,
          totalDuration: duration,
          totalCost: tariff.totalCost,
          tariff,
          stoppedAt: new Date(),
        };

        await updateOne.call(fastify.mongo, {
          filters: { sessionId },
          update: {
            $set: {
              status: SESSION_STATUS.COMPLETED,
              cdr,
            },
          },
          options: { session: mongoSession },
        });

        result = cdr;
      });

      return result;
    } catch (error) {
      fastify.log.error({ error });
      throw error;
    } finally {
      await mongoSession.endSession();
    }
  };
};

export default stopSessionUsecase;
