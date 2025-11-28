# Changelog

All notable changes to this SDK will be documented in this file.

## 0.4.6 (2025-11-17)

### 🧠 心理知识库功能

#### 新增 API

- **PsychologyApi**: 心理知识库完整 API 支持
  - 分类管理: `getCategories()`, `getCategoryTree()`, `getCategoryChildren()`
  - 文章管理: `getArticle()`, `getArticlesByCategory()`, `getFeaturedArticles()`, `getLatestArticles()`, `searchArticles()`, `likeArticle()`
  - 问答管理: `getQna()`, `getQnaByCategory()`, `getVerifiedQna()`, `searchQna()`, `likeQna()`
  - 资源管理: `getResource()`, `getResourcesByCategory()`, `getResourcesByType()`, `likeResource()`
  - 收藏管理: `getUserFavorites()`, `checkFavorite()`, `toggleFavorite()`

#### 新增类型

- `PsychologyCategory`: 心理知识库分类
- `CategoryTreeNode`: 分类树节点
- `PsychologyArticle`: 心理知识库文章
- `PsychologyQna`: 心理知识库问答
- `PsychologyResource`: 心理资源库
- `UserKnowledgeFavorite`: 用户知识库收藏
- `FavoriteCheckResult`: 收藏状态检查结果

#### 特性

- ✅ 无需登录即可浏览所有内容（分类、文章、问答、资源）
- ✅ 登录后可使用收藏功能
- ✅ 支持全文搜索
- ✅ 支持分页查询
- ✅ 支持点赞功能
- ✅ 自动增加浏览次数

#### 迁移指引

- 无破坏性改动
- 新功能独立模块，原有代码无需修改
- 导入方式: `import { PsychologyApi } from './src'`

#### 文件变更

- 新增: `types/psychology.ts` - 心理知识库类型定义
- 新增: `apis/PsychologyApi.ts` - 心理知识库 API 实现
- 修改: `index.ts` - 导出新增 API 与类型
- 更新: `README.md`, `CHANGELOG.md`

## 0.4.5 (2025-11-16)

### 📍 地理位置客户端传递

#### 新增字段

- **SessionCreateRequest.location**: 新增 `location` 字段，客户端传递地理位置信息
  - 字段类型: `Record<string, unknown> | undefined`
  - 字段说明: 客户端在创建会话时传递用户所在地理位置，用于提供本地化服务
  - 示例值: `{ country: '中国', province: '广东省', city: '深圳市' }`

#### 架构变更

- **移除服务端IP定位**: 不再使用 `IpLocationService` 进行服务端IP定位
- **客户端主动传递**: 改为客户端在创建会话时主动传递位置信息
- **优势**:
  - 位置信息更准确，避免IP定位误差
  - 支持用户手动选择位置
  - 减轻服务端计算负担
  - 提升隐私保护（用户可选择是否提供位置）

#### 使用示例

```typescript
import { LlmSessionsApi } from './src';

const api = new LlmSessionsApi();

// 创建会话时传递位置信息
const session = await api.createSession({ 
  userId: 1,
  location: { 
    country: '中国', 
    province: '广东省', 
    city: '深圳市',
    latitude: 22.5431,
    longitude: 114.0579
  }
});

// location 字段为可选，不传递时服务端不会进行本地化处理
const sessionWithoutLocation = await api.createSession({ userId: 1 });
```

#### 影响范围

- `SessionCreateRequest` 接口新增可选的 `location` 字段
- `SessionCreateResponse` 中的 `location` 字段现在来自客户端传递的数据
- 服务端移除 `IpLocationService` 依赖
- 服务端 `SessionController` 不再进行IP定位查询

#### 迁移指引

- **无破坏性改动**: `location` 字段为可选，现有代码无需修改
- **推荐实践**: 客户端应在创建会话时传递位置信息以获得更好的本地化体验
- **位置获取方式**:
  - 浏览器: 使用 `navigator.geolocation` API 或 IP定位服务
  - 移动端: 使用原生定位API
  - 允许用户手动选择位置

#### 文件变更

- 修改: `types/session.ts` - `SessionCreateRequest` 接口新增 `location` 字段
- 修改: 后端 `SessionCreateRequest.java` - DTO 新增 `location` 字段
- 修改: 后端 `SessionController.java` - 移除 `IpLocationService` 依赖
- 移除: 后端 `IpLocationService.java` - 不再需要服务端IP定位
- 更新: `README.md` - 更新 LLM 会话示例，添加 `location` 使用说明
- 更新: `CHANGELOG.md` - 版本记录

