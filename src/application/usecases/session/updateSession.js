import { SESSION_STATUS } from "../../../domain/constants/constants.js";
import SessionRepository from "../../../infrastructure/repositories/session-repository.js";
import { SessionNotActiveError } from "../../../shared/errors/domain/errors.js";

const updateSessionUsecase = (fastify) => {
  const { findOneAndUpdate } = SessionRepository(fastify);

  return async ({ sessionId, energy }) => {
    const updated = await findOneAndUpdate.call(fastify.mongo, {
      filters: { sessionId, status: SESSION_STATUS.ACTIVE },
      update: {
        $push: { energyLogs: { value: energy, time: new Date() } },
      },
      options: { returnDocument: "after" },
    });

    if (!updated) throw SessionNotActiveError();

    return { success: true };
  };
};

export default updateSessionUsecase;
