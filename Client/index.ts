// client/lib/src/index.ts

// 配置
export {
  getApiConfig,
  updateApiConfig,
  setBearerToken,
  getBearerToken,
  setAdminApiKey,
  getAdminApiKey,
  defaultApiConfig
} from './config/api.config';

// HTTP 客户端与拦截器、错误类型
export { request, addRequestInterceptor, addResponseInterceptor } from './http/httpClient';
export { ApiError } from './types/api';

// 类型导出
export * from './types/api';
export * from './types/user';
export * from './types/profile';
export * from './types/signature';
export * from './types/session';
export * from './types/community';
export * from './types/conversation';
export * from './types/depression';
export * from './types/admin';
export * from './types/diary';
export * from './types/psychology';
export * from './types/music';

// API 模块导出
export { UsersApi } from './apis/UsersApi';
export { AdminApi } from './apis/AdminApi';
export { ProfilesApi } from './apis/ProfilesApi';
export { SignatureApi } from './apis/SignatureApi';
export { LlmSessionsApi } from './apis/LlmSessionsApi';
export { CommunityApi } from './apis/CommunityApi';
export { ConversationsApi } from './apis/ConversationsApi';
export { DepressionScaleApi } from './apis/DepressionScaleApi';
export { DepressionAssessmentApi } from './apis/DepressionAssessmentApi';
export { DiariesApi } from './apis/DiariesApi';
export { PsychologyApi } from './apis/PsychologyApi';
export { MusicApi } from './apis/MusicApi';
export { TestApi } from './apis/TestApi';

// 工具函数导出
export { rsaEncrypt, getPublicKey, clearCachedPublicKey } from './utils/crypto';
