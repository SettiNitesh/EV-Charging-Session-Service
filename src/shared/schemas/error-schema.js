export const commonErrorSchema = {
  type: "object",
  properties: {
    errors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", nullable: true },
          httpCode: { type: "number", default: 500 },
          message: { type: "string" },
          property: { type: "string" },
          httpStatusCode: { type: "string" },
          description: { type: "string", nullable: true },
        },
      },
    },
  },
};

export const errorSchemas = {
  401: commonErrorSchema,
  403: commonErrorSchema,
  404: commonErrorSchema,
  405: commonErrorSchema,
  415: commonErrorSchema,
  409: commonErrorSchema,
  429: commonErrorSchema,
  500: commonErrorSchema,
  502: commonErrorSchema,
  504: commonErrorSchema,
};
