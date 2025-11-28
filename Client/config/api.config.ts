// client/lib/src/config/api.config.ts
// API 配置与默认值

export interface RetryConfig {
  retries: number; // 最大重试次数
  initialDelayMs: number; // 初始退避时间
  maxDelayMs: number; // 最大退避
  backoffFactor: number; // 指数因子
  retryMethods: string[]; // 允许自动重试的 HTTP 方法
}

export interface ApiConfig {
  baseURL: string;
  timeoutMs: number;
  withCredentials?: boolean; // 仅在浏览器
  defaultHeaders: Record<string, string>;
  retry: RetryConfig;
  // 是否在业务成功时解包 ApiResponse.data
  autoUnwrap: boolean;
  // 自定义解包钩子（覆盖默认）
  unwrapHook?: <T>(resp: any) => T;
  // 可注入自定义 fetch（如 @tauri-apps/plugin-http 的 fetch 或 cross-fetch）
  customFetch?: typeof fetch;
  // 是否以管理员模式运行（true: 使用 Admin API Key, false: 使用 JWT Token）
  isAdminMode?: boolean;
}

export const defaultApiConfig: ApiConfig = {
  baseURL: 'http://localhost:8080',
  timeoutMs: 15000,
  withCredentials: false,
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  retry: {
    retries: 3,
    initialDelayMs: 300,
    maxDelayMs: 4000,
    backoffFactor: 2,
    retryMethods: ['GET', 'PUT', 'DELETE', 'HEAD', 'OPTIONS']
  },
  autoUnwrap: true,
  isAdminMode: false // 默认使用普通用户模式
};

// 允许动态覆盖配置
let activeConfig: ApiConfig = { ...defaultApiConfig };

export function getApiConfig(): ApiConfig {
  return activeConfig;
}

export function updateApiConfig(patch: Partial<ApiConfig>) {
  activeConfig = { ...activeConfig, ...patch, retry: { ...activeConfig.retry, ...(patch.retry || {}) } };
}

// 存储键名常量
const STORAGE_KEYS = {
  BEARER_TOKEN: 'app_bearer_token',
  ADMIN_API_KEY: 'app_admin_api_key'
};

// 存储工具函数
function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (error) {
    console.warn('localStorage 不可用:', error);
  }
  return null;
}

function saveToStorage(key: string, value: string | null): void {
  const storage = getStorage();
  if (storage) {
    if (value === null) {
      storage.removeItem(key);
    } else {
      storage.setItem(key, value);
    }
  }
}

function loadFromStorage(key: string): string | null {
  const storage = getStorage();
  if (storage) {
    return storage.getItem(key);
  }
  return null;
}

// Bearer Token 管理（带持久化）
let bearerToken: string | null = loadFromStorage(STORAGE_KEYS.BEARER_TOKEN);

export function setBearerToken(token: string | null) {
  bearerToken = token;
  saveToStorage(STORAGE_KEYS.BEARER_TOKEN, token);
}

export function getBearerToken() {
  return bearerToken;
}

// 管理员 API Key 管理（带持久化）
let adminApiKey: string | null = loadFromStorage(STORAGE_KEYS.ADMIN_API_KEY);

export function setAdminApiKey(apiKey: string | null) {
  adminApiKey = apiKey;
  saveToStorage(STORAGE_KEYS.ADMIN_API_KEY, apiKey);
}

export function getAdminApiKey() {
  return adminApiKey;
}

// 清除所有持久化数据
export function clearAllStorage() {
  setBearerToken(null);
  setAdminApiKey(null);
}
