# 📸 项目截图包

## (3) 数据库、接口、AI Code Review 截图

---

## 一、数据库结构（8 张表）

### articles（文章表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | UUID 主键 |
| title | TEXT NOT NULL | 文章标题 |
| summary | TEXT | 文章摘要 |
| content | TEXT NOT NULL | 文章内容(Markdown) |
| category | TEXT | 分类（技术/生活/笔记等） |
| tags | TEXT | 标签（逗号分隔） |
| cover_url | TEXT | 封面图片路径 |
| views | INTEGER | 阅读量 |
| likes | INTEGER | 点赞数 |
| is_pinned | INTEGER | 是否置顶(0/1) |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### comments（评论表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | UUID |
| article_id | TEXT FK | 关联文章 |
| author | TEXT | 评论者 |
| content | TEXT | 评论内容 |
| parent_id | TEXT FK | 父评论ID(嵌套回复) |
| created_at | DATETIME | 创建时间 |

### users（用户表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | UUID |
| username | TEXT UNIQUE | 用户名 |
| password | TEXT | bcrypt 加密密码 |
| nickname | TEXT | 昵称 |
| avatar | TEXT | 头像 |
| created_at | DATETIME | 创建时间 |

### favorites（收藏表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | UUID |
| user_id | TEXT FK | 用户ID |
| article_id | TEXT FK | 文章ID |
| created_at | DATETIME | 创建时间 |
| *UNIQUE(user_id, article_id)* | | 防重复收藏 |

### likes（点赞表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | UUID |
| user_id | TEXT FK | 用户ID |
| article_id | TEXT FK | 文章ID |
| created_at | DATETIME | 创建时间 |
| *UNIQUE(user_id, article_id)* | | 防重复点赞 |

### links（友链表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | UUID |
| name | TEXT | 站点名称 |
| url | TEXT | 链接地址 |
| description | TEXT | 站点描述 |
| sort_order | INTEGER | 排序 |
| created_at | DATETIME | 创建时间 |

### announcements（公告表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | UUID |
| content | TEXT | 公告内容 |
| is_active | INTEGER | 是否启用 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### about（关于表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | UUID |
| content | TEXT | 关于内容(Markdown) |
| updated_at | DATETIME | 更新时间 |

---

## 二、数据库统计概览

API: `GET /api/stats/overview`

```json
{
  "status": "ok",
  "database": {
    "file": "server/blog.db",
    "sizeBytes": 106496,
    "sizeKB": 104
  },
  "counts": {
    "articles": 11,
    "announcements": 0,
    "favorites": 0,
    "users": 2,
    "likes": 0,
    "links": 0,
    "comments": 1
  },
  "hotArticle": {
    "title": "Vue 3 入门指南：从零搭建前端项目",
    "views": 4,
    "likes": 0
  }
}
```

---

## 三、API 接口响应示例

### 1. 文章列表 - `GET /api/articles`

```json
{
  "articles": [
    {
      "id": "56514faa-6092-4d3b-a1be-09d7596206a2",
      "title": "Vue 3 入门指南：从零搭建前端项目",
      "summary": "详细介绍如何使用 Vite 创建 Vue 3 项目...",
      "category": "技术",
      "tags": "Vue,前端,JavaScript",
      "cover_url": "/covers/A_modern_web_development_works.png",
      "views": 4,
      "likes": 0,
      "is_pinned": 0,
      "created_at": "2026-07-12 22:37:27"
    },
    {
      "id": "49c69671-300f-4526-abe0-ed58dd5d1247",
      "title": "Node.js + Express 后端开发实战",
      "summary": "手把手教你用 Express 框架搭建 RESTful API...",
      "category": "技术",
      "tags": "Node.js,Express,后端",
      "views": 3,
      "likes": 0,
      "is_pinned": 0,
      "created_at": "2026-07-12 22:37:27"
    }
    // ... 共 11 篇文章
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 11,
    "totalPages": 2
  }
}
```

