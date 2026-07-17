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

  const countSQL = `SELECT COUNT(*) as total FROM articles ${whereSQL}`;

  db.get(countSQL, params, (err, countRow) => {
    if (err) {
      console.error('查询文章总数失败:', err);
      return res.status(500).json({ error: '查询文章总数失败' });
    }

    const total = countRow.total;
    const totalPages = Math.ceil(total / limit);

    const dataSQL = `SELECT id, title, summary, category, tags, cover_url, views, likes, created_at 
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
// 接口: GET /api/articles/hot - 获取热门文章（按阅读量）
// ========================================
router.get('/hot/list', (req, res) => {
  const sql = `SELECT id, title, summary, category, tags, cover_url, views, likes, created_at 
               FROM articles ORDER BY views DESC LIMIT 5`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: '获取热门文章失败' });
    res.json(rows);
  });
});

// ========================================
// 接口: GET /api/articles/archive - 获取文章归档（按月份）
// ========================================
router.get('/archive/list', (req, res) => {
  const sql = `SELECT id, title, category, tags, views, created_at 
               FROM articles ORDER BY created_at DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: '获取归档失败' });
    
    // 按年月分组
    const archive = {};
    rows.forEach(row => {
      const date = new Date(row.created_at);
      const key = `${date.getFullYear()}年${date.getMonth() + 1}月`;
      if (!archive[key]) archive[key] = [];
      archive[key].push(row);
    });
    
    res.json(archive);
  });
});

// ========================================
// 接口: GET /api/articles/tags/cloud - 获取标签云
// ========================================
router.get('/tags/cloud', (req, res) => {
  const sql = `SELECT tags FROM articles WHERE tags != ''`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: '获取标签失败' });
    
    const tagCount = {};
    rows.forEach(row => {
      if (!row.tags) return;
      row.tags.split(',').forEach(tag => {
        const t = tag.trim();
        if (t) tagCount[t] = (tagCount[t] || 0) + 1;
      });
    });
    
    const tags = Object.entries(tagCount).map(([name, count]) => ({ name, count }));
    res.json(tags);
  });
});

// ========================================
// 接口: GET /api/articles/categories - 获取所有分类
// ========================================
router.get('/categories/all', (req, res) => {
  const sql = 'SELECT DISTINCT category FROM articles ORDER BY category';
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: '获取分类失败' });
    const categories = rows.map(r => r.category);
    res.json(categories);
  });
});

// ========================================
// 接口: GET /api/articles/stats - 站点统计
// ========================================
router.get('/stats/overview', (req, res) => {
  const sqls = {
    total: 'SELECT COUNT(*) as count FROM articles',
    totalViews: 'SELECT COALESCE(SUM(views), 0) as count FROM articles',
    totalLikes: 'SELECT COALESCE(SUM(likes), 0) as count FROM articles',
    totalComments: 'SELECT COUNT(*) as count FROM comments',
    totalCategories: 'SELECT COUNT(DISTINCT category) as count FROM articles'
  };
  
  const stats = {};
  let pending = Object.keys(sqls).length;
  
  Object.entries(sqls).forEach(([key, sql]) => {
    db.get(sql, [], (err, row) => {
      if (err) {
        stats[key] = 0;
      } else {
        stats[key] = row.count;
      }
      pending--;
      if (pending === 0) res.json(stats);
    });
  });
});

// ========================================
// 接口: GET /api/articles/related/:id - 获取相关文章
// ========================================
router.get('/related/:id', (req, res) => {
  const { id } = req.params;
  
  // 先获取当前文章的分类和标签
  db.get('SELECT category, tags FROM articles WHERE id = ?', [id], (err, article) => {
    if (err || !article) {
      return res.json([]);
    }
    
    // 查找同分类或同标签的其他文章，按创建时间倒序，最多5篇
    let likeParams = [];
    let likeClauses = [`a.id != ?`];
    likeParams.push(id);
    
    if (article.category) {
      likeClauses.push(`a.category = ?`);
      likeParams.push(article.category);
    }
    
    if (article.tags) {
      const tagConditions = article.tags.split(',').map(t => {
        likeParams.push(`%${t.trim()}%`);
        return `a.tags LIKE ?`;
      });
      likeClauses.push(`(${tagConditions.join(' OR ')})`);
    }
    
    const sql = `SELECT DISTINCT a.id, a.title, a.summary, a.category, a.tags, a.cover_url, a.views, a.likes, a.created_at
                 FROM articles a
                 WHERE ${likeClauses.join(' AND ')}
                 ORDER BY a.views DESC, a.created_at DESC
                 LIMIT 5`;
    
    db.all(sql, likeParams, (err, rows) => {
      if (err) return res.json([]);
      res.json(rows);
    });
  });
});

