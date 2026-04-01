export const schema = {
  type: "object",
  properties: {
    PORT: {
      type: "number",
      default: 3000,
    },
    HOST: {
      type: "string",
      default: "0.0.0.0",
    },
    NODE_ENV: {
      type: "string",
      enum: ["development", "production", "local"],
      default: "local",
    },
    LOG_LEVEL: {
      type: "string",
      enum: ["debug", "info", "warn", "error"],
    },
    /** Alias for LOG_LEVEL (optional; also read from process.env before Fastify boots). */
    LEVEL: {
      type: "string",
      enum: ["debug", "info", "warn", "error"],
    },
    DATABASE_URL: { type: "string" },
    /**
     * When "true", use directConnection (avoids Docker replica-set advertising container hostnames).
     * When "false", disable. Omit to auto-enable for single-host localhost URIs.
     */
    MONGO_DIRECT_CONNECTION: { type: "string", enum: ["true", "false"] },
  },
};
