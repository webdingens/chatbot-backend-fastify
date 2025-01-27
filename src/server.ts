import "./env.js";
import fastify from "./fastify.js";
import "./plugins/index.js";
import "./routes/index.js";

try {
  const serverConfig = {
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    host: process.env.HOST ?? "127.0.0.1",
  };
  await fastify.listen(serverConfig);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
