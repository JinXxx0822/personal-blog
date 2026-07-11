const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

// ========================================
// 接口1: GET /api/articles - 获取文章列表
// ========================================
router.get('/', (req, res) => {
  const sql = 'SELECT id, title, summary, created_at FROM articles ORDER BY created_at DESC';

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('查询文章列表失败:', err);
      return res.status(500).json({ error: '查询文章列表失败' });
    }
    res.json(rows);
  });
});

// ========================================
// 接口2: GET /api/articles/:id - 获取文章详情
// ========================================
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM articles WHERE id = ?';

  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error('查询文章详情失败:', err);
      return res.status(500).json({ error: '查询文章详情失败' });
    }

    if (!row) {
      return res.status(404).json({ error: '文章不存在' });
    }

    res.json(row);
  });
});

// ========================================
// 接口3: POST /api/articles - 创建文章
// ========================================
router.post('/', (req, res) => {
  const { title, summary, content } = req.body;

  // 输入校验
  if (!title || !title.trim()) {
    return res.status(400).json({ error: '标题不能为空' });
  }

  if (!content || !content.trim()) {
    return res.status(400).json({ error: '正文不能为空' });
  }

  if (title.trim().length > 100) {
    return res.status(400).json({ error: '标题不能超过100字' });
  }

  if (content.trim().length < 10) {
    return res.status(400).json({ error: '正文内容太短，请至少输入10个字' });
  }

  const id = uuidv4();
  const sql = 'INSERT INTO articles (id, title, summary, content) VALUES (?, ?, ?, ?)';
  const finalSummary = summary && summary.trim() ? summary.trim() : content.trim().substring(0, 100);

  db.run(sql, [id, title.trim(), finalSummary, content.trim()], function(err) {
    if (err) {
      console.error('创建文章失败:', err);
      return res.status(500).json({ error: '创建文章失败' });
    }

    res.status(201).json({
      id,
      title: title.trim(),
      summary: finalSummary,
      message: '文章创建成功'
    });
  });
});

// ========================================
// 接口4: PUT /api/articles/:id - 更新文章
// ========================================
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, summary, content } = req.body;

  // 输入校验
  if (!title || !title.trim()) {
    return res.status(400).json({ error: '标题不能为空' });
  }

  if (!content || !content.trim()) {
    return res.status(400).json({ error: '正文不能为空' });
  }

  if (title.trim().length > 100) {
    return res.status(400).json({ error: '标题不能超过100字' });
  }

  const sql = 'UPDATE articles SET title = ?, summary = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  const finalSummary = summary && summary.trim() ? summary.trim() : content.trim().substring(0, 100);

  db.run(sql, [title.trim(), finalSummary, content.trim(), id], function(err) {
    if (err) {
      console.error('更新文章失败:', err);
      return res.status(500).json({ error: '更新文章失败' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: '文章不存在' });
    }

    res.json({ message: '文章更新成功' });
  });
});

// ========================================
// 接口5: DELETE /api/articles/:id - 删除文章
// ========================================
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM articles WHERE id = ?';

  db.run(sql, [id], function(err) {
    if (err) {
      console.error('删除文章失败:', err);
      return res.status(500).json({ error: '删除文章失败' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: '文章不存在' });
    }

    res.json({ message: '文章删除成功' });
  });
});

module.exports = router;
