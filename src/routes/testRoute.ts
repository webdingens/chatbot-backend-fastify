import fastify from "../fastify.js";
import {
  SentenceSplitter,
  TitleExtractor,
  Document,
  IngestionPipeline,
  OpenAI,
  QuestionsAnsweredExtractor,
} from "llamaindex";

fastify.post("/test", async function handler(request, reply) {
  const OpenAILowTempTurbo = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-3.5-turbo",
    temperature: 0,
  });

  const pipeline = new IngestionPipeline({
    transformations: [
      new SentenceSplitter({ chunkSize: 1024, chunkOverlap: 20 }),
      new QuestionsAnsweredExtractor({
        llm: OpenAILowTempTurbo,
      }),
      new TitleExtractor({
        llm: OpenAILowTempTurbo,
      }),
    ],
  });

  const nodes = await pipeline.run({
    documents: [
      new Document({
        text: "Cats can get around 400 years old.",
        metadata: {
          url: "https://www.cats-can-get-old.com",
        },
      }),
    ],
  });

  console.dir(nodes, { depth: null });

  return reply.status(200);
});