### 🧠 判断理由字段支持

#### 新增字段

- **AdminRiskMessageDetection.reason**: 新增 `reason` 字段，存储 LLM 检测器的判断依据
  - 字段类型: `string | undefined`
  - 字段说明: 简明扼要说明为何得出此风险等级、情绪和意图的结论（100字以内）
  - 示例值: "当前消息表达持续的睡眠障碍和情绪低落，结合历史趋势风险有所上升"

#### 使用示例

```typescript
const detection = riskConversations[0]?.detections[0];
console.log('判断理由:', detection.reason);
// 输出: "消息表达强烈的无助感和自伤倾向"
```

#### 影响范围

- 风险检测结果现在包含 LLM 给出的判断理由，便于理解检测依据
- 后端数据库已添加 `reason` 字段存储
- LLM 提示词已更新，要求输出判断理由

#### 迁移指引

- 无破坏性改动，现有代码无需修改
- 新字段为可选字段，旧数据可能为 `undefined`
- 建议在前端 UI 中展示判断理由，提升风险评估的可解释性

#### 文件变更

- 修改: `types/admin.ts` - `AdminRiskMessageDetection` 接口新增 `reason` 字段
- 修改: 后端 `DetectionResult.java` - 数据结构新增 `reason` 字段
- 修改: 后端 `LlmRiskDetector.java` - 处理和解析 `reason` 字段
- 修改: 后端提示词 `detector.txt` - 要求 LLM 输出判断理由
- 修改: 数据库 `1-create.sql` - `risk_detection_results` 表新增 `reason` 字段
- 更新: `README.md` - 添加 `reason` 字段使用示例
- 更新: `CHANGELOG.md` - 版本记录

---

## 0.4.4 (2025-11-15)

### 🎯 意图检测增强

#### 类型更新

- **Intent 类型扩展**: 新增 5 个意图类型，支持更精细的对话意图识别
  - `CRISIS_SELF_HARM`: 危机/自伤自杀倾向（最高优先级）
  - `CLARIFICATION_REQUEST`: 澄清请求/没听懂
  - `FOLLOW_UP_QUESTION`: 跟进问题/后续追问
  - `OPINION`: 观点表达/主观评价
  - `TOXIC_ABUSE`: 辱骂/冒犯/有害言论

#### 类型定义

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

#### 影响范围

- `AdminRiskMessageDetection.intent` 字段现在支持更多枚举值
- 后端风险检测系统已更新规则库，支持新意图的自动识别
- LLM 检测器已配置上下文窗口，可基于历史对话分析累积风险

#### 迁移指引

现有代码无需修改，新的意图类型会在后端检测结果中自动返回。前端可根据新增的意图类型进行差异化处理：

```typescript
if (detection.intent === 'CRISIS_SELF_HARM') {
  // 危机处理：紧急通知、高优先级标记
} else if (detection.intent === 'TOXIC_ABUSE') {
  // 有害言论处理：内容审核、警告提示
}
```

## 0.4.3 (2025-11-14)

### 🔧 增强请求控制

#### 新增特性

- **RequestOptions.direct**: 新增 `direct` 选项，支持跳过 JWT/Admin API Key 认证的直连模式
- **TestApi 增强**: `TestApi.hello()` 方法现在接受可选的 `RequestOptions` 参数
- **在线状态检测优化**: 优化健康检查逻辑，使用 `direct: true` 避免认证失败干扰

#### 使用示例

```typescript
import { TestApi } from './src';

const testApi = new TestApi();

// 直连调用健康检查，不携带认证信息
await testApi.hello({ 
  direct: true,
  retry: { retries: 0 },
  signal: controller.signal 
});
```

#### 迁移指引

- 无破坏性改动，所有现有代码保持兼容
- 推荐在调用公开接口或健康检查时使用 `direct: true`
- 优化前端在线状态检测，避免因认证过期导致误判离线

#### 文件变更

- 修改：`http/httpClient.ts` - 新增 `direct` 选项处理逻辑
- 修改：`apis/TestApi.ts` - 方法签名支持 `RequestOptions`
- 修改：前端组件 - 在线状态检测使用直连模式
- 更新：`README.md` - 添加直连模式文档
- 更新：`CHANGELOG.md` - 版本记录

---

## 0.4.2 (2025-11-13)

### 📓 新增：用户日记模块

#### 新增 API

