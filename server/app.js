const express = require('express');
const cors = require('cors');
const db = require('./database');
const articlesRouter = require('./routes/articles');
const commentsRouter = require('./routes/comments');
const usersRouter = require('./routes/users');
const linksRouter = require('./routes/links');
const aboutRouter = require('./routes/about');
const announcementsRouter = require('./routes/announcements');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 路由
app.use('/api/articles', articlesRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/users', usersRouter);
app.use('/api/links', linksRouter);
app.use('/api/about', aboutRouter);
app.use('/api/announcements', announcementsRouter);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '博客系统后端运行正常' });
});

// 数据库统计概览（用于考核截图）
app.get('/api/stats/overview', (req, res) => {
  const tables = ['articles', 'comments', 'users', 'links', 'announcements', 'favorites', 'likes'];
  const counts = {};
  const dbPath = path.join(__dirname, 'blog.db');
  const dbSize = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0;

  let pending = tables.length;
  tables.forEach((table) => {
    db.get(`SELECT COUNT(*) AS count FROM ${table}`, (err, row) => {
      counts[table] = err ? 0 : row.count;
      pending--;
      if (pending === 0) {
        db.get('SELECT title, views, likes FROM articles ORDER BY views DESC LIMIT 1', (err, hot) => {
          res.json({
            status: 'ok',
            database: {
              file: 'server/blog.db',
              sizeBytes: dbSize,
              sizeKB: Math.round(dbSize / 1024 * 100) / 100,
            },
            counts,
            hotArticle: err ? null : hot,
            timestamp: new Date().toISOString(),
          });
        });
      }
    });
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    error: '服务器内部错误',
    message: err.message
  });
});

// 自动种子数据库
const seedDatabase = require('./seed-db');
const dbPath = path.join(__dirname, 'blog.db');

app.listen(PORT, () => {
  console.log(`博客系统后端已启动: http://localhost:${PORT}`);
  console.log('支持功能: 文章CRUD | 分类标签 | 搜索分页 | 评论回复 | 用户认证 | 点赞收藏 | 标签云 | 归档 | 友链 | 关于 | 公告');
  
  // 启动后自动检查并填充种子数据
  seedDatabase(dbPath);
});

module.exports = app;
