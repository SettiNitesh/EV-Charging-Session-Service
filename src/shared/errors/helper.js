import util from "util";

import {
  NO_BODY_FOUND,
  NO_CODE_FOUND,
  NO_DETAIL_FOUND,
  NO_HEADERS_FOUND,
  NO_MESSAGE_FOUND,
  NO_METHOD_FOUND,
  NO_STACK_FOUND,
  NO_URL_FOUND,
} from "./constants.js";

export const formatDetail = (detail) => {
  if (typeof detail === "string" || detail instanceof String) {
    return detail;
  }
  return util.inspect(detail);
};

export const getRequest = (request) => {
  return {
    url: request?.raw.url || NO_URL_FOUND,
    headers: request.headers || NO_HEADERS_FOUND,
    body: request.body || NO_BODY_FOUND,
    method: request?.raw.method || NO_METHOD_FOUND,
  };
};

export const getError = (error) => {
  return {
    data: {
      message: error.message || NO_MESSAGE_FOUND,
      code: error.code || NO_CODE_FOUND,
      detail: error.detail || NO_DETAIL_FOUND,
    },
    innerError: { stack: error.stack || NO_STACK_FOUND },
  };
};

export const getPropertyPath = (val) => {
  let path = "";

  path =
    val.params.missingProperty ||
    val.params.additionalProperty ||
    val.params.propertyName ||
    val.instancePath ||
    val.dataPath ||
    "empty_property_key";

  return path.replace(".", "").replace("/", "");
};
