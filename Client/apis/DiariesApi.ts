import { request } from '../http/httpClient';
import type { UserDiary, CreateDiaryRequest, UpdateDiaryRequest } from '../types/diary';

/**
 * 日记管理 API
 */
export class DiariesApi {
  /**
   * 创建日记
   * @param request 创建日记请求
   */
  async createDiary(data: CreateDiaryRequest): Promise<UserDiary> {
    return request<UserDiary>('POST', '/api/diaries', {
      body: data,
    });
  }

  /**
   * 更新日记
   * @param id 日记ID
   * @param request 更新日记请求
   */
  async updateDiary(id: number, data: UpdateDiaryRequest): Promise<UserDiary> {
    return request<UserDiary>('PUT', `/api/diaries/${id}`, {
      body: data,
    });
  }

  /**
   * 删除日记
   * @param id 日记ID
   */
  async deleteDiary(id: number): Promise<void> {
    return request<void>('DELETE', `/api/diaries/${id}`);
  }

  /**
   * 获取日记详情
   * @param id 日记ID
   */
  async getDiary(id: number): Promise<UserDiary> {
    return request<UserDiary>('GET', `/api/diaries/${id}`);
  }

  /**
   * 获取用户的所有日记
   */
  async listDiaries(): Promise<UserDiary[]> {
    return request<UserDiary[]>('GET', '/api/diaries');
  }
}
