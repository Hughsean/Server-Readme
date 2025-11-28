// client/lib/src/apis/DepressionAssessmentApi.ts

import { request } from '../http/httpClient';
import type { DepressionAssessment } from '../types/depression';

export class DepressionAssessmentApi {
  get(assessmentId: number) {
    return request<DepressionAssessment>('GET', `/api/depression-assessments/${assessmentId}`);
  }

  listByUser(userId: number, scaleId?: number) {
    return request<DepressionAssessment[]>('GET', `/api/depression-assessments/user/${userId}`, { params: { scaleId } });
  }

  create(payload: DepressionAssessment) {
    return request<DepressionAssessment>('POST', '/api/depression-assessments', { body: payload });
  }

  update(assessmentId: number, payload: DepressionAssessment) {
    return request<DepressionAssessment>('PUT', `/api/depression-assessments/${assessmentId}`, { body: payload });
  }

  delete(assessmentId: number) {
    return request<void>('DELETE', `/api/depression-assessments/${assessmentId}`);
  }
}
