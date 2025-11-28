# TypeScript SDK for Spring Boot Service

轻量 TypeScript 前端调用库,Browser/Node/Tauri 通用,按控制器分模块导出 API,内置超时、重试、拦截器、错误统一与 ApiResponse 自动解包。

**版本:0.4.5**

## 安装

> 该 SDK 为源码形式放置于 `Client` 目录下，建议在你的前端项目中通过 tsconfig paths 或本地包引用使用。

在 Node 环境下建议安装 fetch 兼容层（可选）：

```bash
pnpm add cross-fetch
```

在 Tauri 环境可选使用 HTTP 插件以规避 CORS（可选）：

```bash
pnpm add @tauri-apps/plugin-http
```

## 快速开始

```ts
import {
  updateApiConfig,
  setBearerToken,
  UsersApi,
  AdminApi,
  LlmSessionsApi,
  DiariesApi,
  PsychologyApi,
} from './src';

// 1) 基础配置
updateApiConfig({
  baseURL: 'http://localhost:8080',
  timeoutMs: 15000,
  // 如果在 Node，请注入 cross-fetch：
  // customFetch: (await import('cross-fetch')).fetch as any,
});

// 2) 登录 -> Token 自动存储 -> 调用受保护接口
const users = new UsersApi();
const loginResp = await users.login({ username: 'demo', password: '***' });
// ✅ Token 已自动存储,无需手动调用 setBearerToken()!

// 之后所有请求会自动携带 Authorization: Bearer <token>
const me = await users.getById(1);

// 3) 登出时清除 Token
users.logout();

// 4) 使用心理知识库（公开接口，无需登录）
const psychology = new PsychologyApi();

// 获取分类树
const categoryTree = await psychology.getCategoryTree();

// 获取精选文章
const featuredArticles = await psychology.getFeaturedArticles(10);

// 搜索文章
const searchResults = await psychology.searchArticles('焦虑', 1, 10);

// 点赞文章
await psychology.likeArticle(123);

// 收藏功能（需要登录）
const userId = 1;
await psychology.toggleFavorite(userId, 'ARTICLE', 123);

// 获取用户收藏列表
const favorites = await psychology.getUserFavorites(userId, 'ARTICLE');

// 管理员接口（需要启用管理员模式并设置 API Key）
import { setAdminApiKey } from './src';
updateApiConfig({ isAdminMode: true }); // 启用管理员模式
setAdminApiKey('ADMIN_KEY_3f6e40cb43b742a0894754866c2e1abe');

const admin = new AdminApi();
const allUsers = await admin.getAllUsers();
const riskConversations = await admin.getRiskConversations(1);

// 查看风险检测详情（包含判断理由）
const detection = riskConversations[0]?.detections[0];
if (detection) {
  console.log('风险等级:', detection.riskLevel);
  console.log('判断理由:', detection.reason); // 新增：查看 LLM 给出的判断依据
  console.log('证据:', detection.evidence);
}

// 处理风险检测结果（标记已处理 + 备注）
await admin.processRiskDetection(123, {
  processed: true,
  processNotes: '已联系用户，建议线下评估'
});
```

## 密码安全传输

### RSA 加密

**注册**和**登录**时,密码都会自动使用 RSA-OAEP 加密传输,无需手动处理:

```ts
const users = new UsersApi();

// 注册 - 密码自动 RSA 加密
await users.register({
  username: 'newuser',
  password: 'mypassword',  // 明文密码,SDK 会自动加密
  email: 'user@example.com'
});

// 登录 - 密码自动 RSA 加密
await users.login({
  username: 'newuser',
  password: 'mypassword'  // 明文密码,SDK 会自动加密
});
```

## 管理员 API Key 认证

### 🔐 安全传输机制

管理员 API Key 使用 **RSA-OAEP 加密传输**，确保密钥在网络传输过程中的安全性：

- **前端**：使用服务器公钥加密 API Key
- **传输**：加密后的 Base64 字符串通过 `X-Admin-API-Key` 请求头发送
- **后端**：使用私钥解密并验证 API Key

整个过程自动完成，无需手动处理加密逻辑。

### 设置管理员模式

从 **v0.4.0** 开始，SDK 支持管理员 API Key 认证。需要通过配置明确指定是否以管理员身份运行：

