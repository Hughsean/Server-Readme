// client/lib/src/types/signature.ts

export interface SignatureCreateRequest {
  appId: string;
  appKey: string;
  expiresIn?: number; // 秒
}

export interface SignatureCreateResponse {
  token: string;
  issuedAt: string; // ISO
  expiresAt: string; // ISO
}

export interface SignatureVerifyRequest {
  token: string;
  appKey: string;
}

export interface SignatureVerifyResponse {
  valid: boolean;
  appId?: string;
  issuedAt?: string;
  expiresAt?: string;
}
