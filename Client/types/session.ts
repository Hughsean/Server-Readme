// client/lib/src/types/session.ts

export interface SessionCreateRequest {
  userId: number;
  dialogueId?: number;
  /**
   * 客户端传递的地理位置信息
   * 例如: { country: '中国', province: '广东省', city: '深圳市' }
   */
  location?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SessionCreateResponse {
  sessionId: string;
  prompt?: string | null;
  clientIp?: string | null;
  location?: Record<string, unknown> | null;
  // 画像对象改为与后端 DTO 对齐
  userProfile?: import('./profile').UserProfileDto | null;
  timeoutSeconds?: number;
  dialogueId?: number | null;
}

export interface MessageRequest {
  text: string;
  emotion?: string | null;
}

export interface MessageResponse {
  sessionId: string;
  reply?: string | null;
  toolCalls?: Array<Record<string, unknown>> | null;
  sessionClosed?: boolean;
  dialogueId?: number | null;
  title?: string | null;
}

export interface SessionStatusResponse {
  sessionId: string;
  userId?: number | null;
  dialogueId?: number | null;
  lastActive?: string | null; // ISO timestamp
  location?: Record<string, unknown> | null;
  timeoutSeconds?: number;
}

export interface CloseSessionResponse {
  sessionId: string;
  saved: boolean;
  message?: string;
}
