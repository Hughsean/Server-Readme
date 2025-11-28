// client/lib/src/types/conversation.ts

export interface Conversation {
  id?: number;
  userId?: number;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  // TODO: 补充后端字段
  [key: string]: unknown;
}

export interface ConversationMessage {
  id?: number;
  conversationId?: number;
  senderRole?: string; // user | assistant | system | plugin
  senderUserId?: number | null;
  messageType?: string; // text | image | event
  content?: string; // JSON string or plain text
  tokenCount?: number;
  createdAt?: string;
  [key: string]: unknown;
}
