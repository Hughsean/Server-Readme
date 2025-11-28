// client/lib/src/types/psychology.ts

/**
 * 心理知识库分类
 */
export interface PsychologyCategory {
    categoryId?: number;
    categoryName: string;
    parentId?: number | null;
    description?: string;
    sortOrder?: number;
    status?: number;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 分类树节点
 */
export interface CategoryTreeNode {
    category: PsychologyCategory;
    children: CategoryTreeNode[];
}

/**
 * 心理知识库文章
 */
export interface PsychologyArticle {
    articleId?: number | string; // BIGINT - 支持大整数
    categoryId: number;
    title: string;
    summary?: string;
    content: string;
    author?: string;
    source?: string;
    tags?: string; // JSON字符串
    coverImage?: string; // Base64编码的图片
    viewCount?: number;
    likeCount?: number;
    isFeatured?: boolean;
    isPublished?: boolean;
    publishDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 心理知识库问答
 */
export interface PsychologyQna {
    qnaId?: number | string; // BIGINT - 支持大整数
    categoryId: number;
    question: string;
    answer: string;
    expertName?: string;
    expertTitle?: string;
    tags?: string; // JSON字符串
    viewCount?: number;
    likeCount?: number;
    isVerified?: boolean;
    status?: number;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 心理资源库
 */
export interface PsychologyResource {
    resourceId?: number | string; // BIGINT - 支持大整数
    categoryId: number;
    resourceType: 'VIDEO' | 'AUDIO' | 'PDF' | 'LINK' | 'TOOL';
    title: string;
    description?: string;
    fileData?: string; // Base64编码的文件数据
    externalUrl?: string;
    fileSize?: number | string; // BIGINT - 支持大文件
    mimeType?: string;
    duration?: number;
    thumbnail?: string; // Base64编码的缩略图
    tags?: string; // JSON字符串
    viewCount?: number;
    likeCount?: number;
    status?: number;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 用户知识库收藏
 */
export interface UserKnowledgeFavorite {
    favoriteId?: number | string; // BIGINT - 支持大整数
    userId: number | string; // BIGINT - 支持大整数
    contentType: 'ARTICLE' | 'QNA' | 'RESOURCE';
    contentId: number | string; // BIGINT - 支持大整数
    createdAt?: string;
}

/**
 * 收藏状态检查结果
 */
export interface FavoriteCheckResult {
    isFavorited: boolean;
}
