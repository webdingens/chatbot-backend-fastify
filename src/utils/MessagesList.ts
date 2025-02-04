import { MessageType } from "llamaindex";

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
