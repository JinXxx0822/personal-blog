const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

// ========================================
// 接口: GET /api/comments/:articleId - 获取文章评论
// ========================================
router.get('/:articleId', (req, res) => {
  const { articleId } = req.params;
  const sql = 'SELECT * FROM comments WHERE article_id = ? ORDER BY created_at DESC';

  db.all(sql, [articleId], (err, rows) => {
    if (err) {
      console.error('查询评论失败:', err);
      return res.status(500).json({ error: '查询评论失败' });
    }
    res.json(rows);
  });
});

// ========================================
// 接口: POST /api/comments - 创建评论
// ========================================
router.post('/', (req, res) => {
  const { article_id, author, content } = req.body;

  if (!article_id) {
    return res.status(400).json({ error: '文章ID不能为空' });
  }

  if (!content || !content.trim()) {
    return res.status(400).json({ error: '评论内容不能为空' });
  }

  if (content.trim().length > 500) {
    return res.status(400).json({ error: '评论不能超过500字' });
  }

  const id = uuidv4();
  const finalAuthor = author && author.trim() ? author.trim() : '匿名';
  const sql = 'INSERT INTO comments (id, article_id, author, content) VALUES (?, ?, ?, ?)';

  db.run(sql, [id, article_id, finalAuthor, content.trim()], function(err) {
    if (err) {
      console.error('创建评论失败:', err);
      return res.status(500).json({ error: '创建评论失败' });
    }

    res.status(201).json({
      id,
      article_id,
      author: finalAuthor,
      content: content.trim(),
      message: '评论成功'
    });
  });
});

// ========================================
// 接口: DELETE /api/comments/:id - 删除评论
// ========================================
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM comments WHERE id = ?';

  db.run(sql, [id], function(err) {
    if (err) {
      console.error('删除评论失败:', err);
      return res.status(500).json({ error: '删除评论失败' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: '评论不存在' });
    }

    res.json({ message: '评论删除成功' });
  });
});

module.exports = router;
