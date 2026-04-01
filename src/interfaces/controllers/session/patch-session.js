import { StatusCodes } from "http-status-codes";
import { updateSessionUsecase } from "../../../application/usecases/session/index.js";

const patchSessionController = (fastify) => {
  return async (request, reply) => {
    const { body, params } = request;

    const updateSession = updateSessionUsecase(fastify);

    const response = await updateSession({
      sessionId: params.id,
      energy: body.energy,
    });

    return reply.code(StatusCodes.OK).send(response);
  };
};

export default patchSessionController;
