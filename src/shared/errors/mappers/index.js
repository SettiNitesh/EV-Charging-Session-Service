import { basic } from "./basic.js";
import paramsValidation from "./params-validation.js";
import unstructuredError from "./unstructured-error.js";

export const DEFAULT_MAPPERS = [basic, paramsValidation, unstructuredError];
