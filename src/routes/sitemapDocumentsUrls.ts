import fastify from "../fastify.js";
import { z } from "zod";
import { getSitemapUrls } from "../utils/getSitemapUrls.js";

const QuerySchema = z.object({
  url: z.string(),
});

fastify.post("/sitemap-documents-urls", async function handler(request, reply) {
  const parsedQuery = QuerySchema.safeParse(request.body);

  if (!parsedQuery.success) return reply.status(400).send(parsedQuery.error);

  const urls = await getSitemapUrls(parsedQuery.data.url);

  return reply.status(200).send({
    success: true,
    urls,
  });
});
