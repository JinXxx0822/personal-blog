const jwt = require('jsonwebtoken');

// JWT 密钥（生产环境应从环境变量读取）
const JWT_SECRET = process.env.JWT_SECRET || 'personal-blog-jwt-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

// 生成 Token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// 验证 Token 中间件
function authMiddleware(req, res, next) {
  // 从 Header 或 query 中获取 token
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.query.token;

  if (!token) {
    return res.status(401).json({ error: '请先登录' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '登录已过期，请重新登录' });
    }
    return res.status(401).json({ error: '认证失败' });
  }
}

// 可选认证：有 token 就解析，没有也放行
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.query.token;

  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (e) { /* ignore */ }
  }
  next();
}

module.exports = { generateToken, authMiddleware, optionalAuth, JWT_SECRET };
