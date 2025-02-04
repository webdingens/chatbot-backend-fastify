import fastify from "../fastify.js";

fastify.get("/", async function (req, reply) {
  return reply.sendFile("index.html");
});
