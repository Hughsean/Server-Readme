// client/lib/src/types/profile.ts

// 服务端对外 DTO（响应）结构：所有画像字段为字符串数组
export interface UserProfileDto {
  id?: number;
  userId: number;
  interests?: string[] | null;
  personalityTraits?: string[] | null;
  interactionPreferences?: string[] | null;
  emotionalTendency?: string[] | null;
  learningRecords?: string[] | null;
  createdAt?: string | null; // ISO
  updatedAt?: string | null; // ISO
}

// 提交保存时的入参类型：允许传 string[] 或预先序列化好的 JSON 字符串
export interface UserProfileSave {
  userId: number;
  interests?: string[] | string | null;
  personalityTraits?: string[] | string | null;
  interactionPreferences?: string[] | string | null;
  emotionalTendency?: string[] | string | null;
  learningRecords?: string[] | string | null;
}

// 为向后兼容旧命名
export type UserProfile = UserProfileDto;
