import Fastify from "fastify";
const fastify = Fastify({
  logger: true,
});

fastify.addHook("onRequest", (request, reply, done) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, DELETE, OPTIONS"
  );
  reply.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept"
  );

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    reply.status(200).send();
    return;
  }

  done();
});

export default fastify;
