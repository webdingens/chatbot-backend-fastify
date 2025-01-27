import z from "zod";
import fastify from "../fastify.js";
import { queryPGVectorStoreReducedData } from "../utils/db.js";
import { MessageType, OpenAI, SimpleChatEngine } from "llamaindex";

const QuerySchema = z.object({
  query: z.string(),
});

const llm = new OpenAI({
  model: "gpt-3.5-turbo",
  // additionalChatOptions: { response_format: { type: "text" } },
});

fastify.post("/chat", async function handler(request, reply) {
  const body = QuerySchema.safeParse(request.body);

  if (!body.success) return reply.status(400).send(body.error);

  const { query } = body.data;

  const mappedData = (await queryPGVectorStoreReducedData(query)) ?? [];

  const filteredData = mappedData.filter((d) => (d.score ?? 0) > 0.6);

  if (filteredData.length === 0) {
    return reply.status(200).send({
      success: false,
      embed: mappedData,
    });
  }

  const embedData = filteredData.map((e) => ({
    content: `Titel: ${e.title}\nURL: ${e.url.split("/").join(" ")}\nContent: ${
      e.text
    }`,
    role: "system",
  })) as {
    content: string;
    role: MessageType;
  }[];

  const response = await new SimpleChatEngine({
    llm,
  }).chat({
    message: query,
    chatHistory: [
      {
        content:
          "Du bist angestellt bei einem Einkaufszentrum und hilfst Personen die etwas über das Einkaufszentrum erfahren wollen.",
        role: "system",
      },
      {
        content: `Beantworte folgende Fragen mit diesen Informationen:`,
        role: "system",
      },
      ...embedData,
    ],
    stream: false,
  });
  return reply.status(200).send(response);
});
