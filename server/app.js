const express = require('express');
const cors = require('cors');
const articlesRouter = require('./routes/articles');
const commentsRouter = require('./routes/comments');
const usersRouter = require('./routes/users');
const linksRouter = require('./routes/links');
const aboutRouter = require('./routes/about');

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

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '博客系统后端运行正常' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    error: '服务器内部错误',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`博客系统后端已启动: http://localhost:${PORT}`);
  console.log('支持功能: 文章CRUD | 分类标签 | 搜索分页 | 评论 | 用户认证 | 点赞收藏 | 标签云 | 归档 | 友链 | 关于');
});

module.exports = app;