- `DiariesApi.createDiary(data)` 创建日记并自动心情分析
- `DiariesApi.updateDiary(id,data)` 更新日记并重新分析心情
- `DiariesApi.deleteDiary(id)` 删除日记
- `DiariesApi.getDiary(id)` 获取单条日记
- `DiariesApi.listDiaries()` 获取用户全部日记

#### 类型新增

- `UserDiary` / `CreateDiaryRequest` / `UpdateDiaryRequest`

#### 说明

- 后端会调用 LLM 生成 `moodDescription`（失败回退为 `未能分析`）。
- 无破坏性改动，原有功能不受影响。

#### 文件变更

- 新增：`types/diary.ts`, `apis/DiariesApi.ts`
- 修改：`index.ts` 导出新增类型与 API
- 更新：`README.md`, `CHANGELOG.md`

---

## 0.4.1 (2025-11-13)

### 🩺 新增：风险检测处理接口

#### 新增 API (0.4.1)

- `AdminApi.processRiskDetection(detectionId, { processed, processNotes })` 标记风险检测结果处理状态并添加备注

#### 类型更新

- `AdminRiskMessageDetection` 增加 `processed`, `processNotes`
- 新增请求体类型 `ProcessRiskDetectionPayload`

#### 迁移指引 (0.4.1)

- 旧代码无需修改；未处理结果默认 `processed = false`
- 若前端需展示处理备注，请读取 `processNotes`，为空表示无备注

#### 文件变更 (0.4.1)

- 修改：`types/admin.ts` - 新增字段与请求体类型
- 修改：`apis/AdminApi.ts` - 新增处理方法
- 更新：`README.md` - 添加接口文档与示例

---

## 0.4.0 (2025-11-12)

### 🔐 新增功能：管理员 API Key 认证

#### 新增 API

- `setAdminApiKey(apiKey: string | null)` - 设置管理员 API Key
- `getAdminApiKey()` - 获取当前管理员 API Key

#### 核心变更

1. **HTTP 客户端优先级调整**
   - 如果设置了 Admin API Key，将使用 `X-Admin-API-Key` 请求头
   - Admin API Key 优先于 JWT Token
   - 两种认证方式互斥

2. **AdminApi 增强**
   - 添加详细的 JSDoc 注释
   - 新增 `requestAs()` 方法，允许管理员访问系统中的任意接口
   - 完善类型定义

3. **文档更新**
   - README.md 添加管理员认证完整使用指南
   - 新增 `examples/admin-api.example.ts` 示例文件

#### 使用示例

```typescript
import { setAdminApiKey, AdminApi } from './client';

// 设置管理员 API Key
setAdminApiKey('ADMIN_KEY_your_key_here');

const admin = new AdminApi();

// 访问管理员专用接口
const users = await admin.getAllUsers();
const risks = await admin.getRiskConversations(1);

// 管理员访问任意接口
const conversations = await admin.requestAs('GET', '/api/conversations/123');
```

#### 迁移指引

- 管理员认证与普通用户认证互斥
- 设置 Admin API Key 后，所有请求将忽略 JWT Token
- 需要切换回普通用户时，调用 `setAdminApiKey(null)`

#### 文件变更

- 修改：`config/api.config.ts` - 添加 Admin API Key 管理
- 修改：`http/httpClient.ts` - 支持 Admin API Key 请求头
- 修改：`index.ts` - 导出新的管理员认证函数
- 增强：`apis/AdminApi.ts` - 添加 `requestAs()` 方法
- 新增：`examples/admin-api.example.ts` - 完整使用示例
- 更新：`README.md` - 添加管理员认证章节

---

## 0.3.0 (2025-11-11)

### Breaking

- ProfilesApi
  - GET/POST 与服务端 DTO 对齐：响应改为 `UserProfileDto`，其中 JSON
    字段（interests 等）为 `string[]`。
  - `save` 方法入参改为 `UserProfileSave`，可传 `string[]` 或 JSON 字符串；
    SDK 会自动将数组序列化为 JSON 字符串以兼容后端实体入参。
- LlmSessionsApi
  - `SessionCreateResponse.userProfile` 类型从 `Record<string, unknown>` 调整为 `UserProfileDto`。

### Migration

- 若代码中将 `resp.userProfile.interests` 当作字符串使用，请改为数组处理。
- 保存画像时，直接传 `string[]`，SDK 会负责序列化。

### Notes

- 本次改动仅同步类型与序列化策略，不改变后端数据库表结构。
