export const schema = {
  type: 'object',
  properties: {
    PORT: {
      type: 'integer',
      default: 3000,
    },
    HOST: {
      type: 'string',
      default: '0.0.0.0',
    },
    NODE_ENV: {
      type: 'string',
      enum: ['development', 'production', 'local'],
      default: 'local',
    },
    LOG_LEVEL: {
      type: 'string',
      enum: ['debug', 'info', 'warn', 'error'],
    },
    DATABASE_URL: {
      type: 'string',
      default: 'mongodb://127.0.0.1:27017/ev_charging',
    },

    MONGO_DIRECT_CONNECTION: { type: 'string', enum: ['true', 'false'] },
  },
};
