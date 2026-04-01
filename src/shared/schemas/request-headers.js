export const sessionRouteHeaders = {
  type: "object",
  properties: {
    "idempotency-key": { type: "string" },
  },
  additionalProperties: true,
};
