import fastify from "../fastify.js";

console.log("rootGet");

fastify.get("/", async function (req, reply) {
  return reply.sendFile("index.html");
});
