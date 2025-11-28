// client/lib/src/apis/CommunityApi.ts

import { request } from '../http/httpClient';
import type { CommunityPostRequest, CommunityPostResponse, CommunityComment } from '../types/community';

export class CommunityApi {
  listPosts(params?: { status?: number; userId?: number }) {
    return request<CommunityPostResponse[]>('GET', '/api/community/posts', { params });
  }

  getPost(postId: number) {
    return request<CommunityPostResponse>('GET', `/api/community/posts/${postId}`);
  }

  createPost(payload: CommunityPostRequest) {
    return request<CommunityPostResponse>('POST', '/api/community/posts', { body: payload });
  }

  updatePost(postId: number, payload: CommunityPostRequest) {
    return request<CommunityPostResponse>('PUT', `/api/community/posts/${postId}`, { body: payload });
  }

  deletePost(postId: number) {
    return request<void>('DELETE', `/api/community/posts/${postId}`);
  }

  likePost(postId: number) {
    return request<void>('POST', `/api/community/posts/${postId}/like`);
  }

  listComments(postId: number) {
    return request<CommunityComment[]>('GET', `/api/community/posts/${postId}/comments`);
  }

  createComment(postId: number, comment: CommunityComment) {
    return request<CommunityComment>('POST', `/api/community/posts/${postId}/comments`, { body: comment });
  }

  deleteComment(commentId: number) {
    return request<void>('DELETE', `/api/community/comments/${commentId}`);
  }

  likeComment(commentId: number) {
    return request<void>('POST', `/api/community/comments/${commentId}/like`);
  }
}
