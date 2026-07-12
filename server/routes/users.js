const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

// ========================================
// 接口: POST /api/users/register - 注册
// ========================================
router.post('/register', (req, res) => {
  const { username, password, nickname } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({ error: '用户名不能为空' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: '密码不能少于6位' });
  }

  if (username.trim().length > 20) {
    return res.status(400).json({ error: '用户名不能超过20个字符' });
  }

  // 检查用户名是否已存在
  db.get('SELECT id FROM users WHERE username = ?', [username.trim()], (err, row) => {
    if (err) {
      return res.status(500).json({ error: '服务器错误' });
    }

    if (row) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    const id = uuidv4();
    const sql = 'INSERT INTO users (id, username, password, nickname) VALUES (?, ?, ?, ?)';

    db.run(sql, [id, username.trim(), password, nickname || username.trim()], function(err) {
      if (err) {
        return res.status(500).json({ error: '注册失败' });
      }

      res.status(201).json({
        id,
        username: username.trim(),
        nickname: nickname || username.trim(),
        message: '注册成功'
      });
    });
  });
});

// ========================================
// 接口: POST /api/users/login - 登录
// ========================================
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  const sql = 'SELECT id, username, nickname FROM users WHERE username = ? AND password = ?';

  db.get(sql, [username.trim(), password], (err, row) => {
    if (err) {
      return res.status(500).json({ error: '服务器错误' });
    }

    if (!row) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    res.json({
      id: row.id,
      username: row.username,
      nickname: row.nickname,
      message: '登录成功'
    });
  });
});

module.exports = router;
