import { StatusCodes } from "http-status-codes";
import startSessionUsecase from "../../../application/usecases/session/startSession.js";

const postStartSessionController = (fastify) => {
  return async (request, reply) => {
    const { body } = request;

    const idempotencyKey = request.headers["idempotency-key"];

    const startSession = startSessionUsecase(fastify);

    const response = await startSession({
      data: body,
      idempotencyKey,
    });

    return reply.code(StatusCodes.OK).send(response);
  };
};

export default postStartSessionController;
