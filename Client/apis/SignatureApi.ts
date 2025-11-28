// client/lib/src/apis/SignatureApi.ts

import { request } from '../http/httpClient';
import type { SignatureCreateRequest, SignatureCreateResponse, SignatureVerifyRequest, SignatureVerifyResponse } from '../types/signature';

export class SignatureApi {
  createSignature(payload: SignatureCreateRequest) {
    return request<SignatureCreateResponse>('POST', '/api/signature/create', { body: payload });
  }

  verifySignature(payload: SignatureVerifyRequest) {
    return request<SignatureVerifyResponse>('POST', '/api/signature/verify', { body: payload });
  }
}
