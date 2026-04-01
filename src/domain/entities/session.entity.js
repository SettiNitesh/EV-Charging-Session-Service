import { SESSION_STATUS } from "../constants/constants.js";

export const sessionEntity = ({ id, userId, stationId }) => ({
  sessionId: id,
  userId,
  stationId,
  status: SESSION_STATUS.ACTIVE,
  energyLogs: [],
  createdAt: new Date(),
  stoppedAt: null,
  cdr: null,
});
