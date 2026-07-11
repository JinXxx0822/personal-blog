# 个人博客系统

移动应用项目工程实践课程项目 - AI 辅助编程实践

## 项目介绍

一个前后端分离的个人博客系统，支持文章的创建、编辑、查看和删除。

**3 个功能模块：**
1. **文章列表页** - 展示所有文章，点击可进入详情
2. **文章详情页** - 查看文章完整内容，支持编辑和删除
3. **文章编辑页** - 创建新文章或编辑已有文章

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | Vue 3 + Vite | 响应式 UI 框架 |
| 前端路由 | Vue Router | 3 个独立路由页面 |
| HTTP 请求 | Axios | 与后端 API 通信 |
| 后端 | Node.js + Express | RESTful API 服务 |
| 数据库 | SQLite | 轻量级本地数据库 |

## 项目结构

```
personal/
├── client/                 # 前端项目
│   ├── src/
│   │   ├── views/
│   │   │   ├── Home.vue          # 文章列表页
│   │   │   ├── ArticleDetail.vue # 文章详情页
│   │   │   └── ArticleEdit.vue   # 写文章/编辑页
│   │   ├── router/index.js       # 路由配置
│   │   ├── App.vue               # 主组件
│   │   └── main.js               # 入口文件
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                 # 后端项目
│   ├── routes/
│   │   └── articles.js     # 文章 API 路由
│   ├── database.js         # 数据库连接和初始化
│   ├── app.js              # 后端入口
│   └── package.json
├── package.json
└── README.md
```

## 快速开始

### 环境要求

- Node.js 16.0 或以上版本

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

或者一键安装：
```bash
npm run install:all
```

### 启动项目

**同时启动前后端：**
```bash
# 在项目根目录执行
npm run dev
```

**分别启动：**

```bash
# 终端1 - 启动后端（端口3000）
cd server
node app.js

# 终端2 - 启动前端（端口5173）
cd client
npm run dev
```

启动后访问：`http://localhost:5173`

## API 接口文档

### 基础地址
`http://localhost:3000/api`

### 接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/articles` | 获取文章列表 |
| GET | `/api/articles/:id` | 获取文章详情 |
| POST | `/api/articles` | 创建文章 |
| PUT | `/api/articles/:id` | 更新文章 |
| DELETE | `/api/articles/:id` | 删除文章 |

### 接口详情

#### 1. 获取文章列表
```
GET /api/articles
```
**响应示例：**
```json
[
  {
    "id": "uuid-xxx",
    "title": "文章标题",
    "summary": "文章摘要...",
    "created_at": "2026-07-11 12:00:00"
  }
]
```

#### 2. 获取文章详情
```
GET /api/articles/:id
```
**响应示例：**
```json
{
  "id": "uuid-xxx",
  "title": "文章标题",
  "summary": "文章摘要...",
  "content": "文章正文内容...",
  "created_at": "2026-07-11 12:00:00",
  "updated_at": "2026-07-11 12:00:00"
}
```

#### 3. 创建文章
```
POST /api/articles
Content-Type: application/json

{
  "title": "文章标题",
  "summary": "文章摘要（可选）",
  "content": "文章正文内容"
}
```

#### 4. 更新文章
```
PUT /api/articles/:id
Content-Type: application/json

{
  "title": "更新后的标题",
  "summary": "更新后的摘要",
  "content": "更新后的内容"
}
```

#### 5. 删除文章
```
DELETE /api/articles/:id
```

## 部署上线

推荐使用以下免费平台：

- **前端**：Vercel (https://vercel.com) 或 Netlify
- **后端**：Railway (https://railway.app) 或 Render (https://render.com)
- **数据库**：Supabase 免费 PostgreSQL (https://supabase.com)

部署时需将 `client/vite.config.js` 中的代理地址改为后端实际部署地址。

## 健壮性设计

- 标题和正文非空校验
- 标题 100 字限制
- 正文最少 10 字要求
- 文章不存在时返回 404
- 数据库操作异常捕获
- 全局错误处理中间件
