# 📡 博客系统 API 接口文档

> 基础 URL：`http://localhost:3000/api`

---

## 1. 文章接口 `/api/articles`

### 1.1 获取文章列表（分页 + 搜索 + 分类）

```
GET /api/articles?page=1&pageSize=6&keyword=Vue&category=技术&tag=JavaScript
```

**查询参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 6 |
| keyword | string | 否 | 搜索关键词（标题+正文） |
| category | string | 否 | 分类筛选 |
| tag | string | 否 | 标签筛选 |

**成功响应 (200)**：
```json
{
  "articles": [
    {
      "id": "abc-123",
      "title": "文章标题",
      "summary": "摘要",
      "category": "技术",
      "tags": "Vue,JavaScript",
      "cover_url": "/covers/xxx.png",
      "views": 120,
      "likes": 15,
      "is_pinned": 0,
      "created_at": "2026-07-12T04:23:11.000Z"
    }
  ],
  "total": 25,
  "totalPages": 5,
  "page": 1,
  "pageSize": 6
}
```

### 1.2 获取文章详情

```
GET /api/articles/:id
```

**说明**：自动增加阅读量 +1

**成功响应 (200)**：
```json
{
  "id": "abc-123",
  "title": "文章标题",
  "content": "# Markdown 正文...",
  "summary": "摘要",
  "category": "技术",
  "tags": "Vue,JavaScript",
  "cover_url": "/covers/xxx.png",
  "views": 121,
  "likes": 15,
  "is_pinned": 0,
  "created_at": "2026-07-12T04:23:11.000Z",
  "updated_at": "2026-07-12T04:23:11.000Z"
}
```

**错误响应 (404)**：`{ "error": "文章不存在" }`

### 1.3 创建文章

```
POST /api/articles
Content-Type: application/json
```

**请求体**：
```json
{
  "title": "Hello World",
  "content": "# 这是一篇文章",
  "summary": "文章摘要（可选，默认取正文前100字）",
  "category": "技术",
  "tags": "Vue, JavaScript",
  "cover_url": "https://example.com/cover.jpg"
}
```

**校验规则**：
- `title` 必填，不超过 100 字
- `content` 必填，不少于 10 字
- `category` 默认 "笔记"
- `tags` 可选

**成功响应 (201)**：
```json
{
  "id": "xxx-xxx",
  "title": "Hello World",
  "message": "文章创建成功"
}
```

### 1.4 更新文章

```
PUT /api/articles/:id
```

请求体同创建，额外支持 `is_pinned` 字段。

### 1.5 删除文章

```
DELETE /api/articles/:id
```

**说明**：级联删除关联的评论、点赞、收藏。

### 1.6 热门文章

```
GET /api/articles/hot/list
```

按阅读量倒序，返回 Top 5。

### 1.7 文章归档

```
GET /api/articles/archive/list
```

**响应**：按 `年月` 分组的文章列表。

### 1.8 标签云

```
GET /api/articles/tags/cloud
```

### 1.9 分类列表

```
GET /api/articles/categories/all
```

### 1.10 站点统计

```
GET /api/articles/stats/overview
```

**响应**：
```json
{
  "total": 10,
  "totalViews": 1250,
  "totalLikes": 89,
  "totalComments": 34,
  "totalCategories": 4
}
```

### 1.11 相关文章

```
GET /api/articles/related/:id
```

返回同分类或同标签的文章，最多 5 篇。

### 1.12 上下篇导航

```
GET /api/articles/:id/nav
```

### 1.13 点赞/取消点赞

```
POST /api/articles/:id/like
```

**请求体**：
```json
{ "user_id": "user-123" }
```

**说明**：同一用户重复请求会取消点赞（toggle 机制）。

### 1.14 收藏相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/articles/:id/favorite` | 添加收藏 `{ "user_id": "" }` |
| DELETE | `/api/articles/:id/favorite/:userId` | 取消收藏 |
| GET | `/api/articles/:id/favorite/:userId` | 查询收藏状态 |
| GET | `/api/articles/favorites/user/:userId` | 用户收藏列表 |

---

## 2. 评论接口 `/api/comments`

