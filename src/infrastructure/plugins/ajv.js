import Ajv from 'ajv';
import AjvErrors from 'ajv-errors';
import addFormats from 'ajv-formats';
import AjvKeywords from 'ajv-keywords';
import fastifyPlugin from 'fastify-plugin';

const defaultAjvSettings = {
  removeAdditional: false, // remove additional properties
  useDefaults: true, // replace missing properties with default values
  coerceTypes: true, // change data type of data to match type keyword
  allErrors: true, // check all rules before reporting errors
};

const defaultAjvKeywords = [
  'transform',
  'uniqueItemProperties',
  'allRequired',
  'anyRequired',
  'oneRequired',
  'patternRequired',
];

const validateSchema =
  (ajv) =>
  ({ schema, data, key }) => {
    let validate = ajv.getSchema(key);

    if (!validate) {
      ajv.addSchema(schema, key);
      validate = ajv.getSchema(key);
    }

    if (!validate?.(data)) {
      return { success: false, errors: validate?.errors };
    }

    return { success: true };
  };

const ajvPlugin = async (
  fastify,
  { settings = defaultAjvSettings, keywords = defaultAjvKeywords },
) => {
  try {
    const ajv = new Ajv(settings);
    AjvKeywords(ajv, keywords);
    AjvErrors(ajv);
    addFormats(ajv);
    fastify.decorate('validateSchema', validateSchema(ajv));
    fastify.setValidatorCompiler(({ schema }) => {
      return ajv.compile(schema);
    });
    fastify.log.info('Adding AJV schemas');
  } catch (err) {
    fastify.log.error(err);
    fastify.log.error('AJV compilation failed');
    throw new Error(`AJV compilation failed: ${err?.message ?? err}`, { cause: err });
  }
};

export default fastifyPlugin(ajvPlugin);
