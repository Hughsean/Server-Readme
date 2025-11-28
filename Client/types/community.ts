// client/lib/src/types/community.ts

export interface CommunityMediaRequest {
  mediaType?: string; // image/video/audio
  mediaUrl?: string; // 或者 base64
  base64Content?: string;
  extraMetadata?: Record<string, unknown> | null;
}

export interface CommunityMediaResponse {
  mediaId?: number;
  mediaType?: string;
  mediaUrl?: string;
  extraMetadata?: Record<string, unknown> | null;
}

export interface CommunityPostRequest {
  userId: number;
  title?: string;
  content?: string;
  extraMetadata?: Record<string, unknown> | null;
  status?: number;
  mediaList?: CommunityMediaRequest[];
}

export interface CommunityPostResponse {
  postId?: number;
  userId?: number;
  nickname?: string;
  title?: string;
  content?: string;
  extraMetadata?: Record<string, unknown> | null;
  likesCount?: number;
  commentsCount?: number;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  mediaList?: CommunityMediaResponse[];
}

export interface CommunityComment {
  commentId?: number;
  postId?: number;
  userId?: number;
  content?: string;
  likesCount?: number;
  createdAt?: string;
  updatedAt?: string;
  // TODO: 其他字段
  [key: string]: unknown;
}