### 2.1 获取文章评论

```
GET /api/comments/:articleId
```

**响应**：树形嵌套结构（评论 + 回复）

```json
[
  {
    "id": "c1",
    "author": "小明",
    "content": "写得真好",
    "parent_id": null,
    "replies": [
      {
        "id": "c2",
        "author": "作者",
        "content": "谢谢！",
        "parent_id": "c1",
        "replies": []
      }
    ]
  }
]
```

### 2.2 创建评论/回复

```
POST /api/comments
```

**请求体**：
```json
{
  "article_id": "abc-123",
  "author": "小明",
  "content": "说得好！",
  "parent_id": null
}
```

**说明**：`parent_id` 不为空时为回复，会校验父评论是否存在。

**校验规则**：`content` 必填，不超过 500 字。

### 2.3 删除评论

```
DELETE /api/comments/:id
```

**说明**：级联删除子回复。

---

## 3. 用户接口 `/api/users`

### 3.1 注册

```
POST /api/users/register
```

```json
{
  "username": "admin",
  "password": "123456",
  "nickname": "管理员"
}
```

**校验规则**：
- `username` 必填，不超过 20 字符
- `password` 不少于 6 位
- 用户名不可重复

### 3.2 登录

```
POST /api/users/login
```

```json
{
  "username": "admin",
  "password": "123456"
}
```

**成功响应 (200)**：
```json
{
  "id": "user-xxx",
  "username": "admin",
  "nickname": "管理员",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "登录成功"
}
```

**说明**：密码使用 bcrypt 哈希存储，兼容旧明文密码自动升级。  
**认证**：登录成功返回 JWT Token，后续请求需在 Header 中携带 `Authorization: Bearer <token>`。

### 3.3 JWT 认证说明

所有写操作接口（POST/PUT/DELETE）均需要 JWT Token 认证。

**请求头格式**：
```
Authorization: Bearer <token>
```

**保护接口**：
| 操作 | 保护范围 |
|------|---------|
| 创建/编辑/删除文章 | `/api/articles` POST/PUT/DELETE |
| 发布/删除评论 | `/api/comments` POST/DELETE |
| 友链管理 | `/api/links` POST/PUT/DELETE |
| 关于页编辑 | `/api/about` PUT |
| 公告管理 | `/api/announcements` POST/PUT/DELETE |

**未认证响应 (401)**：
```json
{ "error": "未登录" }
```

---

## 4. 友链接口 `/api/links`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/links` | 获取友链列表 |
| POST | `/api/links` | 添加友链 `{"name":"","url":"","description":""}` |
| DELETE | `/api/links/:id` | 删除友链 |

---

## 5. 关于接口 `/api/about`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/about` | 获取关于内容 |
| POST | `/api/about` | 保存关于内容 `{"content":"Markdown"}` |

---

## 6. 公告接口 `/api/announcements`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/announcements` | 获取活跃公告（最新一条） |
| GET | `/api/announcements/all` | 获取所有公告 |
| POST | `/api/announcements` | 创建公告 `{"content":""}` |
| PUT | `/api/announcements/:id` | 更新公告（可修改内容和状态） |
| DELETE | `/api/announcements/:id` | 删除公告 |

---

## 7. 健康检查

```
GET /api/health
```

**响应**：
```json
{ "status": "ok", "message": "博客系统后端运行正常" }
```

---

## 错误码说明

| HTTP 状态码 | 说明 |
|-------------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 参数校验不通过 |
| 401 | 未登录或密码错误 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 数据库表结构

| 表名 | 说明 | 主要字段 |
|------|------|---------|
| articles | 文章 | id, title, content, category, tags, views, likes, is_pinned |
| comments | 评论 | id, article_id, author, content, parent_id |
| users | 用户 | id, username, password(bcrypt), nickname |
| likes | 点赞 | id, user_id, article_id (唯一约束防重复) |
| favorites | 收藏 | id, user_id, article_id (唯一约束) |
| links | 友链 | id, name, url, description |
| about | 关于 | id, content |
| announcements | 公告 | id, content, is_active |

---

> 文档生成日期：2026-07-18 | 项目版本：v1.0
