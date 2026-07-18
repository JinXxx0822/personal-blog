const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

// ========================================
// 接口: GET /api/comments/:articleId - 获取文章评论（含嵌套回复）
// ========================================
router.get('/:articleId', (req, res) => {
  const { articleId } = req.params;
  const sql = 'SELECT * FROM comments WHERE article_id = ? ORDER BY created_at ASC';

  db.all(sql, [articleId], (err, rows) => {
    if (err) {
      console.error('查询评论失败:', err);
      return res.status(500).json({ error: '查询评论失败' });
    }

    // 构建嵌套树结构
    const commentMap = {};
    const rootComments = [];

    rows.forEach(row => {
      row.replies = [];
      commentMap[row.id] = row;
    });

    rows.forEach(row => {
      if (row.parent_id && commentMap[row.parent_id]) {
        commentMap[row.parent_id].replies.push(row);
      } else {
        rootComments.push(row);
      }
    });

    res.json(rootComments);
  });
});

// ========================================
// 接口: POST /api/comments - 创建评论（支持回复）
// ========================================
router.post('/', authMiddleware, (req, res) => {
  const { article_id, author, content, parent_id } = req.body;

  if (!article_id) {
    return res.status(400).json({ error: '文章ID不能为空' });
  }

  if (!content || !content.trim()) {
    return res.status(400).json({ error: '评论内容不能为空' });
  }

  if (content.trim().length > 500) {
    return res.status(400).json({ error: '评论不能超过500字' });
  }

  // 如果是回复，校验父评论存在
  if (parent_id) {
    db.get('SELECT id FROM comments WHERE id = ? AND article_id = ?', [parent_id, article_id], (err, parent) => {
      if (err || !parent) {
        return res.status(400).json({ error: '回复的评论不存在' });
      }
      insertComment();
    });
  } else {
    insertComment();
  }

  function insertComment() {
    const id = uuidv4();
    const finalAuthor = author && author.trim() ? author.trim() : '匿名';
    const sql = 'INSERT INTO comments (id, article_id, author, content, parent_id) VALUES (?, ?, ?, ?, ?)';

    db.run(sql, [id, article_id, finalAuthor, content.trim(), parent_id || null], function(err) {
      if (err) {
        console.error('创建评论失败:', err);
        return res.status(500).json({ error: '创建评论失败' });
      }

      res.status(201).json({
        id,
        article_id,
        author: finalAuthor,
        content: content.trim(),
        parent_id: parent_id || null,
        replies: [],
        message: parent_id ? '回复成功' : '评论成功'
      });
    });
  }
});

// ========================================
// 接口: DELETE /api/comments/:id - 删除评论（级联删除回复）
// ========================================
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  // 先删除子回复
  db.run('DELETE FROM comments WHERE parent_id = ?', [id], (err) => {
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
});

module.exports = router;