```ts
import { updateApiConfig, setAdminApiKey, AdminApi } from './src';

// 方式 1: 推荐 - 通过配置启用管理员模式
updateApiConfig({
  isAdminMode: true  // 启用管理员模式
});

// 设置管理员 API Key
setAdminApiKey('ADMIN_KEY_3f6e40cb43b742a0894754866c2e1abe');

const admin = new AdminApi();

// 访问管理员专用接口
const allUsers = await admin.getAllUsers();
const riskConversations = await admin.getRiskConversations(1);
```

### 认证模式说明

SDK 根据 `isAdminMode` 配置决定使用哪种认证方式：

| 配置 | 认证方式 | 请求头 | 适用场景 |
|------|---------|--------|---------|
| `isAdminMode: true` | 管理员 API Key | `X-Admin-API-Key` | 管理后台、运维工具 |
| `isAdminMode: false` | JWT Token | `Authorization: Bearer` | 普通用户应用 |

**重要**：
- `isAdminMode: true` 时，即使设置了 JWT Token 也会被忽略
- `isAdminMode: false` 时，即使设置了 Admin API Key 也会被忽略
- 两种模式互斥，需要明确配置

### 切换认证模式

```ts
import { updateApiConfig, setAdminApiKey, setBearerToken } from './src';

// 切换到管理员模式
updateApiConfig({ isAdminMode: true });
setAdminApiKey('ADMIN_KEY_xxx');

// 切换回普通用户模式
updateApiConfig({ isAdminMode: false });
setBearerToken('your-jwt-token');
```

### 管理员接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| `getAllUsers()` | `GET /api/admin/users` | 获取所有用户（密码已脱敏） |
| `getRiskConversations(userId)` | `GET /api/admin/users/{userId}/risk-conversations` | 用户风险对话列表 |

#### 处理风险检测结果

接口：`POST /api/admin/users/risk-detections/{detectionId}/process`

用法示例：

```ts
await admin.processRiskDetection(detectionId, { processed: true, processNotes: '已回访' });
```

## 心理知识库 API (PsychologyApi)

**v0.4.6** 新增心理知识库功能，提供分类、文章、问答、资源和收藏管理。

### 特性

- ✅ 无需登录即可浏览所有内容（分类、文章、问答、资源）
- ✅ 登录后可使用收藏功能
- ✅ 支持全文搜索
- ✅ 支持分页查询
- ✅ 支持点赞功能

### 快速使用

```ts
import { PsychologyApi } from './src';

const psychology = new PsychologyApi();

// 1. 获取分类
const categories = await psychology.getCategories();
const tree = await psychology.getCategoryTree();
const children = await psychology.getCategoryChildren(1);

// 2. 文章相关
const article = await psychology.getArticle(123);
const articles = await psychology.getArticlesByCategory(1, 1, 10);
const featured = await psychology.getFeaturedArticles(10);
const latest = await psychology.getLatestArticles(10);
const searchResults = await psychology.searchArticles('焦虑', 1, 10);
await psychology.likeArticle(123);

// 3. 问答相关
const qna = await psychology.getQna(456);
const qnaList = await psychology.getQnaByCategory(2, 1, 10);
const verified = await psychology.getVerifiedQna(10);
const qnaResults = await psychology.searchQna('抑郁', 1, 10);
await psychology.likeQna(456);

// 4. 资源相关
const resource = await psychology.getResource(789);
const resources = await psychology.getResourcesByCategory(3, 1, 10);
const videos = await psychology.getResourcesByType('VIDEO', 1, 10);
await psychology.likeResource(789);

// 5. 收藏功能（需要登录）
const userId = 1;
const favorites = await psychology.getUserFavorites(userId);
const articleFavorites = await psychology.getUserFavorites(userId, 'ARTICLE');
const checkResult = await psychology.checkFavorite(userId, 'ARTICLE', 123);
const toggleResult = await psychology.toggleFavorite(userId, 'ARTICLE', 123);
```

### API 方法列表

#### 分类管理

| 方法 | 说明 |
|------|------|
| `getCategories()` | 获取所有启用的分类 |
| `getCategoryTree()` | 获取分类树结构（含子分类） |
| `getCategoryChildren(parentId)` | 获取指定父分类的子分类 |
| `createCategory(category)` | 创建新分类（管理员） |

