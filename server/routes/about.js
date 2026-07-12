const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

// 获取关于我内容
router.get('/', (req, res) => {
  db.get('SELECT * FROM about ORDER BY updated_at DESC LIMIT 1', [], (err, row) => {
    if (err) return res.status(500).json({ error: '获取失败' });
    res.json(row || { content: '' });
  });
});

// 保存关于我内容
router.post('/', (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: '内容不能为空' });
  
  // 先删除旧记录
  db.run('DELETE FROM about', [], (err) => {
    const id = uuidv4();
    db.run('INSERT INTO about (id, content) VALUES (?, ?)', [id, content], function(err) {
      if (err) return res.status(500).json({ error: '保存失败' });
      res.json({ message: '保存成功' });
    });
  });
});

module.exports = router;
