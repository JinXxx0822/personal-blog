// 数据库种子脚本：部署时自动填充测试数据
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

function seedDatabase(dbPath) {
  console.log('🔍 检查数据库是否需要种子数据...');
  
  const db = new sqlite3.Database(dbPath);
  
  db.get('SELECT COUNT(*) as count FROM articles', (err, row) => {
    if (err) {
      console.error('❌ 检查数据库失败:', err.message);
      db.close();
      return;
    }
    
    if (row.count > 0) {
      console.log(`✅ 数据库已有 ${row.count} 篇文章，跳过种子`);
      db.close();
      return;
    }
    
    console.log('🌱 开始填充种子数据...');
    
    // 1. 创建测试用户
    const adminId = uuidv4();
    const user2Id = uuidv4();
    const adminPass = bcrypt.hashSync('admin123', 10);
    const testPass = bcrypt.hashSync('test123', 10);
    const now = new Date().toISOString();
    
    db.run('INSERT INTO users (id, username, password, nickname, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [adminId, 'admin', adminPass, '博客站长', '', now]);
    db.run('INSERT INTO users (id, username, password, nickname, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [user2Id, 'testuser', testPass, '测试用户', '', now]);
    console.log('  ✓ 用户创建完成');
    
    // 2. 创建文章
    const articles = [
      {
        id: uuidv4(), title: 'Vue 3 入门指南：从零搭建前端项目',
        summary: '详细介绍如何使用 Vite + Vue 3 搭建现代化的前端项目，包含组件化开发、路由配置、状态管理等核心概念。',
        content: `# Vue 3 入门指南

## 为什么选择 Vue 3？

Vue 3 是 Vue.js 的最新主版本，带来了许多令人兴奋的新特性：

- **Composition API**：更灵活的代码组织方式
- **更好的 TypeScript 支持**：类型推断更准确
- **更小的包体积**：Tree-shaking 友好
- **更快的渲染性能**：基于 Proxy 的响应式系统

## 创建项目

\`\`\`bash
npm create vite@latest my-app -- --template vue
cd my-app
npm install
npm run dev
\`\`\`

## 核心概念

### 1. 响应式数据

Vue 3 使用 \`ref\` 和 \`reactive\` 创建响应式数据：

\`\`\`js
import { ref, reactive } from 'vue'

const count = ref(0)
const state = reactive({
  message: 'Hello Vue 3!'
})
\`\`\`

### 2. 组合式函数

\`\`\`js
function useCounter() {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
}
\`\`\`

## 总结

Vue 3 是现代前端开发的优秀选择，上手快且功能强大。`,
        category: '前端', tags: 'Vue,JavaScript,前端开发', cover_url: '', views: 156, likes: 23, is_pinned: 1
      },
      {
        id: uuidv4(), title: 'Node.js Express 后端开发实战',
        summary: '使用 Express 框架快速搭建 RESTful API 服务，涵盖路由设计、中间件、数据库操作等核心知识。',
        content: `# Express 后端开发实战

## Express 简介

Express 是 Node.js 最流行的 Web 框架，简洁灵活，适合快速构建 API 服务。

## 快速开始

\`\`\`bash
mkdir my-api && cd my-api
npm init -y
npm install express cors
\`\`\`

\`\`\`js
const express = require('express')
const app = express()
const PORT = 3000

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World!' })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
\`\`\`

## 路由设计

\`\`\`js
const router = express.Router()

router.get('/', getAllItems)
router.get('/:id', getItemById)
router.post('/', createItem)
router.put('/:id', updateItem)
router.delete('/:id', deleteItem)
\`\`\`

## 中间件机制

Express 的中间件是处理请求的管道，常用中间件包括日志、CORS、JSON解析、错误处理等。`,
        category: '后端', tags: 'Node.js,Express,后端开发', cover_url: '', views: 98, likes: 15, is_pinned: 0
      },
      {
        id: uuidv4(), title: 'CSS Grid 布局完全指南',
        summary: '深入理解 CSS Grid 布局系统，从基础概念到实战案例，让你轻松掌握现代网页布局技术。',
        content: `# CSS Grid 布局完全指南

## 什么是 CSS Grid？

CSS Grid 是一个二维布局系统，可以同时处理行和列，让复杂的网页布局变得简单。

## 基础概念

### 网格容器

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: 20px;
}
\`\`\`

### 网格项定位

\`\`\`css
.item {
  grid-column: 1 / 3;  /* 占据第1到第3列 */
  grid-row: 2 / 4;     /* 占据第2到第4行 */
}
\`\`\`

## 实战案例：博客首页布局

\`\`\`css
.blog-layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "main  main  sidebar"
    "footer footer footer";
  grid-template-columns: 1fr 1fr 300px;
}
\`\`\`

Grid 布局让曾经需要 float 和 position 技巧的复杂布局变得无比简单。`,
        category: '前端', tags: 'CSS,布局,前端开发', cover_url: '', views: 132, likes: 18, is_pinned: 0
      },
      {
        id: uuidv4(), title: 'Python 数据分析入门：Pandas 实战',
        summary: '学习使用 Pandas 库进行数据清洗、转换和分析，掌握数据处理的核心技能。',
        content: `# Python 数据分析入门

## Pandas 基础

Pandas 是 Python 中最强大的数据分析库，提供了 DataFrame 和 Series 两种核心数据结构。

## 读取数据

\`\`\`python
import pandas as pd

# 读取 CSV
df = pd.read_csv('data.csv')

# 读取 Excel
df = pd.read_excel('data.xlsx')
\`\`\`

## 数据清洗

\`\`\`python
# 处理缺失值
df.dropna(inplace=True)
df.fillna(0, inplace=True)

# 去除重复
df.drop_duplicates(inplace=True)
\`\`\`

## 数据分析

\`\`\`python
# 描述性统计
df.describe()

# 分组聚合
df.groupby('category').mean()
\`\`\`

Pandas 让 Python 成为数据分析领域的王者。`,
        category: '笔记', tags: 'Python,数据分析,Pandas', cover_url: '', views: 87, likes: 12, is_pinned: 0
      },
      {
        id: uuidv4(), title: 'Git 团队协作最佳实践',
        summary: '分享 Git 分支管理策略、代码审查流程和常见协作问题的解决方案，提升团队开发效率。',
        content: `# Git 团队协作最佳实践

## 分支管理策略

推荐使用 Git Flow 或 GitHub Flow：

- **main**：主分支，生产代码
- **develop**：开发分支
- **feature/xxx**：功能分支
- **hotfix/xxx**：紧急修复分支

## Commit 规范

\`\`\`
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试相关
chore: 构建/工具
\`\`\`

## Code Review 流程

1. 创建 Pull Request
2. 描述清楚改动内容
3. 至少一人 Review
4. 所有评论解决后再合并

## 冲突解决

\`\`\`bash
git pull origin main
# 解决冲突
git add .
git commit -m "fix: 解决合并冲突"
\`\`\`

好的协作习惯能让团队效率翻倍。`,
        category: '笔记', tags: 'Git,团队协作,开发工具', cover_url: '', views: 76, likes: 9, is_pinned: 0
      },
      {
        id: uuidv4(), title: 'React Hooks 深入浅出',
        summary: '全面解析 React Hooks 的使用方法和原理，包括 useState、useEffect、useContext 等核心 Hook。',
        content: `# React Hooks 深入浅出

## 为什么需要 Hooks？

Hooks 让函数组件也能使用状态和生命周期特性，避免了 Class 组件的复杂性。

## useState

\`\`\`jsx
const [count, setCount] = useState(0)
const [user, setUser] = useState(null)
\`\`\`

## useEffect

\`\`\`jsx
useEffect(() => {
  // 组件挂载时执行
  fetchData()
  
  return () => {
    // 组件卸载时清理
    cleanup()
  }
}, []) // 空依赖：只执行一次
\`\`\`

## 自定义 Hook

\`\`\`jsx
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    return localStorage.getItem(key) || initialValue
  })
  
  useEffect(() => {
    localStorage.setItem(key, value)
  }, [key, value])
  
  return [value, setValue]
}
\`\`\`

Hooks 极大地简化了 React 开发。`,
        category: '前端', tags: 'React,Hooks,前端开发', cover_url: '', views: 110, likes: 14, is_pinned: 0
      },
    ];
    
    let articleCount = 0;
    articles.forEach((article) => {
      db.run(
        'INSERT INTO articles (id, title, summary, content, category, tags, cover_url, views, likes, is_pinned, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [article.id, article.title, article.summary, article.content, article.category, article.tags, article.cover_url, article.views, article.likes, article.is_pinned, now, now],
        function(err) {
          if (err) {
            console.error('  ❌ 插入文章失败:', err.message);
          } else {
            articleCount++;
          }
          if (articleCount === articles.length) {
            console.log(`  ✓ 文章创建完成 (${articles.length} 篇)`);
            seedComments(db, articles, now, () => {
              seedAnnouncements(db, now, () => {
                seedLinks(db, now, () => {
                  seedAbout(db, now, () => {
                    console.log('✅ 种子数据填充完成！');
                    db.close();
                  });
                });
              });
            });
          }
        }
      );
    });
  });
}

function seedComments(db, articles, now, callback) {
  const { v4: uuidv4 } = require('uuid');
  const comments = [
    { id: uuidv4(), article_id: articles[0].id, author: '读者小明', content: '写得非常好！Vue 3 的 Composition API 确实比 Options API 灵活很多，感谢分享！', parent_id: null },
    { id: uuidv4(), article_id: articles[0].id, author: '博客站长', content: '谢谢支持！有问题随时交流 😊', parent_id: null },
    { id: uuidv4(), article_id: articles[1].id, author: '后端开发者', content: 'Express 确实好用，配合一些常用中间件能快速搭出 API 服务。', parent_id: null },
  ];
  
  let count = 0;
  if (comments.length === 0) return callback();
  
  comments.forEach((c) => {
    db.run(
      'INSERT INTO comments (id, article_id, author, content, parent_id, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [c.id, c.article_id, c.author, c.content, c.parent_id, now],
      function(err) {
        count++;
        if (err) console.error('  ❌ 插入评论失败:', err.message);
        if (count === comments.length) {
          console.log(`  ✓ 评论创建完成 (${comments.length} 条)`);
          callback();
        }
      }
    );
  });
  
  // 更新第一条评论的 parent_id 关系（回复关系）
  setTimeout(() => {
    db.run('UPDATE comments SET parent_id = ? WHERE id = ?', [comments[0].id, comments[1].id]);
  }, 500);
}

function seedAnnouncements(db, now, callback) {
  const { v4: uuidv4 } = require('uuid');
  const announcements = [
    { id: uuidv4(), content: '🎉 欢迎来到我的个人博客！这里记录了我的学习心得和技术分享。', is_active: 1 },
    { id: uuidv4(), content: '📢 博客已上线 CloudBase，支持评论互动和收藏功能，欢迎使用！', is_active: 1 },
  ];
  
  let count = 0;
  announcements.forEach((a) => {
    db.run(
      'INSERT INTO announcements (id, content, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [a.id, a.content, a.is_active, now, now],
      function(err) {
        count++;
        if (err) console.error('  ❌ 插入公告失败:', err.message);
        if (count === announcements.length) {
          console.log(`  ✓ 公告创建完成 (${announcements.length} 条)`);
          callback();
        }
      }
    );
  });
}

function seedLinks(db, now, callback) {
  const { v4: uuidv4 } = require('uuid');
  const links = [
    { id: uuidv4(), name: 'Vue.js 官方文档', url: 'https://cn.vuejs.org/', description: 'Vue.js 中文官方文档', sort_order: 1 },
    { id: uuidv4(), name: 'Node.js 官网', url: 'https://nodejs.org/', description: 'Node.js 官方网站', sort_order: 2 },
    { id: uuidv4(), name: 'GitHub', url: 'https://github.com/', description: '全球最大的代码托管平台', sort_order: 3 },
  ];
  
  let count = 0;
  links.forEach((l) => {
    db.run(
      'INSERT INTO links (id, name, url, description, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [l.id, l.name, l.url, l.description, l.sort_order, now],
      function(err) {
        count++;
        if (err) console.error('  ❌ 插入友链失败:', err.message);
        if (count === links.length) {
          console.log(`  ✓ 友链创建完成 (${links.length} 个)`);
          callback();
        }
      }
    );
  });
}

function seedAbout(db, now, callback) {
  const { v4: uuidv4 } = require('uuid');
  const aboutContent = `# 关于我

你好！我是 **博客站长**，一名热爱技术的前端开发者。

## 技术栈

- **前端**：Vue 3 / React / CSS Grid
- **后端**：Node.js / Express
- **数据库**：SQLite / MySQL
- **工具**：Git / VS Code / Webpack / Vite

## 关于本博客

这个博客是我学习 Web 全栈开发的实践项目，使用以下技术构建：

- **前端**：Vue 3 + Vite + Vue Router
- **后端**：Express + SQLite
- **部署**：腾讯云 CloudBase

## 联系方式

欢迎在文章下方留言交流技术问题！`;
  
  db.run(
    'INSERT INTO about (id, content, updated_at) VALUES (?, ?, ?)',
    [uuidv4(), aboutContent, now],
    function(err) {
      if (err) {
        console.error('  ❌ 插入关于内容失败:', err.message);
      } else {
        console.log('  ✓ 关于内容创建完成');
      }
      callback();
    }
  );
}

// 直接运行
if (require.main === module) {
  const dbPath = path.join(__dirname, 'blog.db');
  seedDatabase(dbPath);
}

module.exports = seedDatabase;
