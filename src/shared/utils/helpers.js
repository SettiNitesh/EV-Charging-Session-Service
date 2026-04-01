export const logQuery = ({
  logger,
  collection,
  operation,
  filter,
  update,
  projection,
  context,
  logTrace,
}) => {
  logger.debug({
    message: `Mongo Query: ${context}`,
    collection,
    operation,
    filter,
    update,
    projection,
    logTrace,
  });
};
