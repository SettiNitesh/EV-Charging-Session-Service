import { SESSION_STATUS } from '../constants/constants.js';

export const sessionEntity = ({ id, userId, stationId }) => ({
  sessionId: id,
  userId,
  stationId,
  status: SESSION_STATUS.CREATED,
  energyLogs: [],
  createdAt: new Date(),
  stoppedAt: null,
  cdr: null,
});
