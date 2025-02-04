// Docs: https://ts.llamaindex.ai/docs/llamaindex/getting_started/starter_tutorial/structured_data_extraction

import z from "zod";
import fastify from "../fastify.js";
import { queryPGVectorStoreReducedData } from "../utils/db.js";
import { OpenAI } from "llamaindex";
import { MessagesList } from "../utils/MessagesList.js";

const QuerySchema = z.object({
  query: z.string(),
  context: z.string().optional(),
});

const llm = new OpenAI({
  model: "gpt-3.5-turbo",
  // additionalChatOptions: { response_format: { type: "text" } },
});

fastify.post("/chat", async function handler(request, reply) {
  const body = QuerySchema.safeParse(request.body);

  if (!body.success) return reply.status(400).send(body.error);

  const { query, context } = body.data;

  const mappedData = (await queryPGVectorStoreReducedData(query)) ?? [];

  const filteredData = mappedData.filter((d) => (d.score ?? 0) > 0.6);

  if (filteredData.length === 0) {
    return reply.status(200).send({
      success: false,
      embed: mappedData,
    });
  }

  const messageList = constructMessagesList(query, context, filteredData);

  const response = await llm.chat({
    messages: messageList.messages,
  });

  return reply.status(200).send({
    success: true,
    answer: response.message.content,
    embed: filteredData,
  });
});

function constructMessagesList(
  query: string,
  context?: string,
  embeddings?: Awaited<ReturnType<typeof queryPGVectorStoreReducedData>>
) {
  const messageList = new MessagesList();

  // add the context if provided by the request (chatbot)
  if (context) messageList.addMessage(context, "system");

  // add embeddings as context
  messageList.addMessage(
    `Answer all questions with the following information:`,
    "user"
  );
  embeddings?.forEach((e) =>
    messageList.addMessage(`Title: ${e.title}\nContent: ${e.text}`, "user")
  );

  // finally add the user prompt
  messageList.addMessage(query, "user");
  return messageList;
}
