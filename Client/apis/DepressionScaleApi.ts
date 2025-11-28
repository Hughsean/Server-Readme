// client/lib/src/apis/DepressionScaleApi.ts

import { request } from '../http/httpClient';
import type { DepressionScale } from '../types/depression';

export class DepressionScaleApi {
  listScales() {
    return request<DepressionScale[]>('GET', '/api/depression-scale');
  }
}
