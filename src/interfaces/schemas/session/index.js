import patchSessionSchema from './patch-session.js';
import postStartSessionSchema from './post-start-session.js';
import postStopSessionSchema from './post-stop-session.js';

export default {
  postStartSession: postStartSessionSchema,
  patchSession: patchSessionSchema,
  postStopSession: postStopSessionSchema,
};