#### 文章管理

| 方法 | 说明 |
|------|------|
| `getArticle(articleId)` | 获取文章详情（自动增加浏览数） |
| `getArticlesByCategory(categoryId, page, pageSize)` | 按分类查询文章 |
| `getFeaturedArticles(limit)` | 获取精选文章 |
| `getLatestArticles(limit)` | 获取最新文章 |
| `searchArticles(keyword, page, pageSize)` | 全文搜索文章 |
| `likeArticle(articleId)` | 点赞文章 |
| `createArticle(article)` | 创建文章（管理员） |

#### 问答管理

| 方法 | 说明 |
|------|------|
| `getQna(qnaId)` | 获取问答详情（自动增加浏览数） |
| `getQnaByCategory(categoryId, page, pageSize)` | 按分类查询问答 |
| `getVerifiedQna(limit)` | 获取专家验证的问答 |
| `searchQna(keyword, page, pageSize)` | 全文搜索问答 |
| `likeQna(qnaId)` | 点赞问答 |

#### 资源管理

| 方法 | 说明 |
|------|------|
| `getResource(resourceId)` | 获取资源详情（自动增加浏览数） |
| `getResourcesByCategory(categoryId, page, pageSize)` | 按分类查询资源 |
| `getResourcesByType(type, page, pageSize)` | 按类型查询资源（VIDEO/AUDIO/PDF/LINK/TOOL） |
| `likeResource(resourceId)` | 点赞资源 |

#### 收藏管理（需登录）

| 方法 | 说明 |
|------|------|
| `getUserFavorites(userId, contentType?)` | 获取用户收藏列表 |
| `checkFavorite(userId, contentType, contentId)` | 检查是否已收藏 |
| `toggleFavorite(userId, contentType, contentId)` | 切换收藏状态 |

### 类型定义

```ts
// 分类
interface PsychologyCategory {
  categoryId?: number;
  categoryName: string;
  parentId?: number | null;
  description?: string;
  sortOrder?: number;
  status?: number;
}

// 文章
interface PsychologyArticle {
  articleId?: number;
  categoryId: number;
  title: string;
  summary?: string;
  content: string;
  author?: string;
  tags?: string; // JSON数组
  viewCount?: number;
  likeCount?: number;
  isFeatured?: boolean;
}

// 问答
interface PsychologyQna {
  qnaId?: number;
  categoryId: number;
  question: string;
  answer: string;
  expertName?: string;
  isVerified?: boolean;
}

// 资源
interface PsychologyResource {
  resourceId?: number;
  categoryId: number;
  resourceType: 'VIDEO' | 'AUDIO' | 'PDF' | 'LINK' | 'TOOL';
  title: string;
  externalUrl?: string;
}

// 收藏
interface UserKnowledgeFavorite {
  favoriteId?: number;
  userId: number;
  contentType: 'ARTICLE' | 'QNA' | 'RESOURCE';
  contentId: number;
}
```

## Token 自动管理

### 自动存储与使用

从 **v0.3.0** 开始，登录成功后 **Token 会自动存储到全局**，无需手动调用 `setBearerToken()`：

```ts
const users = new UsersApi();

// 登录 - Token 自动存储
await users.login({ username: 'demo', password: 'pass' });

// 后续所有请求自动携带 Authorization: Bearer <token>
const profile = await users.getById(1);
const sessions = await new LlmSessionsApi().getAll();

// ✅ 日记：创建并自动分析心情
const diariesApi = new DiariesApi();
const diary = await diariesApi.createDiary({ title: '今日记录', content: '完成重构，有点累但很满足。' });
console.log(diary.moodDescription); // 自动心情描述
const allMyDiaries = await diariesApi.listDiaries();
```

### 登出清除 Token

```ts
// 清除全局 Token
users.logout();
```

### 持久化 Token（浏览器环境）

如果需要在刷新页面后保持登录状态，可以将 Token 持久化到 `localStorage`：

```ts
import { setBearerToken, getBearerToken } from './src';

// 应用启动时恢复 Token
const savedToken = localStorage.getItem('auth_token');
if (savedToken) {
  setBearerToken(savedToken);
}

// 登录后保存 Token
const loginResp = await users.login({ username, password });
localStorage.setItem('auth_token', loginResp.token);

// 登出时清除
users.logout();
localStorage.removeItem('auth_token');
```

