// client/lib/src/http/httpClient.ts
// 统一 HTTP 客户端封装，支持超时、重试、拦截器、错误归一、响应解包

import { getApiConfig, getBearerToken, getAdminApiKey } from '../config/api.config';
import type { ApiResponse } from '../types/api';
import { ApiError } from '../types/api';
import { rsaEncrypt, getPublicKey } from '../utils/crypto';

// fetch 实现：优先使用配置注入的 customFetch，否则使用全局 fetch

export interface RequestOptions<TBody = any> {
  params?: Record<string, any>;
  body?: TBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  retry?: Partial<{
    retries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffFactor: number;
  }>;
  // 直连，跳过JWT，AdminKey认证
  direct?: boolean;
  // 自定义解包
  unwrapHook?: <T>(resp: ApiResponse<T>) => T;
  // 额外 query 构造（优先级高于 params）
  query?: Record<string, any>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// 拦截器定义
export interface RequestInterceptorContext {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  init: RequestInit;
}
export interface ResponseInterceptorContext<T = any> {
  url: string;
  method: HttpMethod;
  response: Response;
  data: T | null;
  raw: any;
}

export type RequestInterceptor = (ctx: RequestInterceptorContext) => Promise<RequestInterceptorContext> | RequestInterceptorContext;
export type ResponseInterceptor = <T>(ctx: ResponseInterceptorContext<T>) => Promise<ResponseInterceptorContext<T>> | ResponseInterceptorContext<T>;

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];

export function addRequestInterceptor(interceptor: RequestInterceptor) {
  requestInterceptors.push(interceptor);
}
export function addResponseInterceptor(interceptor: ResponseInterceptor) {
  responseInterceptors.push(interceptor);
}

function buildQueryString(params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) return '';
  const qp: string[] = [];
  for (const key of Object.keys(params)) {
    const value = params[key];
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        qp.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
      }
    } else {
      qp.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return qp.length ? `?${qp.join('&')}` : '';
}

function mergeRetryConfig(method: string, custom?: RequestOptions['retry']) {
  const cfg = getApiConfig();
  const base = cfg.retry;
  const out = { ...base, ...(custom || {}) };
  if (!cfg.retry.retryMethods.includes(method.toUpperCase())) {
    out.retries = 0; // 非幂等方法默认不重试
  }
  return out;
}

function computeBackoff(attempt: number, initial: number, factor: number, maxDelay: number) {
  const delay = Math.min(maxDelay, initial * Math.pow(factor, attempt - 1));
  return delay;
}

export async function request<T = any>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<T> {
  const cfg = getApiConfig();
  const { params, body, headers = {}, signal, unwrapHook, query } = options;
  const allParams = { ...(params || {}), ...(query || {}) };
  const qs = buildQueryString(allParams);
  let url = cfg.baseURL.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path) + qs;

  const finalHeaders: Record<string, string> = { ...cfg.defaultHeaders, ...headers };

  // 网络直连
  if (!options.direct) {
    // 根据配置决定使用管理员 API Key 还是普通用户 JWT Token
    if (cfg.isAdminMode) {
      // 管理员模式：使用 Admin API Key（RSA 加密传输）
      const adminKey = getAdminApiKey();
      if (adminKey) {
        try {
          // 获取公钥并加密 API Key
          const publicKey = await getPublicKey();
          const encryptedKey = await rsaEncrypt(adminKey, publicKey);
          finalHeaders['X-Admin-API-Key'] = encryptedKey;
        } catch (error) {
          console.error('加密管理员 API Key 失败:', error);
          throw new ApiError({
            status: 0,
            code: 'ENCRYPTION_ERROR',
            message: '管理员 API Key 加密失败',
            details: { error }
          });
        }
      } else {
        console.warn('管理员模式已启用，但未设置 Admin API Key');
        // alert('管理员模式已启用，但未设置 Admin API Key');
      }
    } else {
      // 普通用户模式：使用 JWT Token
      const token = getBearerToken();
      if (token) {
        finalHeaders['Authorization'] = `Bearer ${token}`;
      }
    }
  }

  const init: RequestInit = {
    method,
    headers: finalHeaders,
    credentials: cfg.withCredentials ? 'include' : undefined,
  };
  if (body !== undefined && body !== null) {
    if (typeof body === 'object' && !(body instanceof FormData)) {
      init.body = JSON.stringify(body);
    } else {
      init.body = body as any;
    }
  }

  // 应用请求拦截器
  let reqCtx: RequestInterceptorContext = { url, method, headers: finalHeaders, init };
  for (const interceptor of requestInterceptors) {
    reqCtx = await interceptor(reqCtx);
  }
  url = reqCtx.url;

  // 超时控制
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), cfg.timeoutMs);
  const compositeSignal = mergeAbortSignals(signal, controller.signal);

  const retryCfg = mergeRetryConfig(method, options.retry);

  let attempt = 0;
  let lastError: any = null;
  while (attempt <= retryCfg.retries) {
    attempt++;
    try {
      const fetchImpl = getApiConfig().customFetch || fetch;
      const response = await fetchImpl(reqCtx.url, { ...reqCtx.init, signal: compositeSignal });
      const rawText = await safeReadText(response);
      let raw: any = null;
      try {
        raw = rawText ? JSON.parse(rawText) : (response.status === 204 ? null : rawText);
      } catch (e) {
        // JSON 解析错误
        throw new ApiError({
          status: response.status,
          code: 'JSON_PARSE_ERROR',
          message: '响应 JSON 解析失败',
          details: { error: (e as Error).message, body: rawText }
        });
      }

      let dataUnwrapped: any = raw;
      if (cfg.autoUnwrap && raw && typeof raw === 'object' && 'success' in raw) {
        const apiResp = raw as ApiResponse<any>;
        if (!apiResp.success) {
          throw new ApiError({
            status: response.status,
            code: 'BUSINESS_ERROR',
            message: apiResp.message || '业务请求失败',
            details: apiResp,
          });
        }
        dataUnwrapped = unwrapHook ? unwrapHook(apiResp) : (cfg.unwrapHook ? cfg.unwrapHook(apiResp) : apiResp.data);
      }

      let respCtx: ResponseInterceptorContext = {
        url: reqCtx.url,
        method,
        response,
        data: dataUnwrapped,
        raw
      };
      for (const interceptor of responseInterceptors) {
        respCtx = await interceptor(respCtx);
      }
      clearTimeout(timeout);
      return respCtx.data as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        clearTimeout(timeout);
        throw err; // 业务错误不重试
      }
      if (err?.name === 'AbortError') {
        clearTimeout(timeout);
        throw new ApiError({ status: 0, code: 'TIMEOUT_ABORT', message: '请求已取消或超时', details: { path } });
      }
      lastError = err;
      if (attempt > retryCfg.retries) {
        clearTimeout(timeout);
        throw new ApiError({ status: 0, code: 'NETWORK_ERROR', message: '网络或未知错误', details: { original: err } });
      }
      const delay = computeBackoff(attempt, retryCfg.initialDelayMs, retryCfg.backoffFactor, retryCfg.maxDelayMs);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  clearTimeout(timeout);
  throw new ApiError({ status: 0, code: 'NETWORK_ERROR', message: '网络错误', details: { original: lastError } });
}

function mergeAbortSignals(external?: AbortSignal, internal?: AbortSignal): AbortSignal | undefined {
  if (!external) return internal;
  if (!internal) return external;
  const controller = new AbortController();
  const forward = () => controller.abort();
  external.addEventListener('abort', forward);
  internal.addEventListener('abort', forward);
  return controller.signal;
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}