// ========================================
// 接口: GET /api/articles/:id - 获取文章详情（同时增加阅读量）
// ========================================
router.get('/:id', (req, res) => {
  const { id } = req.params;

  if (['categories', 'hot', 'archive', 'tags', 'stats', 'related', 'favorites'].includes(id)) return;

  // 先增加阅读量
  db.run('UPDATE articles SET views = views + 1 WHERE id = ?', [id]);

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
// 接口: POST /api/articles/:id/like - 点赞/取消点赞文章
// ========================================
router.post('/:id/like', (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    // 未登录用户直接 +1（无去重）
    db.run('UPDATE articles SET likes = likes + 1 WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ error: '点赞失败' });
      if (this.changes === 0) return res.status(404).json({ error: '文章不存在' });
      res.json({ message: '点赞成功', action: 'liked' });
    });
    return;
  }

  // 检查是否已点赞
  db.get('SELECT id FROM likes WHERE user_id = ? AND article_id = ?', [user_id, id], (err, row) => {
    if (err) return res.status(500).json({ error: '操作失败' });

    if (row) {
      // 已点赞 → 取消点赞
      db.run('DELETE FROM likes WHERE user_id = ? AND article_id = ?', [user_id, id], (err) => {
        if (err) return res.status(500).json({ error: '取消点赞失败' });
        db.run('UPDATE articles SET likes = MAX(0, likes - 1) WHERE id = ?', [id], (err) => {
          if (err) return res.status(500).json({ error: '操作失败' });
          res.json({ message: '已取消点赞', action: 'unliked' });
        });
      });
    } else {
      // 未点赞 → 点赞
      const likeId = uuidv4();
      db.run('INSERT OR IGNORE INTO likes (id, user_id, article_id) VALUES (?, ?, ?)', [likeId, user_id, id], (err) => {
        if (err) return res.status(500).json({ error: '点赞失败' });
        db.run('UPDATE articles SET likes = likes + 1 WHERE id = ?', [id], (err) => {
          if (err) return res.status(500).json({ error: '操作失败' });
          res.json({ message: '点赞成功', action: 'liked' });
        });
      });
    }
  });
});

// ========================================
// 接口: GET /api/articles/:id/like/:userId - 检查是否已点赞
// ========================================
router.get('/:id/like/:userId', (req, res) => {
  const { id, userId } = req.params;
  db.get('SELECT id FROM likes WHERE user_id = ? AND article_id = ?', [userId, id], (err, row) => {
    if (err) return res.status(500).json({ error: '查询失败' });
    res.json({ liked: !!row });
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
      id, title: title.trim(), summary: finalSummary, category: finalCategory, tags: finalTags,
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

  if (!title || !title.trim()) return res.status(400).json({ error: '标题不能为空' });
  if (!content || !content.trim()) return res.status(400).json({ error: '正文不能为空' });

  const sql = 'UPDATE articles SET title = ?, summary = ?, content = ?, category = ?, tags = ?, cover_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  const finalSummary = summary && summary.trim() ? summary.trim() : content.trim().substring(0, 100);
  const finalCategory = category && category.trim() ? category.trim() : '笔记';

  db.run(sql, [title.trim(), finalSummary, content.trim(), finalCategory, tags || '', cover_url || '', id], function(err) {
    if (err) {
      console.error('更新文章失败:', err);
      return res.status(500).json({ error: '更新文章失败' });
    }
    if (this.changes === 0) return res.status(404).json({ error: '文章不存在' });
    res.json({ message: '文章更新成功' });
  });
});

// ========================================
// 接口: DELETE /api/articles/:id - 删除文章
// ========================================
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM comments WHERE article_id = ?', [id], (err) => {
    db.run('DELETE FROM likes WHERE article_id = ?', [id], (err) => {
      db.run('DELETE FROM favorites WHERE article_id = ?', [id], (err) => {
        db.run('DELETE FROM articles WHERE id = ?', [id], function(err) {
          if (err) {
            console.error('删除文章失败:', err);
            return res.status(500).json({ error: '删除文章失败' });
          }
          if (this.changes === 0) return res.status(404).json({ error: '文章不存在' });
          res.json({ message: '文章删除成功' });
        });
      });
    });
  });
});

// ========================================
// 接口: POST /api/articles/:id/upload - 更新封面图片
// ========================================
router.post('/:id/upload', (req, res) => {
  const { id } = req.params;
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: '图片地址不能为空' });
  db.run('UPDATE articles SET cover_url = ? WHERE id = ?', [url, id], function(err) {
    if (err) return res.status(500).json({ error: '更新封面失败' });
    res.json({ message: '封面更新成功', cover_url: url });
  });
});

// ========================================
// 收藏相关接口
// ========================================

// 获取用户收藏列表
router.get('/favorites/user/:userId', (req, res) => {
  const { userId } = req.params;
  const sql = `SELECT a.id, a.title, a.summary, a.category, a.tags, a.cover_url, a.views, a.likes, a.created_at, f.created_at as fav_time
               FROM favorites f JOIN articles a ON f.article_id = a.id
               WHERE f.user_id = ? ORDER BY f.created_at DESC`;
  db.all(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: '获取收藏失败' });
    res.json(rows);
  });
});

// 添加收藏
router.post('/:id/favorite', (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: '用户ID不能为空' });
  
  const favId = uuidv4();
  db.run('INSERT OR IGNORE INTO favorites (id, user_id, article_id) VALUES (?, ?, ?)', [favId, user_id, id], function(err) {
    if (err) return res.status(500).json({ error: '收藏失败' });
    res.json({ message: '收藏成功' });
  });
});

// 取消收藏
router.delete('/:id/favorite/:userId', (req, res) => {
  const { id, userId } = req.params;
  db.run('DELETE FROM favorites WHERE user_id = ? AND article_id = ?', [userId, id], function(err) {
    if (err) return res.status(500).json({ error: '取消收藏失败' });
    res.json({ message: '已取消收藏' });
  });
});

// 检查是否已收藏
router.get('/:id/favorite/:userId', (req, res) => {
  const { id, userId } = req.params;
  db.get('SELECT id FROM favorites WHERE user_id = ? AND article_id = ?', [userId, id], (err, row) => {
    if (err) return res.status(500).json({ error: '查询失败' });
    res.json({ favorited: !!row });
  });
});

module.exports = router;