### 手动管理 Token（高级）

```ts
import { setBearerToken, getBearerToken } from './src';

// 手动设置 Token
setBearerToken('your-jwt-token');

// 获取当前 Token
const currentToken = getBearerToken();

// 清除 Token
setBearerToken(null);
```

## 请求选项 (RequestOptions)

SDK 的所有 API 方法都支持传入可选的 `RequestOptions` 参数，用于控制请求行为：

```ts
interface RequestOptions {
  params?: Record<string, any>;      // URL 查询参数
  body?: any;                         // 请求体
  headers?: Record<string, string>;   // 额外请求头
  signal?: AbortSignal;               // 用于取消请求
  retry?: Partial<RetryConfig>;       // 重试配置
  direct?: boolean;                   // 直连模式，跳过认证（JWT/AdminKey）
  unwrapHook?: (resp) => any;         // 自定义响应解包
  query?: Record<string, any>;        // 额外查询参数（优先级高于 params）
}
```

### 直连模式 (`direct`)

某些场景下（如健康检查、公开接口），您可能不希望发送认证信息。使用 `direct: true` 可跳过所有认证：

```ts
const testApi = new TestApi();

// 直连调用，不携带 JWT Token 或 Admin API Key
await testApi.hello({ 
  direct: true,
  retry: { retries: 0 },  // 禁用重试
  signal: controller.signal 
});
```

**适用场景：**
- 健康检查接口
- 公开 API 端点
- 避免认证失败影响请求

## LLM 会话最小示例（含 Abort、重试）

```ts
import { LlmSessionsApi, updateApiConfig } from './src';

// 配置重试策略（幂等方法默认自动重试，POST 仍可手动开启）
updateApiConfig({
  retry: { retries: 2, initialDelayMs: 300, backoffFactor: 2, maxDelayMs: 4000, retryMethods: ['GET','PUT','DELETE','HEAD','OPTIONS'] }
});

const api = new LlmSessionsApi();

// Abort 用法
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 5000);

try {
  // 创建会话时可传入客户端地理位置信息
  const session = await api.createSession({ 
    userId: 1,
    location: { country: '中国', province: '广东省', city: '深圳市' }
  });
  const msg = await api.postMessage(session.sessionId, { text: '你好' });
  console.log('assistant:', msg.reply);
} finally {
  clearTimeout(timer);
}
```

## 用户日记 API (DiariesApi)

提供用户个人日记 CRUD 与自动心情分析。后端调用 LLM 生成 `moodDescription`，失败时回退为 `"未能分析"`。

### 方法列表

| 方法 | 请求 | 说明 |
|------|------|------|
| `createDiary(data)` | `POST /api/diaries` | 创建日记并生成心情描述 |
| `updateDiary(id,data)` | `PUT /api/diaries/{id}` | 更新日记并重新分析心情 |
| `deleteDiary(id)` | `DELETE /api/diaries/{id}` | 删除日记 |
| `getDiary(id)` | `GET /api/diaries/{id}` | 获取单条日记 |
| `listDiaries()` | `GET /api/diaries` | 获取当前用户所有日记 |

### 数据结构

```ts
interface UserDiary {
  id: number;
  userId: number;
  title?: string;
  content: string;
  moodDescription?: string; // 自动生成
  createdAt: string;
  updatedAt: string;
}
```

### 使用示例

```ts
import { DiariesApi } from './src';

const diaries = new DiariesApi();
// 创建
const d = await diaries.createDiary({ title: '晨间记录', content: '起得很早，天气晴朗。' });
console.log(d.moodDescription);

// 列表
const list = await diaries.listDiaries();

// 详情
const detail = await diaries.getDiary(d.id);

// 更新
await diaries.updateDiary(d.id, { title: '更新标题', content: '下午稍困，喝咖啡继续。' });

// 删除
await diaries.deleteDiary(d.id);
```

### 心情分析说明

- 通过 LLM 文本分析生成一句话
- 长度截断至 50 字符以内
- 失败或空内容会返回 "未能分析" 或 "内容为空"

---

## 错误模型

