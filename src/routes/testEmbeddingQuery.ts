import z from "zod";
import fastify from "../fastify.js";
import { queryPGVectorStoreReducedData } from "../utils/db.js";

const QuerySchema = z.object({
  query: z.string(),
});

fastify.post("/test-embedding-query", async function handler(request, reply) {
  const body = QuerySchema.safeParse(request.body);

  if (!body.success) return reply.status(400).send(body.error);

  const { query } = body.data;

  const mappedData = await queryPGVectorStoreReducedData(query);

  return reply.status(200).send({ mappedData });
});