### 2. API 接口完整列表

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /api/articles | 文章列表（分页/搜索/分类/标签） |
| GET | /api/articles/hot | 热门文章 |
| GET | /api/articles/:id | 文章详情（+阅读量） |
| POST | /api/articles | 创建文章 |
| PUT | /api/articles/:id | 更新文章 |
| DELETE | /api/articles/:id | 删除文章 |
| POST | /api/articles/:id/like | 点赞/取消点赞 |
| POST | /api/articles/:id/favorite | 收藏/取消收藏 |
| GET | /api/articles/:id/comments | 文章评论（嵌套结构） |
| POST | /api/articles/:id/comments | 添加评论/回复 |
| GET | /api/tags | 标签云 |
| GET | /api/archive | 文章归档 |
| GET | /api/stats/overview | 统计概览 |
| GET | /api/links | 友链列表 |
| POST | /api/links | 添加友链 |
| DELETE | /api/links/:id | 删除友链 |
| GET | /api/about | 关于内容 |
| PUT | /api/about | 更新关于 |
| GET | /api/announcements | 公告列表 |
| POST | /api/announcements | 创建公告 |
| DELETE | /api/announcements/:id | 删除公告 |
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/register | 用户注册 |
| GET | /api/health | 健康检查 |

---

## 四、AI Code Review 关键发现

> 详见 `CODE_REVIEW.md`

### 发现问题清单

| 等级 | 问题 | 位置 | 状态 |
|------|------|------|:--:|
| 🔴 严重 | 路由参数 id 与关键字冲突 | articles.js | ✅ 已修复 |
| 🟡 警告 | 评论树构建缺少排序 | articles.js | ✅ 已修复 |
| 🟡 警告 | 输入验证不足 | 多个路由 | ⚠️ 建议加固 |
| 🔵 建议 | 添加请求频率限制 | app.js | 📋 计划中 |
| 🔵 建议 | 图片上传大小限制 | app.js | 📋 计划中 |

### 主要修复

**1. 路由关键字冲突（严重）**

```javascript
// ❌ 问题代码
if (['categories', 'hot'].includes(id)) { ... }

// ✅ 修复后
const keywordRoutes = ['categories', 'hot', 'search', 'archive', 'tags'];
if (keywordRoutes.includes(id)) { ... }
router.get('/:id', ...);
```

**2. 评论树排序缺失**

```javascript
// ✅ 修复：按时间排序
children.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
```

---

## 五、前端页面效果说明

### 首页 (Home)
- 英雄区：博客标题 + 统计数据（文章数/分类数/标签数）
- 文章卡片：封面图、标题、摘要、分类、标签、阅读量、点赞数
- 分类筛选：全部/技术/生活/笔记
- 搜索功能：标题+摘要关键词搜索
- 暗色模式切换

### 文章详情 (ArticleDetail)
- Markdown 渲染 + 代码高亮
- 文章目录导航
- 点赞/收藏/分享
- 评论嵌套回复

### 其他页面
- 归档 (Archive)：按年月分组
- 友链 (Links)：站点卡片
- 关于 (About)：个人介绍
- 登录 (Login)：用户名密码登录
- 编辑 (ArticleEdit)：Markdown 编辑器

### 设计特色
- CSS 变量设计系统（20+ 变量）
- 响应式布局（桌面/平板/手机）
- 卡片动画 + Toast 通知
- 全局 EmptyState 空状态组件

---

## 六、完整 API 响应 JSON 文件

| 文件 | 接口 | 大小 |
|------|------|------|
| api-articles.json | GET /api/articles | 包含 11 篇文章 |
| api-stats.json | GET /api/stats/overview | 数据库统计 |
| api-links.json | GET /api/links | 友链数据 |
| api-announcements.json | GET /api/announcements | 公告数据 |
| api-about.json | GET /api/about | 关于内容 |

---

> 📸 截图包版本：v1.0 | 生成时间：2026-07-18
> 💡 补充说明：实际网页截图需用浏览器打开 http://localhost:5173 后自行截图，或使用下面"演示录屏"部分的方法录制。
