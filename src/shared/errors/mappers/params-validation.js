import { REQUEST_VALIDATION_ERROR } from "../constants.js";
import CustomError from "../custom-error.js";
import { getPropertyPath } from "../helper.js";

const DEFAULT_OPTIONS = { showAllowedValues: true };

const paramsValidation = (error, options = DEFAULT_OPTIONS) => {
  if (error.validation) {
    /* Return a custom error with the validation errors. */
    const errors = error.validation.map((val) => {
      const property = getPropertyPath(val);

      let message = `${error.validationContext} ${val.message}`;

      if (val.params && val.params.additionalProperty) {
        message = `${message} '${val.params.additionalProperty}'`;
      }

      if (options.showAllowedValues && val.params && val.params.allowedValues) {
        message += ` are ${val.params.allowedValues.join(",")}`;
      }

      return { property, message, code: REQUEST_VALIDATION_ERROR };
    });

    return new CustomError(400, errors);
  }

  return null;
};

export default paramsValidation;
