// client/lib/src/types/music.ts

/**
 * 音乐实体接口
 * 对应后端 Music 实体
 */
export interface Music {
  /** 音乐ID */
  musicId?: number;
  /** 音乐标题 */
  title: string;
  /** 艺术家/歌手 */
  artist?: string;
  /** 专辑名称 */
  album?: string;
  /** 分类 */
  category?: string;
  /** 音乐描述 */
  description?: string;
  /** 时长(秒) */
  duration?: number;
  /** 音乐文件二进制数据(Base64编码) */
  fileData?: string;
  /** 文件大小(字节) */
  fileSize: number;
  /** 文件MIME类型 */
  mimeType?: string;
  /** 封面图片(Base64编码) */
  coverImage?: string;
  /** 歌词 */
  lyrics?: string;
  /** 标签数组 */
  tags?: string[];
  /** 情绪标签 */
  moodTags?: string[];
  /** 状态: 1可用, 0不可用 */
  status?: number;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}

/**
 * 音乐创建请求
 */
export interface MusicCreateRequest {
  title: string;
  artist?: string;
  album?: string;
  category?: string;
  description?: string;
  duration?: number;
  fileData: string;  // Base64编码的音乐文件
  fileSize: number;  // 必填：文件大小(字节)
  mimeType: string;
  coverImage?: string;  // Base64编码的封面图片
  lyrics?: string;
  tags?: string[];
  moodTags?: string[];
  status?: number;
}

/**
 * 音乐更新请求(包含文件)
 */
export interface MusicUpdateRequest {
  title?: string;
  artist?: string;
  album?: string;
  category?: string;
  description?: string;
  duration?: number;
  fileData?: string;
  fileSize?: number;
  mimeType?: string;
  coverImage?: string;
  lyrics?: string;
  tags?: string[];
  moodTags?: string[];
  status?: number;  // 默认值: 1
}

/**
 * 音乐更新请求(不包含文件)
 */
export interface MusicUpdateWithoutFilesRequest {
  title?: string;
  artist?: string;
  album?: string;
  category?: string;
  description?: string;
  duration?: number;
  lyrics?: string;
  tags?: string[];
  moodTags?: string[];
  status?: number;  // 默认值: 1
}

/**
 * 音乐搜索参数
 */
export interface MusicSearchParams {
  keyword: string;
}

/**
 * 音乐统计信息
 */
export interface MusicStats {
  total: number;
  byCategory?: Record<string, number>;
}
