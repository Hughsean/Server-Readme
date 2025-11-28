// client/lib/src/types/user.ts

export interface User {
  id?: number;
  username?: string;
  password?: string;  // 密码字段(注册时需要,查询时不返回)
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  // TODO: 根据后端实体补全更多字段
  [key: string]: unknown;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  username: string;
  nickname: string;
  token: string;
}
