const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

// 获取友情链接列表
router.get('/', (req, res) => {
  db.all('SELECT * FROM links ORDER BY sort_order, created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: '获取友链失败' });
    res.json(rows);
  });
});

// 添加友情链接
router.post('/', authMiddleware, (req, res) => {
  const { name, url, description } = req.body;
  if (!name || !url) return res.status(400).json({ error: '名称和链接不能为空' });
  
  const id = uuidv4();
  db.run('INSERT INTO links (id, name, url, description) VALUES (?, ?, ?, ?)', 
    [id, name.trim(), url.trim(), description || ''], function(err) {
    if (err) return res.status(500).json({ error: '添加失败' });
    res.status(201).json({ id, name: name.trim(), message: '添加成功' });
  });
});

// 删除友情链接
router.delete('/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM links WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: '删除失败' });
    res.json({ message: '删除成功' });
  });
});

module.exports = router;
