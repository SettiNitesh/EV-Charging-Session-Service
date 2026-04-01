import pino from "pino";

export function getFastifyLoggerOptions() {
  const nodeEnv = process.env.NODE_ENV || "local";
  const isDev = ["development", "local"].includes(nodeEnv);
  const level = process.env.LOG_LEVEL || "info";

  if (!isDev) {
    return { level };
  }

  return {
    level,
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        levelFirst: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
        singleLine: false,
      },
    },
  };
}

/** Standalone pino (e.g. scripts); same rules as Fastify. */
export function createRootLogger() {
  return pino(getFastifyLoggerOptions());
}

export default createRootLogger;
