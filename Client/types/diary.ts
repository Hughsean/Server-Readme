/**
 * 用户日记类型定义
 */

export interface UserDiary {
  /** 日记ID */
  id: number;
  /** 用户ID */
  userId: number;
  /** 日记标题 */
  title?: string;
  /** 日记内容 */
  content: string;
  /** 心情描述（由AI生成） */
  moodDescription?: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

export interface CreateDiaryRequest {
  /** 日记标题（可选） */
  title?: string;
  /** 日记内容 */
  content: string;
}

export interface UpdateDiaryRequest {
  /** 日记标题（可选） */
  title?: string;
  /** 日记内容 */
  content: string;
}
