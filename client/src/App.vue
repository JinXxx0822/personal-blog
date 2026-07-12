<template>
  <div class="app" :class="{ dark: isDark }">
    <nav class="navbar">
      <div class="nav-brand">
        <h1 @click="$router.push('/')">📝 个人博客</h1>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">🏠 首页</router-link>
        <router-link to="/edit" class="nav-link btn-primary" v-if="user">✏️ 写文章</router-link>
        <button class="nav-link theme-btn" @click="toggleDark" :title="isDark ? '切换亮色' : '切换暗色'">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
        <template v-if="user">
          <span class="nav-user">👤 {{ user.nickname }}</span>
          <button class="nav-link" @click="logout">退出</button>
        </template>
        <router-link v-else to="/login" class="nav-link">🔑 登录</router-link>
      </div>
    </nav>
    <main class="main-content">
      <router-view @login-success="onLogin" />
    </main>
    <footer class="footer">
      <p>© 2026 个人博客系统 - 移动应用项目工程实践</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isDark = ref(false)
const user = ref(null)

const toggleDark = () => {
  isDark.value = !isDark.value
  localStorage.setItem('darkMode', isDark.value ? '1' : '0')
}

const onLogin = (userData) => {
  user.value = userData
  localStorage.setItem('user', JSON.stringify(userData))
}

const logout = () => {
  user.value = null
  localStorage.removeItem('user')
  router.push('/')
}

onMounted(() => {
  isDark.value = localStorage.getItem('darkMode') === '1'
  const saved = localStorage.getItem('user')
  if (saved) {
    try { user.value = JSON.parse(saved) } catch (e) { /* ignore */ }
  }
})
</script>

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
  transition: background 0.3s, color 0.3s;
}

.dark body,
.dark {
  background-color: #1a1a2e;
  color: #e0e0e0;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: background 0.3s;
}

.dark .app {
  background-color: #1a1a2e;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  flex-wrap: wrap;
  gap: 0.8rem;
}

.nav-brand h1 {
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  font-family: inherit;
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

.theme-btn {
  font-size: 1.2rem;
  padding: 0.2rem 0.5rem;
}

.nav-user {
  opacity: 0.9;
  font-size: 0.9rem;
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

.dark .footer {
  background: #16213e;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    padding: 1rem;
  }

  .nav-links {
    justify-content: center;
  }

  .main-content {
    padding: 1rem;
  }
}
</style>
