import { TAGS } from "../../../shared/schemas/index.js";
import { errorSchemas } from "../../../shared/schemas/error-schema.js";
import { sessionRouteHeaders } from "../../../shared/schemas/request-headers.js";

const patchSessionSchema = {
  tags: [TAGS.SESSION],
  summary: "This API is to update a session",
  headers: sessionRouteHeaders,
  params: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
    },
    required: ["id"],
    additionalProperties: false,
  },
  body: {
    type: "object",
    required: ["energy"],
    additionalProperties: false,
    properties: {
      energy: { type: "number" },
    },
  },
  response: {
    200: { type: "object", properties: { success: { type: "boolean" } } },
    ...errorSchemas,
  },
};

export default patchSessionSchema;
