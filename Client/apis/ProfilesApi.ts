// client/lib/src/apis/ProfilesApi.ts

import { request } from '../http/httpClient';
import type { UserProfileDto, UserProfileSave } from '../types/profile';

export class ProfilesApi {
  get(userId: number) {
    return request<UserProfileDto>('GET', `/api/profiles/${userId}`);
  }

  save(profile: UserProfileSave) {
    // 如果前端传的是数组，自动序列化为 JSON 字符串（与后端入参实体兼容）
    const body: Record<string, unknown> = { userId: profile.userId };
    const serialize = (v: string[] | string | null | undefined) => {
      if (v == null) return undefined;
      if (Array.isArray(v)) return JSON.stringify(v);
      return v; // 已经是字符串（假定合法 JSON 数组字符串）
    };
    body.interests = serialize(profile.interests);
    body.personalityTraits = serialize(profile.personalityTraits);
    body.interactionPreferences = serialize(profile.interactionPreferences);
    body.emotionalTendency = serialize(profile.emotionalTendency);
    body.learningRecords = serialize(profile.learningRecords);
    return request<UserProfileDto>('POST', '/api/profiles', { body });
  }

  delete(userId: number) {
    return request<void>('DELETE', `/api/profiles/${userId}`);
  }
}