- 业务错误（ApiResponse.success=false）会抛出 `ApiError`：
  - `status`: HTTP 状态码
  - `code`: 业务/客户端错误码
  - `message`: 错误消息
  - `details`: 原始响应体或上下文
- 网络/超时/解析错误也统一封装为 `ApiError`，`code` 分别为 `NETWORK_ERROR` / `TIMEOUT_ABORT` / `JSON_PARSE_ERROR`。

捕获示例：

```ts
import { ApiError } from './src';

try {
  const users = await new UsersApi().getAll();
} catch (e) {
  if (e instanceof ApiError) {
    console.error(e.status, e.code, e.message, e.details);
  }
}
```

## 浏览器 / Node / Tauri

- 浏览器：无需额外配置，使用原生 `fetch`。
- Node：注入 `customFetch`。
  ```ts
  updateApiConfig({ customFetch: (await import('cross-fetch')).fetch as any });
  ```
- Tauri：可注入 `@tauri-apps/plugin-http` 的 `fetch`。
  ```ts
  import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
  updateApiConfig({ customFetch: tauriFetch as any });
  ```

## API 模块一览

- `UsersApi`: 用户 CRUD、登录
- `AdminApi`: 管理端用户列表
- `ProfilesApi`: 用户画像 CRUD（响应已对齐 DTO，JSON 字段为字符串数组）
- `SignatureApi`: 签名创建/校验
- `LlmSessionsApi`: LLM 会话管理与消息
- `CommunityApi`: 帖子/评论/点赞
- `ConversationsApi`: 会话列表（新增：按会话 ID 查询会话消息内容，仅返回用户/助手消息）
- `DepressionScaleApi`: 量表列表
- `DepressionAssessmentApi`: 评估 CRUD
- `TestApi`: 健康检查/示例
 - `DiariesApi`: 用户日记 CRUD + 自动心情分析

## 自定义拦截器

```ts
import { addRequestInterceptor, addResponseInterceptor } from './src';

addRequestInterceptor(async (ctx) => {
  // 追加全局查询参数或头
  ctx.headers['X-Client'] = 'sdk';
  return ctx;
});

addResponseInterceptor(async (ctx) => {
  console.log(ctx.method, ctx.url, ctx.response.status);
  return ctx;
});
```

## ConversationsApi - 新增接口

`ConversationsApi` 新增了一个方法 `getContents(convId: number)`，用于按会话 ID 拉取该会话的消息历史，并且只返回 `senderRole` 为 `user` 或 `assistant` 的消息（服务端已做过滤）。

示例：

```ts
import { ConversationsApi } from './src';

const conv = new ConversationsApi();
const msgs = await conv.getContents(123);
console.log(msgs);
// msgs 为 ConversationMessage[]，每个元素包含 senderRole, content, createdAt 等字段
```

如果后端也支持 `assistance` 这种变体，可以在 SDK 层额外做兼容，但目前服务端实现使用 `assistant`。

## 测试与覆盖点

已提供可选的 `vitest + msw` 示例用例：
- `httpClient.spec.ts`: 重试与超时、业务错误解包
- `usersApi.spec.ts`: 登录后携带 token、获取用户

运行（示例）：
```bash
pnpm add -D vitest msw @types/node
pnpm vitest
```

## LLM 会话 API 参考

下面是 SDK 中 LLM 会话相关方法的快速参考（类型已与服务端 DTO 对齐）：

- createSession(payload: SessionCreateRequest) -> SessionCreateResponse
  - POST /api/llm/sessions
  - Request 示例:

```ts
import { LlmSessionsApi } from './src';

const api = new LlmSessionsApi();
const resp = await api.createSession({ userId: 1, dialogueId: undefined });
// resp.userProfile 为 UserProfileDto，其中 JSON 字段为 string[]
```

- getSessionStatus(sessionId: string) -> SessionStatusResponse
  - GET /api/llm/sessions/{sessionId}
  - 返回会话状态与最后活跃时间（ISO 字符串）

```ts
const status = await api.getSessionStatus(resp.sessionId);
// status.sessionId, status.userId, status.dialogueId, status.lastActive, status.timeoutSeconds
```

- postMessage(sessionId: string, payload: MessageRequest) -> MessageResponse
  - POST /api/llm/sessions/{sessionId}/messages
  - Request 示例（与后端保持一致）:

