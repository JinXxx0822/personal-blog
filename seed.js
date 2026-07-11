// 批量创建 10 篇文章的脚本
const http = require('http');

const articles = [
  {
    title: 'Vue 3 入门指南：从零搭建前端项目',
    summary: '详细介绍如何使用 Vite 创建 Vue 3 项目，理解组合式 API 的核心概念，以及组件化开发的最佳实践。',
    content: `## Vue 3 入门指南

Vue 3 是目前最流行的前端框架之一，它带来了组合式 API（Composition API）、更好的 TypeScript 支持以及更小的打包体积。

### 为什么选择 Vue 3

1. **组合式 API**：相比于 Vue 2 的选项式 API，组合式 API 让代码逻辑更清晰，复用更方便。
2. **性能提升**：Vue 3 使用 Proxy 代替 Object.defineProperty，响应式系统更快更强。
3. **TypeScript 支持**：Vue 3 本身是用 TypeScript 重写的，类型推断更准确。

### 使用 Vite 创建项目

\`\`\`bash
npm create vite@latest my-app -- --template vue
cd my-app
npm install
npm run dev
\`\`\`

### 组合式 API 示例

\`\`\`javascript
import { ref, computed } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)

function increment() {
  count.value++
}
\`\`\`

Vue 3 的学习曲线平缓，非常适合前端初学者入门。掌握 Vue 3 后，你可以轻松构建各种 Web 应用。`
  },
  {
    title: 'Node.js + Express 后端开发实战',
    summary: '手把手教你用 Express 框架搭建 RESTful API，连接数据库，实现完整的增删改查功能。',
    content: `## Node.js + Express 后端开发实战

Express 是 Node.js 最流行的 Web 框架，它简洁灵活，非常适合用来构建 RESTful API。

### 安装 Express

\`\`\`bash
npm init -y
npm install express
\`\`\`

### 创建第一个 API

\`\`\`javascript
const express = require('express')
const app = express()

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World!' })
})

app.listen(3000, () => {
  console.log('服务器启动成功')
})
\`\`\`

### RESTful API 设计原则

- **GET** /api/articles - 获取列表
- **GET** /api/articles/:id - 获取详情
- **POST** /api/articles - 创建资源
- **PUT** /api/articles/:id - 更新资源
- **DELETE** /api/articles/:id - 删除资源

### 中间件机制

Express 的中间件是请求处理的核心，常见的有：

- \`express.json()\` - 解析 JSON 请求体
- \`cors()\` - 处理跨域请求
- 自定义中间件 - 实现日志、认证等功能

Express 的生态系统非常成熟，是学习后端开发的绝佳选择。`
  },
  {
    title: 'SQLite 数据库入门：轻量级数据存储方案',
    summary: '了解 SQLite 的特点和基本用法，学习如何在 Node.js 项目中集成 SQLite 实现数据持久化。',
    content: `## SQLite 数据库入门

SQLite 是一个嵌入式的关系型数据库，它不需要单独的服务器进程，数据存储在一个文件中，非常适合小型项目和移动应用。

### SQLite 的特点

1. **零配置**：不需要安装数据库服务器，不需要配置
2. **轻量级**：整个数据库就是一个文件，方便备份和迁移
3. **跨平台**：支持 Windows、macOS、Linux
4. **标准 SQL**：支持大部分 SQL 标准语法

### 在 Node.js 中使用 SQLite

\`\`\`javascript
const sqlite3 = require('better-sqlite3')
const db = new sqlite3('database.db')

// 创建表
db.exec(\`CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)\`)

// 插入数据
const stmt = db.prepare('INSERT INTO articles (id, title, content) VALUES (?, ?, ?)')
stmt.run('1', '我的第一篇文章', '内容...')

// 查询数据
const articles = db.prepare('SELECT * FROM articles ORDER BY created_at DESC').all()
\`\`\`

### 适用场景

- 个人博客 / 小型网站
- 桌面应用程序
- 移动应用本地存储
- 原型开发和测试

SQLite 虽然小巧，但功能强大，是学习数据库的最佳起点。`
  },
  {
    title: '前后端分离架构详解',
    summary: '深入理解前后端分离的设计思想，了解如何通过 API 接口实现前端和后端的协作开发。',
    content: `## 前后端分离架构详解

前后端分离是现代 Web 开发的主流架构模式，它将前端界面和后端逻辑完全解耦，通过 API 进行数据交互。

### 什么是前后端分离

在传统开发中，后端负责渲染 HTML 页面（如 JSP、PHP），前端只做简单的样式。前后端分离后：

- **前端**：只负责界面展示和用户交互，通过 AJAX/Fetch 调用后端 API
- **后端**：只负责业务逻辑和数据处理，提供 RESTful API 接口
- **通信**：通过 JSON 格式交换数据

### 前后端分离的优势

1. **开发效率高**：前后端可以并行开发，互不阻塞
2. **职责清晰**：前端专注 UI/UX，后端专注业务逻辑
3. **可复用**：同一套 API 可以给 Web、App、小程序使用
4. **易于维护**：模块独立，修改一方不影响另一方

### 接口规范的重要性

前后端分离的关键是定义清晰的 API 接口：

\`\`\`
POST /api/articles
Content-Type: application/json

{
  "title": "文章标题",
  "content": "文章内容"
}
\`\`\`

响应格式统一：

\`\`\`json
{
  "id": "uuid",
  "title": "文章标题",
  "message": "创建成功"
}
\`\`\`

前后端分离让团队协作更高效，是每个开发者都应该掌握的架构模式。`
  },
  {
    title: 'Git 版本控制从入门到熟练',
    summary: '掌握 Git 的基本操作和常用命令，学会使用 GitHub 管理代码，了解团队协作的 Git 工作流。',
    content: `## Git 版本控制从入门到熟练

Git 是当今最流行的分布式版本控制系统，无论是个人项目还是团队协作，Git 都是必备技能。

### Git 基本配置

\`\`\`bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
\`\`\`

### 核心工作流程

\`\`\`bash
# 初始化仓库
git init

# 添加文件到暂存区
git add .

# 提交到本地仓库
git commit -m "feat: 添加新功能"

# 推送到远程仓库
git push origin main
\`\`\`

### 常用提交类型（约定式提交）

- **feat**: 新功能
- **fix**: 修复 bug
- **docs**: 文档更新
- **style**: 代码格式调整
- **refactor**: 代码重构
- **test**: 测试相关

### 分支管理

\`\`\`bash
# 创建并切换到新分支
git checkout -b feature/new-feature

# 合并分支
git checkout main
git merge feature/new-feature

# 删除分支
git branch -d feature/new-feature
\`\`\`

### GitHub 协作流程

1. Fork 目标仓库
2. Clone 到本地
3. 创建功能分支
4. 提交代码并 Push
5. 创建 Pull Request

掌握 Git 后，你的代码管理将变得井井有条，再也不用担心代码丢失。`
  },
  {
    title: 'CSS 布局技巧：Flexbox 和 Grid 完全指南',
    summary: '详细介绍 Flexbox 和 CSS Grid 两种现代布局方式，通过实例展示如何快速实现复杂的页面布局。',
    content: `## CSS 布局技巧：Flexbox 和 Grid 完全指南

CSS 布局经历了从 Table 到 Float，再到 Flexbox 和 Grid 的演进。现代 Web 开发中，Flexbox 和 Grid 是两大布局利器。

### Flexbox 弹性布局

Flexbox 适合**一维布局**，即沿一个方向（水平或垂直）排列元素。

\`\`\`css
.container {
  display: flex;
  justify-content: space-between;  /* 水平方向 */
  align-items: center;              /* 垂直方向 */
  gap: 20px;                        /* 间距 */
}
\`\`\`

常用属性：
- \`justify-content\`: 主轴对齐方式
- \`align-items\`: 交叉轴对齐方式
- \`flex-wrap\`: 是否换行
- \`flex: 1\`: 弹性增长比例

### CSS Grid 网格布局

Grid 适合**二维布局**，即同时控制行和列。

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* 三列等宽 */
  grid-template-rows: auto;
  gap: 20px;
}
\`\`\`

### 实际应用场景

- **Flexbox**：导航栏、卡片列表、居中元素、表单排列
- **Grid**：整体页面布局、图片画廊、仪表盘、复杂网格

### 响应式布局

结合媒体查询，轻松实现响应式：

\`\`\`css
@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;  /* 移动端一列 */
  }
}
\`\`\`

掌握这两种布局方式，你就能轻松应对各种页面设计需求。`
  },
  {
    title: 'JavaScript 异步编程：Promise 和 async/await',
    summary: '深入理解 JavaScript 的异步编程模型，从回调函数到 Promise 再到 async/await 的演进历程。',
    content: `## JavaScript 异步编程：Promise 和 async/await

JavaScript 是单线程语言，但通过事件循环机制实现了异步编程，这是 JS 最核心的特性之一。

### 回调函数时代

早期的异步编程使用回调函数：

\`\`\`javascript
fs.readFile('file.txt', (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(data)
})
\`\`\`

回调函数容易导致"回调地狱"——多层嵌套让代码难以阅读和维护。

### Promise 的诞生

Promise 解决了回调地狱问题：

\`\`\`javascript
fetch('/api/articles')
  .then(response => response.json())
  .then(data => {
    console.log(data)
  })
  .catch(error => {
    console.error('请求失败:', error)
  })
\`\`\`

Promise 有三种状态：
- **pending**（进行中）
- **fulfilled**（已成功）
- **rejected**（已失败）

### async/await 现代方案

async/await 让异步代码看起来像同步代码：

\`\`\`javascript
async function getArticles() {
  try {
    const response = await fetch('/api/articles')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('请求失败:', error)
  }
}
\`\`\`

### 并发处理

\`\`\`javascript
// 并行请求多个 API
const [articles, users] = await Promise.all([
  fetch('/api/articles').then(r => r.json()),
  fetch('/api/users').then(r => r.json())
])
\`\`\`

理解异步编程是成为合格 JavaScript 开发者的必经之路。`
  },
  {
    title: 'Web 应用部署指南：从本地到云端',
    summary: '介绍如何使用 Vercel 部署前端、Railway 部署后端，让个人项目拥有线上访问地址。',
    content: `## Web 应用部署指南：从本地到云端

开发完成后，将项目部署到云端是最后一步。以下是常用且免费的部署方案。

### 前端部署：Vercel

Vercel 是最流行的前端部署平台，支持自动从 GitHub 部署。

**步骤：**
1. 将代码推送到 GitHub
2. 访问 vercel.com，用 GitHub 账号登录
3. 点击 "New Project"，选择你的仓库
4. 配置构建设置：
   - Framework: Vite
   - Build Command: \`npm run build\`
   - Output Directory: \`dist\`
5. 点击 Deploy

### 后端部署：Railway

Railway 提供免费的 Node.js 后端托管。

**步骤：**
1. 访问 railway.app，用 GitHub 登录
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择后端仓库
4. 配置环境变量（如有需要）
5. 自动部署完成

### 数据库部署

- **Supabase**：免费 PostgreSQL，有 RESTful API
- **PlanetScale**：免费 MySQL 兼容数据库
- **Neon**：免费 Serverless PostgreSQL

### 环境变量管理

上线后，敏感信息（数据库密码等）应通过环境变量配置：

\`\`\`
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
API_BASE_URL=https://your-api.railway.app
\`\`\`

### 自定义域名

以上平台都支持绑定自定义域名，让你的项目看起来更专业。

部署上线后，任何人都能通过 URL 访问你的项目，这是最有成就感的一步！`
  },
  {
    title: '代码健壮性：编写高质量的 JavaScript 代码',
    summary: '学习输入校验、错误处理、边界条件判断等技巧，写出更健壮可靠的应用程序。',
    content: `## 代码健壮性：编写高质量的 JavaScript 代码

代码健壮性是指程序在面对异常输入、网络故障、服务器错误等情况时，依然能够稳定运行的能力。

### 输入校验

永远不要信任用户输入：

\`\`\`javascript
function createArticle(title, content) {
  // 检查是否为空
  if (!title || !title.trim()) {
    throw new Error('标题不能为空')
  }
  
  // 检查长度限制
  if (title.trim().length > 100) {
    throw new Error('标题不能超过100字')
  }
  
  // 检查内容长度
  if (!content || content.trim().length < 10) {
    throw new Error('内容太短')
  }
  
  // 继续处理...
}
\`\`\`

### 异常处理

使用 try-catch 捕获异常：

\`\`\`javascript
async function fetchArticles() {
  try {
    const response = await fetch('/api/articles')
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`)
    }
    return await response.json()
  } catch (error) {
    console.error('获取文章失败:', error)
    return []  // 返回空数组而不是崩溃
  }
}
\`\`\`

### 边界条件处理

- 空数组 / null / undefined 检查
- 数字的除零、负数情况
- 字符串的空格、特殊字符
- 文件大小的上限检查

### 防御性编程原则

1. **假设最坏情况**：任何可能出错的地方都会出错
2. **优雅降级**：出错时提供合理的降级方案
3. **用户友好提示**：给用户清晰的错误信息
4. **日志记录**：记录错误便于排查问题

健壮性是专业程序员和业余程序员的重要区别。`
  },
  {
    title: '我的博客开发之旅：从零到上线的全记录',
    summary: '记录使用 Vue 3 + Express + SQLite 搭建个人博客系统的完整过程，分享遇到的问题和解决方案。',
    content: `## 我的博客开发之旅

这个个人博客系统是我学习前后端分离开发的重要实践。以下是我从零到上线的完整记录。

### 技术选型

经过调研，我选择了以下技术栈：
- **前端**：Vue 3 + Vite + Vue Router
- **后端**：Node.js + Express
- **数据库**：SQLite
- **部署**：Vercel + Railway

### 开发过程

#### 第一阶段：项目初始化

使用 AI 辅助工具快速生成了项目骨架，包括前端路由配置、后端 API 框架、数据库表设计。

#### 第二阶段：核心功能开发

实现了三个核心页面：
1. **首页**：文章列表，支持卡片式展示
2. **详情页**：文章完整内容阅读
3. **编辑页**：创建和修改文章

后端实现了 5 个 RESTful API 接口，覆盖完整的 CRUD 操作。

#### 第三阶段：UI 优化

使用紫色渐变主题，设计简洁现代的界面风格。添加了加载状态、空状态提示等用户体验细节。

### 遇到的挑战

1. **跨域问题**：前后端分离开发时遇到 CORS 错误，通过配置 cors 中间件解决
2. **数据校验**：需要在前端和后端同时进行输入校验，确保数据安全
3. **部署配置**：不同平台的构建配置略有差异，需要仔细阅读文档

### 收获总结

通过这个项目，我不仅掌握了前后端分离的开发流程，还学会了：
- RESTful API 设计
- 数据库基本操作
- Git 版本控制
- 项目部署上线

这是非常有成就感的一次开发体验！`
  }
];

function postArticle(article) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(article);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/articles',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          console.log('✓ 创建成功:', article.title);
          resolve();
        } else {
          console.log('✗ 创建失败:', article.title, '-', body);
          reject(new Error(body));
        }
      });
    });

    req.on('error', (err) => {
      console.log('✗ 请求错误:', article.title, '-', err.message);
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

async function seedAll() {
  console.log('开始批量创建 10 篇文章...\n');
  let success = 0;
  for (const article of articles) {
    try {
      await postArticle(article);
      success++;
    } catch (e) {
      // 继续处理下一篇
    }
  }
  console.log(`\n完成！成功创建 ${success}/${articles.length} 篇文章`);
}

seedAll();
