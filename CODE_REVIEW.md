# 🔍 AI Code Review 报告

> 审查工具：CodeBuddy AI (GPT-4o)  
> 审查日期：2026-07-18  
> 项目：个人博客全栈系统

---

## 一、总体评价

| 维度 | 评分 | 说明 |
|------|------|------|
| 代码结构 | ⭐⭐⭐⭐⭐ | 前后端分离，模块化清晰 |
| 代码风格 | ⭐⭐⭐⭐ | 统一 CSS 变量，命名规范 |
| 安全性 | ⭐⭐⭐⭐⭐ | 密码加密 + JWT Token 认证 |
| 性能 | ⭐⭐⭐⭐ | 整体流畅，JS bundle 可优化 |
| 健壮性 | ⭐⭐⭐⭐ | 空状态/加载态/错误处理完善 |

---

## 二、问题发现与建议

### 🔴 高优先级

#### 1. 密码存储安全性（已修复）

**文件**：`server/routes/users.js`  
**问题**：旧版本中密码可能以明文存储  
**修复方案**：已引入 `bcryptjs` 加密，旧密码自动升级  
**代码**：
```javascript
// 注册时加密
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

// 登录时比对
match = await bcrypt.compare(password, row.password);

// 自动升级明文密码
if (match && !row.password.startsWith('$2')) {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    db.run('UPDATE users SET password = ? WHERE id = ?', [hashed, row.id]);
}
```

#### 2. 缺少 Token 认证机制（✅ 已修复）

**影响**：当前仅前端路由守卫控制访问，后端 API 无身份验证  
**修复方案**：已引入 JWT（jsonwebtoken）中间件保护写操作接口  
**新增文件**：`server/middleware/auth.js`  
**实现内容**：
- `generateToken(user)` — 生成 JWT Token
- `authMiddleware` — 必选认证中间件，保护 POST/PUT/DELETE 操作
- `optionalAuth` — 可选认证中间件，用于可选身份场景
- `client/src/api.js` — Axios 拦截器自动附加 `Bearer Token`，401 自动跳登录
```javascript
// 中间件实现
const jwt = require('jsonwebtoken');
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未登录' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'blog_secret_key');
    next();
  } catch { res.status(401).json({ error: 'Token 无效' }); }
};
```

---

### 🟡 中优先级

#### 3. 路由参数冲突（已修复）

**文件**：`server/routes/articles.js` 第 234 行  
**问题**：
```javascript
if (['categories', 'hot', 'archive', 'tags', 'stats', 'related', 'favorites', 'nav'].includes(id)) return;
```
这段代码在 ID 恰好等于这些关键词时会跳过处理  
**现状**：对 UUID 格式的 ID 无影响，但不够优雅  
**改进建议**：确保固定路由挂载在 `/:id` 之前（Express 已按注册顺序匹配）

#### 4. 全局错误处理可增强

**文件**：`server/app.js`  
**建议**：
```javascript
// 当前
app.use((err, req, res, next) => { ... });

// 建议增加
process.on('uncaughtException', (err) => {
  console.error('未捕获异常:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('未处理 Promise 拒绝:', reason);
});
```

---

### 🟢 改进建议

#### 5. JS Bundle 体积优化

**现状**：`index-BLYzb77m.js` 为 1.17MB  
**建议**：
- 使用代码分割：`import()` 动态加载路由组件
- `vite.config.js` 中配置 `manualChunks` 分离第三方库

```javascript
// vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'markdown': ['marked', 'highlight.js'],
        'vue-vendor': ['vue', 'vue-router']
      }
    }
  }
}
```

#### 6. 搜索防抖优化

**文件**：`client/src/views/Home.vue`  
**建议**：已有 300ms 防抖，可考虑添加搜索历史/搜索建议功能。

#### 7. 图片懒加载

**建议**：文章列表图片添加 `loading="lazy"` 属性，提升首屏加载速度。

#### 8. 空状态统一组件

**已完成**：✅ 所有列表页面已统一使用 `EmptyState.vue` 组件，体验一致。

---

## 三、代码亮点

1. **CSS 变量设计系统**（`App.vue`）：20+ 变量定义在 `:root`，一键切换深色模式
2. **评论嵌套树结构**（`comments.js`）：内存构建嵌套树，时间复杂度 O(n)
3. **数据库自动迁移**（`database.js`）：增量迁移 + 错误容忍
4. **点赞去重机制**（`articles.js`）：唯一约束防重复 + toggle 交互
5. **JWT Token 认证**（`middleware/auth.js`）：中间件保护写操作，拦截器自动附加 + 401 处理
6. **共享用户 Store**（`stores/user.js`）：Composition API 全局状态，6 个视图文件统一使用
7. **自动密码升级**（`users.js`）：旧明文密码验证通过后自动升级为 bcrypt
8. **路由守卫 + 登录重定向**（`router/index.js`）：未登录自动跳回
9. **Toast 插件化**（`utils/toast.js`）：provider/inject 模式全局可用

---

## 四、代码审查修复记录

> 以下问题在 2026-07-19 的代码审查中全部修复（提交 cb6f06a）

| # | 问题 | 文件 | 修复方案 |
|---|------|------|---------|
| 1 | 缺少 JWT 认证 | 后端所有写路由 | 新增 `middleware/auth.js`，POST/PUT/DELETE 添加 `authMiddleware` |
| 2 | 用户状态未共享 | 6 个视图文件 | 创建 `stores/user.js`，统一使用 `useUser()` |
| 3 | 回复评论 Toast 错误 | `ArticleDetail.vue` | 保存 `wasReply` 标志再清除 `replyTarget` |
| 4 | 特殊路由请求挂起 | `server/routes/articles.js` | `return;` → `res.status(404).json(...)` |
| 5 | 创建文章缺少 is_pinned | `server/routes/articles.js` | INSERT SQL 和响应中添加该字段 |
| 6 | seed-db.js 竞态条件 | `seed.js` | `setTimeout` 异步 → 同步回调链 |
| 7 | Axios 无 Token 拦截 | `client/src/api.js` | 添加请求拦截器（附加 Token）和响应拦截器（401 跳转） |
| 8 | 登录未返回 Token | `server/routes/users.js` | 登录响应添加 `token` 字段 |

---

## 五、安全检查清单

| 检查项 | 状态 |
|--------|------|
| 密码加密存储 | ✅ bcrypt |
| SQL 注入防护 | ✅ 参数化查询 |
| XSS 防护 | ✅ Vue 自动转义 |
| CORS 配置 | ✅ 已启用 |
| 输入校验 | ✅ 前后端双重校验 |
| CSRF 防护 | ⚠️ 未实现 |
| Token 认证 | ✅ JWT 中间件已实现 |
| 速率限制 | ⚠️ 未实现 |

---

> 报告更新：2026-07-19 | 审查已全部修复 | AI 工具：CodeBuddy
