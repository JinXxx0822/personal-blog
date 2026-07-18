const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

// 获取当前活跃的公告
router.get('/', (req, res) => {
  db.get('SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1', [], (err, row) => {
    if (err) return res.status(500).json({ error: '查询公告失败' });
    res.json(row || null);
  });
});

// 获取所有公告（管理用）
router.get('/all', (req, res) => {
  db.all('SELECT * FROM announcements ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: '查询公告失败' });
    res.json(rows);
  });
});

// 创建公告
router.post('/', (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: '公告内容不能为空' });
  }

  const id = uuidv4();
  db.run('INSERT INTO announcements (id, content) VALUES (?, ?)', [id, content.trim()], function(err) {
    if (err) return res.status(500).json({ error: '创建公告失败' });
    res.status(201).json({ id, content: content.trim(), message: '公告发布成功' });
  });
});

// 更新公告（停用/启用或修改内容）
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { content, is_active } = req.body;

  if (content !== undefined && !content.trim()) {
    return res.status(400).json({ error: '公告内容不能为空' });
  }

  let sql, params;
  if (content !== undefined && is_active !== undefined) {
    sql = 'UPDATE announcements SET content = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    params = [content.trim(), is_active ? 1 : 0, id];
  } else if (content !== undefined) {
    sql = 'UPDATE announcements SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    params = [content.trim(), id];
  } else {
    sql = 'UPDATE announcements SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    params = [is_active ? 1 : 0, id];
  }

  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ error: '更新公告失败' });
    if (this.changes === 0) return res.status(404).json({ error: '公告不存在' });
    res.json({ message: '公告更新成功' });
  });
});

// 删除公告
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM announcements WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: '删除公告失败' });
    if (this.changes === 0) return res.status(404).json({ error: '公告不存在' });
    res.json({ message: '公告删除成功' });
  });
});

module.exports = router;
