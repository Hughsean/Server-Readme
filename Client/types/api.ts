// client/lib/src/types/api.ts

export interface ApiResponse<T> {
  success?: boolean;
  data?: T | null;
  message?: string;
  // 其他后端可能附带的字段
  [key: string]: unknown;
}

export interface ApiErrorData {
  status: number;
  code?: string | number;
  message: string;
  details?: unknown;
  requestId?: string;
}

export class ApiError extends Error implements ApiErrorData {
  status: number;
  code?: string | number;
  details?: unknown;
  requestId?: string;

  constructor(data: ApiErrorData) {
    super(data.message);
    this.name = 'ApiError';
    this.status = data.status;
    this.code = data.code;
    this.details = data.details;
    this.requestId = data.requestId;
  }
}
