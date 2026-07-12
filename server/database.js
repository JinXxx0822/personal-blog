const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'blog.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err);
  } else {
    console.log('数据库连接成功');
    initDatabase();
  }
});

function initDatabase() {
  const sql = `
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT DEFAULT '',
      content TEXT NOT NULL,
      category TEXT DEFAULT '笔记',
      tags TEXT DEFAULT '',
      cover_url TEXT DEFAULT '',
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL,
      author TEXT DEFAULT '匿名',
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nickname TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      article_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, article_id),
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS about (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.exec(sql, (err) => {
    if (err) {
      console.error('数据库初始化失败:', err);
    } else {
      console.log('数据库表初始化成功（articles + comments + users + favorites + links + about）');
    }
  });
}

module.exports = db;
