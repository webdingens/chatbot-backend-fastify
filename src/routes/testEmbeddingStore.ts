import fastify from "../fastify.js";

import {
  Document,
  OpenAIEmbedding,
  Settings,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";
import { deleteEmbeddingsByUrl, getPGVectorStore } from "../utils/db.js";

Settings.embedModel = new OpenAIEmbedding({
  apiKey: process.env.OPENAI_API_KEY,
});

fastify.post("/test-embedding-store", async function handler(request, reply) {
  const storageContext = await storageContextFromDefaults({
    vectorStore: getPGVectorStore(),
  });

  const data = [
    {
      text: "Cats can get around 400 years old.",
      url: "https://www.cats-can-get-old.com",
    },
    {
      text: "A bird has the most feathers of them all.",
      url: "https://www.birds-and-all-that.com",
    },
  ];

  const documents = [];

  for (const d of data) {
    const document = new Document({
      text: d.text,
      metadata: {
        url: d.url,
      },
    });

    await deleteEmbeddingsByUrl(d.url);

    documents.push(document);
  }

  const index = await VectorStoreIndex.fromDocuments(documents, {
    storageContext,
  });

  console.dir(index, { depth: null });

  return reply.status(200);
});
