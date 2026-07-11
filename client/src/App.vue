<template>
  <div class="app">
    <nav class="navbar">
      <div class="nav-brand">
        <h1>个人博客</h1>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">文章列表</router-link>
        <router-link to="/edit" class="nav-link btn-primary">写文章</router-link>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
    <footer class="footer">
      <p>个人博客系统 - 移动应用项目工程实践</p>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-brand h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
}

.nav-link:hover {
  opacity: 0.8;
}

.btn-primary {
  background: rgba(255,255,255,0.2);
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.3);
}

.btn-primary:hover {
  background: rgba(255,255,255,0.3);
  opacity: 1;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
}

.footer {
  background: #333;
  color: #aaa;
  text-align: center;
  padding: 1.5rem;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
}
</style>
