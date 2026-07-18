# 📝 个人博客系统

> 移动应用项目工程实践课程项目 — AI 辅助编程全栈开发

[![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3.x-003B57?logo=sqlite)](https://sqlite.org/)

一个功能完整、界面精美的前后端分离个人博客系统，使用 AI 辅助开发。

**在线演示**：CloudBase 已部署，点击下方链接访问，本地启动访问 `http://localhost:5173`

## 🌐 线上访问

| 服务 | 地址 |
|------|------|
| 前端页面（CloudBase） | https://personal-personal-blog-d1gbix7hwd3a696bd.webapps.tcloudbase.com |
| 前端页面（EdgeOne 备用） | https://personal-dpkrx3sdot8v.edgeone.dev |
| 后端 API | http://localhost:3000/api （本地运行） |

> **部署平台**：腾讯云 CloudBase 静态网站托管
> 
> 说明：后端服务当前为本地运行，演示时请使用 `npm run dev` 启动；前端页面已部署到 CloudBase，可直接访问。考核兜底方式见下方「部署上线」。

---

## 🎯 项目介绍

本项目是一个功能完备的个人博客平台，支持文章的创建、编辑、查看和互动，拥有 8 个独立路由页面和丰富的后端 API。特色包括：

- 📝 **文章管理** — 完整 CRUD，支持 Markdown 编辑/预览/分屏
- 💬 **评论系统** — 嵌套回复（楼中楼），带删除功能
- ❤️ **点赞收藏** — 去重机制，记录用户偏好
- 📌 **文章置顶** — 突出重要内容
- 🔍 **搜索筛选** — 关键词搜索（防抖）+ 分类 + 标签云
- 🌙 **暗色模式** — 一键切换，自动记忆
- 📢 **公告系统** — 网站全局公告栏
- 📊 **数据统计** — 文章/分类/阅读/评论统计
- 👤 **用户认证** — 注册/登录，路由守卫 + 登录重定向
- 📄 **SEO 优化** — 动态标题 + Meta 标签

## 🏗️ 技术架构

| 层级 | 技术选型 | 作用 |
|------|---------|------|
| 前端框架 | Vue 3 (Composition API) | 响应式 UI + 路由管理 |
| 构建工具 | Vite 5 | 极速开发与构建 |
| 路由 | Vue Router 4 | 8 个独立路由 + 导航守卫 |
| HTTP | Axios | API 请求与拦截 |
| Markdown | marked + highlight.js | 富文本渲染与代码高亮 |
| 后端框架 | Express.js 4 | RESTful API 服务 |
| 数据库 | better-sqlite3 | 轻量级本地数据库 |
| 认证 | bcrypt | 密码加密存储 |
| 消息通知 | Toast 插件 | 全局操作反馈 |

## 📂 项目结构

```
personal/
├── client/                        # 前端项目
│   ├── src/
│   │   ├── views/
│   │   │   ├── Home.vue           # 首页（英雄区/统计/热门/文章列表）
│   │   │   ├── ArticleDetail.vue  # 文章详情（目录/评论/导航）
│   │   │   ├── ArticleEdit.vue    # 写文章/编辑（Markdown 编辑器）
│   │   │   ├── Login.vue          # 登录/注册页
│   │   │   ├── Archive.vue        # 文章归档（时间轴）
│   │   │   ├── About.vue          # 关于页（可编辑 Markdown）
│   │   │   ├── Links.vue          # 友情链接管理
│   │   │   └── Favorites.vue      # 收藏列表
│   │   ├── components/
│   │   │   ├── Toast.vue          # 全局通知组件
│   │   │   └── EmptyState.vue     # 空状态展示组件
│   │   ├── utils/
│   │   │   └── toast.js           # Toast 插件
│   │   ├── router/index.js        # 路由配置 + 守卫
│   │   ├── App.vue                # 根组件（导航/页脚/主题/公告）
│   │   └── main.js                # 入口
│   ├── index.html                 # HTML 入口（SEO Meta）
│   ├── vite.config.js             # Vite 配置 + 代理
│   └── package.json
├── server/                        # 后端项目
│   ├── routes/
│   │   ├── articles.js            # 文章 API（CRUD/搜索/分类/标签/统计）
│   │   ├── comments.js            # 评论 API（嵌套回复/级联删除）
│   │   ├── users.js               # 用户 API（注册/登录/bcrypt）
│   │   ├── links.js               # 友链 API
│   │   ├── about.js               # 关于 API
│   │   └── announcements.js       # 公告 API
│   ├── database.js                # 数据库初始化 + 自动迁移
│   ├── app.js                     # Express 入口 + 中间件
│   └── package.json
├── package.json                   # 根目录脚本
└── README.md                      # 项目文档
```

## 🚀 快速开始

### 环境要求

- **Node.js** >= 16.0

### 安装 & 启动

```bash
# 1. 安装所有依赖
npm run install:all

# 2. 同时启动前后端
npm run dev

# 3. 浏览器打开
# http://localhost:5173
```

### 可选：插入示例数据

```bash
node seed.js
```

---

## 📡 API 接口文档

**基础 URL**：`http://localhost:3000/api`

### 文章接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/articles` | 获取文章列表（支持 `?page=&pageSize=&keyword=&category=`） |
| `GET` | `/api/articles/:id` | 获取文章详情（自动增加阅读量） |
| `POST` | `/api/articles` | 创建文章 |
| `PUT` | `/api/articles/:id` | 更新文章 |
| `DELETE` | `/api/articles/:id` | 删除文章 |
| `GET` | `/api/articles/related/:id` | 获取相关文章（同分类/同标签） |
| `GET` | `/api/articles/:id/nav` | 获取上一篇/下一篇 |
| `POST` | `/api/articles/:id/like` | 点赞/取消点赞 |
| `GET` | `/api/articles/:id/like/:userId` | 查询点赞状态 |
| `POST` | `/api/articles/:id/favorite` | 收藏文章 |
| `DELETE` | `/api/articles/:id/favorite/:userId` | 取消收藏 |
| `GET` | `/api/articles/:id/favorite/:userId` | 查询收藏状态 |
| `GET` | `/api/articles/favorites/user/:userId` | 用户收藏列表 |
| `GET` | `/api/articles/categories/all` | 所有分类 |
| `GET` | `/api/articles/tags/cloud` | 标签云 |
| `GET` | `/api/articles/hot/list` | 热门文章（Top 5） |
| `GET` | `/api/articles/stats/overview` | 站点统计数据 |
| `GET` | `/api/articles/archive/list` | 按月归档 |

### 评论接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/comments/:articleId` | 获取文章评论（含嵌套回复） |
| `POST` | `/api/comments` | 创建评论（支持 `parent_id` 回复） |
| `DELETE` | `/api/comments/:id` | 删除评论（级联删除子回复） |

### 用户接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/users/register` | 注册（`username, password, nickname`） |
| `POST` | `/api/users/login` | 登录（返回用户信息） |

### 其他接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/links` | 友链列表 |
| `POST` | `/api/links` | 添加友链 |
| `DELETE` | `/api/links/:id` | 删除友链 |
| `GET` | `/api/about` | 获取关于内容 |
| `POST` | `/api/about` | 更新关于内容 |
| `GET` | `/api/announcements` | 获取活跃公告 |
| `POST` | `/api/announcements` | 创建公告 |
| `PUT` | `/api/announcements/:id` | 更新公告 |

### 核心接口示例

#### 创建文章
```json
POST /api/articles
{
  "title": "Hello World",
  "content": "# Hello\n这是一篇测试文章",
  "category": "技术",
  "tags": "Vue, JavaScript",
  "cover_url": "https://example.com/cover.jpg",
  "is_pinned": false
}
```

#### 获取文章列表（带分页搜索）
```
GET /api/articles?page=1&pageSize=6&keyword=Vue&category=技术
```

响应：
```json
{
  "articles": [...],
  "total": 25,
  "totalPages": 5,
  "page": 1,
  "pageSize": 6
}
```

#### 发表评论回复
```json
POST /api/comments
{
  "article_id": "abc-123",
  "author": "小明",
  "content": "说得太好了！",
  "parent_id": "comment-456"
}
```

---

## 🚢 部署上线

### 当前线上部署

| 项目 | 平台 | 状态 | 地址 |
|------|------|------|------|
| 前端页面 | CloudBase 静态网站托管 | ✅ 已部署 | https://personal-personal-blog-d1gbix7hwd3a696bd.webapps.tcloudbase.com |
| 前端页面 | EdgeOne Pages（备用） | ✅ 已部署 | https://personal-dpkrx3sdot8v.edgeone.dev |
| 后端 API | 本地服务 | ⚠️ 本地运行 | http://localhost:3000/api |

### 本地演示（推荐）

```bash
npm run dev
# 前端 http://localhost:5173
# 后端 http://localhost:3000/api
```

### 其他可选平台

| 服务 | 推荐平台 | 说明 |
|------|---------|------|
| 前端 | [Vercel](https://vercel.com) / [Netlify](https://netlify.com) | 静态站点托管 |
| 后端 | [Render](https://render.com) / [Railway](https://railway.app) | Node.js 服务托管 |

---

## 🛡️ 健壮性设计

- ✅ 表单校验：标题/正文非空，标题 100 字限制，正文最少 10 字
- ✅ 密码加密：bcrypt 哈希存储
- ✅ 路由守卫：未登录拦截 + 登录后自动跳回
- ✅ 点赞去重：同一用户对同一文章只能点赞一次
- ✅ 空状态处理：所有列表页面统一空状态展示
- ✅ 加载态：骨架屏 + Spinner 双重加载反馈
- ✅ 错误处理：全局 Toast 反馈 + 后端异常捕获
- ✅ 响应式：全平台适配（桌面/平板/手机）

---

## 📋 课程考核要点对照

| 要求 | 实现 |
|------|------|
| 3 个以上独立路由 | ✅ 8 个路由页面 |
| 3 个以上后台接口 | ✅ 30+ API 接口 |
| 前端 + 后端 + 数据库 | ✅ Vue 3 + Express + SQLite |
| 部署上线（URL 访问） | ✅ EdgeOne Pages（进行中） |
| 功能完整度 50% | ✅ 文章 CRUD + 评论 + 点赞 + 收藏 + 搜索 + 分类 |
| 工程规范/代码质量 25% | ✅ 模块化 + CSS 变量 + 组件复用 + 路由守卫 + Git 多日提交 |
| AI 工具使用 20% | ✅ AI 辅助编码 + 代码审查 + Prompt 日志 |
| README 文档 | ✅ 完整接口文档 + 项目介绍 + 启动指南 |
| UI 体验/界面美观 | ✅ 现代设计 + 暗色模式 + 动画过渡 + 响应式 |
| 代码审查报告 | ✅ [CODE_REVIEW.md](./CODE_REVIEW.md) |
| Prompt 日志 | ✅ [prompt_log.md](./prompt_log.md) |
| 个人总结报告 | ✅ [SUMMARY.md](./SUMMARY.md) |

---

## 📝 License

MIT

---

## 📚 提交物清单

| 文档 | 说明 |
|------|------|
| [README.md](./README.md) | 项目介绍/技术栈/安装运行指南 |
| [API_DOCS.md](./API_DOCS.md) | 完整接口文档 (30+ API) |
| [prompt_log.md](./prompt_log.md) | AI 使用过程记录与 Prompt 日志 |
| [CODE_REVIEW.md](./CODE_REVIEW.md) | AI Code Review 报告 |
| [SUMMARY.md](./SUMMARY.md) | 个人实训总结报告 (750字) |
