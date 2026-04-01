import { StatusCodes } from "http-status-codes";
import { stopSessionUsecase } from "../../../application/usecases/session/index.js";

const postStopSessionController = (fastify) => {
  return async (request, reply) => {
    const { params } = request;

    const stopSession = stopSessionUsecase(fastify);

    const response = await stopSession({
      sessionId: params.id,
    });

    return reply.code(StatusCodes.CREATED).send(response);
  };
};

export default postStopSessionController;
