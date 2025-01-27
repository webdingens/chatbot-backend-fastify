import fastify from "../fastify.js";

fastify.post("/", async function handler(request, reply) {
  const authHeader = request.headers.authorization;
  const apiKeyMatches = /^Bearer (.*)$/.exec(authHeader ?? "");
  const apiKey = apiKeyMatches ? apiKeyMatches[1] : null;

  if (apiKey === null) {
    return reply.status(401).send({
      success: false,
      message: "Unauthorized",
    });
  }

  return reply.status(200).send({
    success: true,
    apiKey: apiKey,
    data: request.body,
  });
});
