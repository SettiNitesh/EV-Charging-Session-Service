import patchSessionController from './patch-session.js';
import postSessionStartController from './post-start-session.js';
import postStopSessionController from './post-stop-session.js';

export default {
  postSessionStart: postSessionStartController,
  postSessionStop: postStopSessionController,
  patchSession: patchSessionController,
};
