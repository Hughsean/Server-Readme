// client/lib/src/apis/ConversationsApi.ts

import { request } from '../http/httpClient';
import type { Conversation, ConversationMessage } from '../types/conversation';

export class ConversationsApi {
  listByUser(userId: number) {
    return request<Conversation[]>('GET', `/api/conversations/lists/${userId}`);
  }

  /**
   * 获取会话消息内容，仅返回 senderRole 为 user 或 assistant 的消息
   */
  getContents(convId: number) {
    return request<ConversationMessage[]>('GET', `/api/conversations/contents/${convId}`);
  }
}
