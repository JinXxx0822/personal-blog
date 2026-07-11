const express = require('express');
const cors = require('cors');
const articlesRouter = require('./routes/articles');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/articles', articlesRouter);

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
  console.log(`API 地址: http://localhost:${PORT}/api`);
});

module.exports = app;