```ts
const msgResp = await api.postMessage(resp.sessionId, { text: '你好', emotion: 'neutral' });
// msgResp.reply, msgResp.toolCalls, msgResp.sessionClosed, msgResp.dialogueId, msgResp.title
```

- closeSession(sessionId: string) -> CloseSessionResponse
  - POST /api/llm/sessions/{sessionId}/close
  - 后端当前返回 { sessionId, saved, message }

## 变更日志（前端 SDK）

### 0.4.5 (2025-11-16)

**📍 地理位置客户端传递**

- **新增字段**：`SessionCreateRequest.location` - 客户端传递地理位置信息
  - 字段类型：`Record<string, unknown> | undefined`
  - 字段说明：客户端在创建会话时传递用户所在地理位置，用于提供本地化服务
  - 示例值：`{ country: '中国', province: '广东省', city: '深圳市' }`

- **架构变更**：移除服务端IP定位服务，改为客户端主动传递位置信息
  - 移除：`IpLocationService` 服务类
  - 优势：位置信息更准确，避免IP定位误差，支持用户手动选择位置

- **使用示例**：
```typescript
const api = new LlmSessionsApi();
const session = await api.createSession({ 
  userId: 1,
  location: { country: '中国', province: '广东省', city: '深圳市' }
});
```

**🧠 判断理由字段支持**

- **新增字段**：`AdminRiskMessageDetection.reason` - 存储 LLM 检测器的判断依据
  - 字段类型：`string | undefined`
  - 字段说明：简明扼要说明为何得出此风险等级、情绪和意图的结论（100字以内）
  - 示例值："当前消息表达持续的睡眠障碍和情绪低落，结合历史趋势风险有所上升"

- **使用示例**：
```typescript
const detection = riskConversations[0]?.detections[0];
console.log('判断理由:', detection.reason);
// 输出: "消息表达强烈的无助感和自伤倾向"
```

**影响范围：**
- 风险检测结果现在包含 LLM 给出的判断理由，便于理解检测依据
- 后端数据库已添加 `reason` 字段存储
- LLM 提示词已更新，要求输出判断理由

**迁移指引：**
- 无破坏性改动，现有代码无需修改
- 新字段为可选字段，旧数据可能为 `undefined`
- 建议在前端 UI 中展示判断理由，提升风险评估的可解释性
- **location 字段为可选**，不传递时服务端不会进行本地化处理

### 0.4.4 (2025-11-15)

**🎯 意图检测增强**

- **Intent 类型扩展**：新增 5 个意图枚举值，支持更精细的对话意图识别
  - `CRISIS_SELF_HARM`: 危机/自伤自杀倾向（最高优先级）
  - `CLARIFICATION_REQUEST`: 澄清请求/没听懂
  - `FOLLOW_UP_QUESTION`: 跟进问题/后续追问
  - `OPINION`: 观点表达/主观评价
  - `TOXIC_ABUSE`: 辱骂/冒犯/有害言论

- **类型定义更新**：
```typescript
export type Intent = 
  | 'HELP_SEEKING'           // 求助意图
  | 'VENTING'                // 情绪宣泄
  | 'INFO_QUERY'             // 信息查询
  | 'NARRATIVE'              // 叙事讲述
  | 'JOKE_SARCASM'           // 玩笑讽刺
  | 'CRISIS_SELF_HARM'       // 危机/自伤自杀倾向
  | 'CLARIFICATION_REQUEST'  // 澄清请求
  | 'FOLLOW_UP_QUESTION'     // 跟进问题
  | 'OPINION'                // 观点表达
  | 'TOXIC_ABUSE'            // 辱骂/有害言论
  | 'UNKNOWN';               // 未知
```

**影响范围：**
- `AdminRiskMessageDetection.intent` 字段现在支持更多枚举值
- 后端风险检测系统已更新规则库，支持新意图的自动识别
- LLM 检测器已配置上下文窗口，可基于历史对话分析累积风险

**迁移指引：**
- 现有代码无需修改，新的意图类型会在后端检测结果中自动返回
- 前端可根据新增的意图类型进行差异化处理：
```typescript
if (detection.intent === 'CRISIS_SELF_HARM') {
  // 危机处理：紧急通知、高优先级标记
} else if (detection.intent === 'TOXIC_ABUSE') {
  // 有害言论处理：内容审核、警告提示
}
```

