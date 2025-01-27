import fastify from "../fastify.js";
import { z } from "zod";
import { getDocumentsFromSitemapUrl } from "../utils/getDocumentsFromSitemapUrl.js";
import {
  OpenAIEmbedding,
  SentenceSplitter,
  Settings,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";
import { deleteEmbeddingsByUrl, getPGVectorStore } from "../utils/db.js";

Settings.embedModel = new OpenAIEmbedding();

const QuerySchema = z.object({
  url: z.string(),
});

fastify.post("/post-embed-sitemap", async function handler(request, reply) {
  const parsedQuery = QuerySchema.safeParse(request.body);

  if (!parsedQuery.success) return reply.status(400).send(parsedQuery.error);

  const sitemapUrl = parsedQuery.data.url;
  const documents = await getDocumentsFromSitemapUrl(sitemapUrl);

  const storageContext = await storageContextFromDefaults({
    vectorStore: getPGVectorStore(),
  });

  for (const d of documents) {
    await deleteEmbeddingsByUrl(d.metadata.url);
  }

  // setting the node parser here it will be used to split up too large documents
  // see https://ts.llamaindex.ai/docs/llamaindex/modules/node_parser
  Settings.nodeParser = new SentenceSplitter({
    chunkSize: 512,
    chunkOverlap: 160,
  });

  const index = await VectorStoreIndex.fromDocuments(documents, {
    storageContext,
  });

  return reply.status(200).send(index);
});
