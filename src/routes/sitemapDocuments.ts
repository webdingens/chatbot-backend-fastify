import fastify from "../fastify.js";
import { z } from "zod";
import { getDocumentsFromSitemapUrl } from "../utils/getDocumentsFromSitemapUrl.js";

const QuerySchema = z.object({
  url: z.string(),
});

fastify.post("/sitemap-documents", async function handler(request, reply) {
  const parsedQuery = QuerySchema.safeParse(request.body);

  if (!parsedQuery.success) return reply.status(400).send(parsedQuery.error);

  const sitemapUrl = parsedQuery.data.url;
  const documents = await getDocumentsFromSitemapUrl(sitemapUrl, 4);

  return reply.status(200).send({
    success: true,
    documents,
  });
});