### 0.4.3 (2025-11-14)

**🔧 增强请求控制**

- 新增 `RequestOptions.direct` 选项：支持跳过认证的直连模式
- `TestApi.hello()` 现在接受 `RequestOptions` 参数，支持自定义超时、重试等
- 优化在线状态检测逻辑，避免认证失败干扰

**迁移指引：**
- 无破坏性改动，原有代码无需修改
- 如需调用公开接口或健康检查，推荐使用 `direct: true`

**文件变更：**
- 修改：`http/httpClient.ts` - 新增 `direct` 选项支持
- 修改：`apis/TestApi.ts` - 方法签名增加 `options` 参数
- 更新：`README.md`, `CHANGELOG.md`

### 0.4.2 (2025-11-13)
### 0.4.1 (2025-11-13)

**📓 新增用户日记功能**

- 新增 `DiariesApi` 模块：`createDiary` / `updateDiary` / `deleteDiary` / `getDiary` / `listDiaries`
- 自动心情分析字段 `moodDescription`（后端 LLM 分析）
- 类型导出新增：`UserDiary`、`CreateDiaryRequest`、`UpdateDiaryRequest`

**迁移指引：**
- 无破坏性改动；若需展示心情，直接使用返回的 `moodDescription`
- 前端无需再自行调用情绪分析 API

**文件变更：**
- 新增：`types/diary.ts`、`apis/DiariesApi.ts`
- 修改：`index.ts` 导出新增 API 与类型
- 更新：`README.md`, `CHANGELOG.md`


**🩺 新增风险检测处理接口**

- 新增 `AdminApi.processRiskDetection(detectionId, { processed, processNotes })` 方法
- 支持标记风险检测结果已处理并附加处理备注
- 类型新增：`processed`, `processNotes` 字段以及 `ProcessRiskDetectionPayload`

**迁移指引：**

- 若需要在管理端界面显示处理状态，请渲染新字段 `processed` 与 `processNotes`
- 旧代码不受影响；未处理的结果默认为 `processed = false`

### 0.4.0 (2025-11-12)

**🔐 管理员 API Key 认证支持**

- 新增 `setAdminApiKey()` 和 `getAdminApiKey()` 函数
- HTTP 客户端优先使用 Admin API Key（`X-Admin-API-Key` 请求头）
- 如果设置了 Admin API Key，将不再发送 JWT Token
- 更新 `AdminApi` 文档，添加详细注释和使用示例

**变更内容：**

```ts
// 新增管理员认证函数
import { setAdminApiKey, getAdminApiKey } from './src';

// 设置管理员 API Key
setAdminApiKey('ADMIN_KEY_your_key_here');
```

**迁移指引：**

- 管理员认证与普通用户认证互斥
- 设置 Admin API Key 后，JWT Token 将被忽略
- 需要切换回普通用户认证时，调用 `setAdminApiKey(null)`

### 0.3.0

- Breaking: `ProfilesApi.get` 与 `ProfilesApi.save` 的类型对齐后端 DTO：
  - 响应类型改为 `UserProfileDto`（`interests` 等 JSON 字段为 `string[]`）。
  - `save` 入参新增 `UserProfileSave`，允许传 `string[]` 或 JSON 字符串；
    SDK 会自动将数组序列化为 JSON 字符串以兼容服务端实体入参（字符串字段）。
- `SessionCreateResponse.userProfile` 从 `Record<string, unknown>` 调整为 `UserProfileDto`。

迁移指引：

- 原先直接读取 `resp.userProfile.interests` 作为字符串的代码需改为数组处理。
- 保存画像时，推荐传 `string[]`，SDK 会自动转换，无需手动 JSON.stringify。

---

错误处理说明

- SDK 的 `httpClient` 会对非 2xx 响应抛出 `ApiError`，包含
  `status`, `code`, `message`, `details` 字段。
- 注意：部分错误路径当前仅返回 HTTP 状态码与空 body
  （如 404 + null）。如需标准错误 JSON（含 detail/code），
  可在后端添加 `@ControllerAdvice` 统一异常处理；或在
  SDK 层扩展宽容解析策略。
