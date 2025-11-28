// client/lib/src/apis/PsychologyApi.ts

import { request } from '../http/httpClient';
import type {
    PsychologyCategory,
    CategoryTreeNode,
    PsychologyArticle,
    PsychologyQna,
    PsychologyResource,
    UserKnowledgeFavorite,
    FavoriteCheckResult,
} from '../types/psychology';

/**
 * 心理知识库 API
 * 提供分类、文章、问答、资源和收藏管理功能
 */
export class PsychologyApi {
    // ==================== 分类管理 ====================

    /**
     * 获取所有启用的分类
     */
    getCategories() {
        return request<PsychologyCategory[]>('GET', '/api/psychology/categories');
    }

    /**
     * 获取分类树结构
     */
    getCategoryTree() {
        return request<CategoryTreeNode[]>('GET', '/api/psychology/categories/tree');
    }

    /**
     * 根据父分类ID获取子分类
     */
    getCategoryChildren(parentId: number) {
        return request<PsychologyCategory[]>('GET', `/api/psychology/categories/children/${parentId}`);
    }

    /**
     * 创建新分类（管理员接口）
     */
    createCategory(category: PsychologyCategory) {
        return request<string>('POST', '/api/psychology/categories', { body: category });
    }

    // ==================== 文章管理 ====================

    /**
     * 获取文章详情
     */
    getArticle(articleId: number) {
        return request<PsychologyArticle>('GET', `/api/psychology/articles/${articleId}`);
    }

    /**
     * 根据分类查询文章列表
     */
    getArticlesByCategory(categoryId: number, page: number = 1, pageSize: number = 10) {
        return request<PsychologyArticle[]>(
            'GET',
            `/api/psychology/articles/category/${categoryId}?page=${page}&pageSize=${pageSize}`
        );
    }

    /**
     * 获取精选文章列表
     */
    getFeaturedArticles(limit: number = 10) {
        return request<PsychologyArticle[]>('GET', `/api/psychology/articles/featured?limit=${limit}`);
    }

    /**
     * 获取最新文章列表
     */
    getLatestArticles(limit: number = 10) {
        return request<PsychologyArticle[]>('GET', `/api/psychology/articles/latest?limit=${limit}`);
    }

    /**
     * 搜索文章
     */
    searchArticles(keyword: string, page: number = 1, pageSize: number = 10) {
        return request<PsychologyArticle[]>(
            'GET',
            `/api/psychology/articles/search?keyword=${encodeURIComponent(keyword)}&page=${page}&pageSize=${pageSize}`
        );
    }

    /**
     * 点赞文章
     */
    likeArticle(articleId: number) {
        return request<string>('POST', `/api/psychology/articles/${articleId}/like`);
    }

    /**
     * 创建新文章（管理员接口）
     */
    createArticle(article: PsychologyArticle) {
        return request<string>('POST', '/api/psychology/articles', { body: article });
    }

    // ==================== 问答管理 ====================

    /**
     * 获取问答详情
     */
    getQna(qnaId: number) {
        return request<PsychologyQna>('GET', `/api/psychology/qna/${qnaId}`);
    }

    /**
     * 根据分类查询问答列表
     */
    getQnaByCategory(categoryId: number, page: number = 1, pageSize: number = 10) {
        return request<PsychologyQna[]>(
            'GET',
            `/api/psychology/qna/category/${categoryId}?page=${page}&pageSize=${pageSize}`
        );
    }

    /**
     * 获取经过验证的问答列表
     */
    getVerifiedQna(limit: number = 10) {
        return request<PsychologyQna[]>('GET', `/api/psychology/qna/verified?limit=${limit}`);
    }

    /**
     * 搜索问答
     */
    searchQna(keyword: string, page: number = 1, pageSize: number = 10) {
        return request<PsychologyQna[]>(
            'GET',
            `/api/psychology/qna/search?keyword=${encodeURIComponent(keyword)}&page=${page}&pageSize=${pageSize}`
        );
    }

    /**
     * 点赞问答
     */
    likeQna(qnaId: number) {
        return request<string>('POST', `/api/psychology/qna/${qnaId}/like`);
    }

    // ==================== 资源管理 ====================

    /**
     * 获取资源详情
     */
    getResource(resourceId: number) {
        return request<PsychologyResource>('GET', `/api/psychology/resources/${resourceId}`);
    }

    /**
     * 根据分类查询资源列表
     */
    getResourcesByCategory(categoryId: number, page: number = 1, pageSize: number = 10) {
        return request<PsychologyResource[]>(
            'GET',
            `/api/psychology/resources/category/${categoryId}?page=${page}&pageSize=${pageSize}`
        );
    }

    /**
     * 根据类型查询资源列表
     */
    getResourcesByType(
        resourceType: 'VIDEO' | 'AUDIO' | 'PDF' | 'LINK' | 'TOOL',
        page: number = 1,
        pageSize: number = 10
    ) {
        return request<PsychologyResource[]>(
            'GET',
            `/api/psychology/resources/type/${resourceType}?page=${page}&pageSize=${pageSize}`
        );
    }

    /**
     * 点赞资源
     */
    likeResource(resourceId: number) {
        return request<string>('POST', `/api/psychology/resources/${resourceId}/like`);
    }

    // ==================== 收藏管理 ====================

    /**
     * 获取用户收藏列表
     */
    getUserFavorites(userId: number, contentType?: 'ARTICLE' | 'QNA' | 'RESOURCE') {
        const url = contentType
            ? `/api/psychology/favorites/${userId}?contentType=${contentType}`
            : `/api/psychology/favorites/${userId}`;
        return request<UserKnowledgeFavorite[]>('GET', url);
    }

    /**
     * 检查是否已收藏
     */
    checkFavorite(userId: number, contentType: 'ARTICLE' | 'QNA' | 'RESOURCE', contentId: number) {
        return request<FavoriteCheckResult>(
            'GET',
            `/api/psychology/favorites/check?userId=${userId}&contentType=${contentType}&contentId=${contentId}`
        );
    }

    /**
     * 切换收藏状态（如果已收藏则取消，未收藏则添加）
     */
    toggleFavorite(userId: number, contentType: 'ARTICLE' | 'QNA' | 'RESOURCE', contentId: number) {
        return request<FavoriteCheckResult>(
            'POST',
            `/api/psychology/favorites/toggle?userId=${userId}&contentType=${contentType}&contentId=${contentId}`
        );
    }
}
