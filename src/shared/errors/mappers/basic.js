import CustomError from '../custom-error.js';

export const basic = (error) => {
  if (error instanceof CustomError) {
    return error;
  }
  return undefined;
};
