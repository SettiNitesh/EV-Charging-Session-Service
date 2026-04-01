import { STATUS_CODES } from "http";

import { STATUS_TEXTS } from "./constants.js";

class CustomError extends Error {
  constructor(httpCode, errors) {
    super();
    this._code = httpCode;
    this._errors = this.getErrorArr(errors);
  }
  getErrorArr(errors) {
    if (!(errors || errors?.length)) {
      return [
        {
          message: STATUS_TEXTS[this._code],
          code: STATUS_CODES[this._code],
        },
      ];
    }
    return errors;
  }

  get code() {
    return this._code;
  }

  get response() {
    return { errors: this._errors };
  }

  static create({
    httpCode,
    message,
    property,
    httpStatusCode,
    description,
    name,
  }) {
    const parseData = {
      httpCode,
      message,
      ...(property && { property }),
      ...(httpStatusCode && { httpStatusCode }),
      ...(description && { description }),
      ...(name && { name }),
    };
    const errors = [this.parse(parseData)];
    return new CustomError(httpCode, errors);
  }

  static parse({
    name,
    httpCode,
    message,
    property,
    httpStatusCode,
    description,
  }) {
    return {
      httpCode,
      message,
      ...(name && { name }),
      ...(property && { property }),
      ...(httpStatusCode && { httpStatusCode }),
      ...(description && { description }),
    };
  }

  static createHttpError({ httpCode, errorResponse }) {
    return new CustomError(httpCode, errors);
  }
}

export default CustomError;
