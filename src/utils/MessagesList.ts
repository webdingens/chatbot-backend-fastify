import { MessageType } from "llamaindex";
import { queryPGVectorStoreReducedData } from "./db";

export class MessagesList {
  _messages: {
    content: string;
    role: MessageType;
  }[] = [];
  addMessage(content: string, role: MessageType) {
    this._messages.push({
      content,
      role,
    });
  }
  get messages() {
    return this._messages;
  }
}

export function constructMessagesList(
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
    "system"
  );
  embeddings?.forEach((e) =>
    messageList.addMessage(`Title: ${e.title}\nContent: ${e.text}`, "system")
  );

  // finally add the user prompt
  messageList.addMessage(query, "user");
  return messageList;
}
