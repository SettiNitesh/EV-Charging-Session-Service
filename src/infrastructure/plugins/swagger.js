import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyPlugin from "fastify-plugin";

const swaggerPlugin = async (fastify) => {
  try {
    await fastify.register(fastifySwagger, {
      openapi: {
        info: {
          title: "Microservice Template",
          description:
            "This is a microservice template for Node.js with TypeScript and Fastify.",
          version: "1.0.0",
        },
      },
      transform: ({ schema, url }) => {
        if (schema?.response) {
          const allowedCodes = ["200", "201", "400", "401", "404"];

          const filteredResponse = {};

          allowedCodes.forEach((code) => {
            if (
              typeof schema.response === "object" &&
              schema.response !== null &&
              Object.prototype.hasOwnProperty.call(schema.response, code)
            ) {
              filteredResponse[code] = schema.response[code];
            }
          });

          schema.response = filteredResponse;
        }

        return { schema, url };
      },
    });

    await fastify.register(fastifySwaggerUi, {
      routePrefix: "/docs",
      uiConfig: {
        docExpansion: "list",
        deepLinking: false,
      },
      staticCSP: true,
    });
    fastify.log.info("Swagger Plugin Loaded Successfully");
  } catch (err) {
    fastify.log.error(err, "Error in Swagger Plugin");
  }
};

export default fastifyPlugin(swaggerPlugin);
