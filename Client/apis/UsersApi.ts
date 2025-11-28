// client/lib/src/apis/UsersApi.ts

import { request } from '../http/httpClient';
import type { User, LoginRequest, LoginResponse } from '../types/user';
import { rsaEncrypt, getPublicKey } from '../utils/crypto';
import { setBearerToken } from '../config/api.config';

export class UsersApi {
  getById(id: number) {
    return request<User>('GET', `/api/users/${id}`);
  }

  getAll() {
    return request<User[]>('GET', '/api/users');
  }

  /**
   * 用户注册
   * 密码会使用RSA加密后传输
   */
  async register(user: User): Promise<void> {
    try {
      // 检查密码是否存在
      if (!user.password) {
        throw new Error('密码不能为空');
      }
      // 获取RSA公钥
      const publicKey = await getPublicKey();

      // 加密密码
      const encryptedPassword = await rsaEncrypt(user.password, publicKey);

      // 发送加密后的注册请求
      return await request<void>('POST', '/api/users/register', {
        body: {
          ...user,
          password: encryptedPassword,
        },
      });
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  }

  update(id: number, user: User) {
    return request<void>('PUT', `/api/users/${id}`, { body: user });
  }

  delete(id: number) {
    return request<void>('DELETE', `/api/users/${id}`);
  }

  /**
   * 用户登录
   * 密码会使用RSA加密后传输
   * 登录成功后自动存储token到全局,后续API请求会自动携带
   */
  async login(payload: LoginRequest): Promise<LoginResponse> {
    try {
      // 获取API配置
      // const apiConfig = getApiConfig();

      // 获取RSA公钥
      const publicKey = await getPublicKey();

      // 加密密码
      const encryptedPassword = await rsaEncrypt(payload.password, publicKey);

      // 发送加密后的登录请求
      const response = await request<LoginResponse>('POST', '/api/users/login', {
        body: {
          username: payload.username,
          password: encryptedPassword,
        },
      });

      // 登录成功后自动存储token到全局
      if (response.token) {
        setBearerToken(response.token);
      }

      return response;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  }

  /**
   * 用户登出
   * 清除全局存储的token
   */
  logout(): void {
    setBearerToken(null);
  }
}
