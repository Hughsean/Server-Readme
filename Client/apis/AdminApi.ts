// client/lib/src/apis/AdminApi.ts

import { request } from '../http/httpClient';
import type { User } from '../types/user';
import type { AdminRiskConversation, AdminRiskMessageDetection, ProcessRiskDetectionPayload } from '../types/admin';

/**
 * 管理员 API
 * 
 * ⚠️ 使用前需要配置：
 * ```ts
 * import { updateApiConfig, setAdminApiKey, AdminApi } from './client';
 * 
 * // 1. 启用管理员模式
 * updateApiConfig({ isAdminMode: true });
 * 
 * // 2. 设置管理员 API Key（明文，SDK 会自动 RSA 加密）
 * setAdminApiKey('ADMIN_KEY_your_api_key_here');
 * 
 * // 3. 使用管理员 API
 * const admin = new AdminApi();
 * const users = await admin.getAllUsers();
 * ```
 * 
 * 🔐 安全特性：
 * - API Key 使用 RSA-OAEP 加密传输，防止中间人攻击
 * - 管理员持有有效的 API Key 可以访问所有系统接口
 * - 所有操作都会记录审计日志
 * 
 * 📋 可访问的接口：
 * - 所有 /api/admin/** 接口（管理员专用）
 * - 所有普通用户接口（无需 JWT Token）
 */
export class AdminApi {
  /**
   * 获取所有用户列表
   * GET /api/admin/users
   * 
   * 注意：返回的用户数据中密码字段已被脱敏（为 null）
   */
  getAllUsers() {
    return request<User[]>('GET', '/api/admin/users');
  }

  /**
   * 获取指定用户的风险对话列表
   * GET /api/admin/users/{userId}/risk-conversations
   * 
   * 包含对话元信息、消息内容与风险检测聚合结果
   * 
   * @param userId 用户ID
   */
  getRiskConversations(userId: number) {
    return request<AdminRiskConversation[]>('GET', `/api/admin/users/${userId}/risk-conversations`);
  }

  /**
   * 处理单条风险检测结果（标记已处理 + 备注）
   * POST /api/admin/users/risk-detections/{detectionId}/process
   * @param detectionId 检测结果ID
   * @param payload { processed: boolean, processNotes?: string }
   */
  processRiskDetection(detectionId: number, payload: ProcessRiskDetectionPayload) {
    return request<AdminRiskMessageDetection>('POST', `/api/admin/users/risk-detections/${detectionId}/process`, { body: payload });
  }
}
