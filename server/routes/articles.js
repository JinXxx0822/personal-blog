const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

// ========================================
// 接口: GET /api/articles - 获取文章列表（支持搜索、分类筛选、分页）
// ========================================
router.get('/', (req, res) => {
  const { page = 1, pageSize = 6, category = '', keyword = '', tag = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  const limit = parseInt(pageSize);

  let whereClauses = [];
  let params = [];

  if (category && category !== '全部') {
    whereClauses.push('category = ?');
    params.push(category);
  }

  if (keyword && keyword.trim()) {
    whereClauses.push('(title LIKE ? OR content LIKE ?)');
    params.push(`%${keyword.trim()}%`, `%${keyword.trim()}%`);
  }

  if (tag && tag.trim()) {
    whereClauses.push('tags LIKE ?');
    params.push(`%${tag.trim()}%`);
  }

  const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

  // 查询总数
  const countSQL = `SELECT COUNT(*) as total FROM articles ${whereSQL}`;

  db.get(countSQL, params, (err, countRow) => {
    if (err) {
      console.error('查询文章总数失败:', err);
      return res.status(500).json({ error: '查询文章总数失败' });
    }

    const total = countRow.total;
    const totalPages = Math.ceil(total / limit);

    // 查询分页数据
    const dataSQL = `SELECT id, title, summary, category, tags, cover_url, created_at 
                     FROM articles ${whereSQL} 
                     ORDER BY created_at DESC 
                     LIMIT ? OFFSET ?`;

    db.all(dataSQL, [...params, limit, offset], (err, rows) => {
      if (err) {
        console.error('查询文章列表失败:', err);
        return res.status(500).json({ error: '查询文章列表失败' });
      }

      res.json({
        articles: rows,
        total,
        page: parseInt(page),
        pageSize: limit,
        totalPages
      });
    });
  });
});

// ========================================
// 接口: GET /api/articles/categories - 获取所有分类
// ========================================
router.get('/categories/all', (req, res) => {
  const sql = 'SELECT DISTINCT category FROM articles ORDER BY category';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: '获取分类失败' });
    }
    const categories = rows.map(r => r.category);
    res.json(categories);
  });
});

// ========================================
// 接口: GET /api/articles/:id - 获取文章详情
// ========================================
router.get('/:id', (req, res) => {
  const { id } = req.params;

  if (id === 'categories') return; // 避免路由冲突

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
// 接口: POST /api/articles - 创建文章
// ========================================
router.post('/', (req, res) => {
  const { title, summary, content, category, tags, cover_url } = req.body;

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
  const sql = 'INSERT INTO articles (id, title, summary, content, category, tags, cover_url) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const finalSummary = summary && summary.trim() ? summary.trim() : content.trim().substring(0, 100);
  const finalCategory = category && category.trim() ? category.trim() : '笔记';
  const finalTags = tags && tags.trim() ? tags.trim() : '';

  db.run(sql, [id, title.trim(), finalSummary, content.trim(), finalCategory, finalTags, cover_url || ''], function(err) {
    if (err) {
      console.error('创建文章失败:', err);
      return res.status(500).json({ error: '创建文章失败' });
    }

    res.status(201).json({
      id,
      title: title.trim(),
      summary: finalSummary,
      category: finalCategory,
      tags: finalTags,
      message: '文章创建成功'
    });
  });
});

// ========================================
// 接口: PUT /api/articles/:id - 更新文章
// ========================================
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, summary, content, category, tags, cover_url } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: '标题不能为空' });
  }

  if (!content || !content.trim()) {
    return res.status(400).json({ error: '正文不能为空' });
  }

  if (title.trim().length > 100) {
    return res.status(400).json({ error: '标题不能超过100字' });
  }

  const sql = 'UPDATE articles SET title = ?, summary = ?, content = ?, category = ?, tags = ?, cover_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  const finalSummary = summary && summary.trim() ? summary.trim() : content.trim().substring(0, 100);
  const finalCategory = category && category.trim() ? category.trim() : '笔记';

  db.run(sql, [title.trim(), finalSummary, content.trim(), finalCategory, tags || '', cover_url || '', id], function(err) {
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
// 接口: DELETE /api/articles/:id - 删除文章
// ========================================
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // 先删除关联的评论
  db.run('DELETE FROM comments WHERE article_id = ?', [id], (err) => {
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
});

// ========================================
// 接口: POST /api/articles/:id/upload - 上传封面图片
// ========================================
router.post('/:id/upload', (req, res) => {
  const { id } = req.params;
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: '图片地址不能为空' });
  }

  const sql = 'UPDATE articles SET cover_url = ? WHERE id = ?';
  db.run(sql, [url, id], function(err) {
    if (err) {
      return res.status(500).json({ error: '更新封面失败' });
    }
    res.json({ message: '封面更新成功', cover_url: url });
  });
});

module.exports = router;
