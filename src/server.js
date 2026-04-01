import { getFastify } from "./app.js";

getFastify().then((app) => {
  const { PORT, HOST } = app.config;
  app.listen({ port: PORT, host: HOST }, (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.info(`Server listening on http://${HOST}:${PORT}`);
  });
});
