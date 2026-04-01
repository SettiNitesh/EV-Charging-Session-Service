import CustomError from '../custom-error.js';

const unstructuredError = (error) => {
  if (error.fieldName && (error.message || error.detail)) {
    return CustomError.create({
      httpCode: error.code || 400,
      message: error.message || error.detail,
      property: error.fieldName,
      httpStatusCode: 'UNSTRUCTURED_ERROR',
    });
  }
  return null;
};

export default unstructuredError;
