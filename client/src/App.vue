<template>
  <div class="app" :class="{ dark: isDark }">
    <!-- 导航栏 - 毛玻璃效果 -->
    <nav class="navbar">
      <div class="nav-inner">
        <div class="nav-brand" @click="$router.push('/')">
          <span class="brand-icon">📝</span>
          <h1>个人博客</h1>
        </div>
        <div class="nav-links">
          <router-link to="/" class="nav-link"><span class="nav-icon">🏠</span> 首页</router-link>
          <router-link to="/archive" class="nav-link"><span class="nav-icon">📅</span> 归档</router-link>
          <router-link to="/links" class="nav-link"><span class="nav-icon">🔗</span> 友链</router-link>
          <router-link to="/about" class="nav-link"><span class="nav-icon">👤</span> 关于</router-link>
          <router-link to="/favorites" class="nav-link" v-if="user"><span class="nav-icon">⭐</span> 收藏</router-link>
          <router-link to="/edit" class="nav-link btn-write" v-if="user">
            <span class="nav-icon">✏️</span> 写文章
          </router-link>
          <button class="nav-link theme-btn" @click="toggleDark" :title="isDark ? '切换到亮色模式' : '切换到暗色模式'">
            {{ isDark ? '☀️' : '🌙' }}
          </button>
          <template v-if="user">
            <span class="nav-user">👤 {{ user.nickname }}</span>
            <button class="nav-link btn-logout" @click="logout">退出</button>
          </template>
          <router-link v-else to="/login" class="nav-link">🔑 登录</router-link>
        </div>
      </div>
    </nav>

    <!-- 阅读进度条 -->
    <div class="reading-progress-bar">
      <div class="reading-progress-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>

    <!-- 网站公告栏 -->
    <Transition name="slide-down">
      <div class="announcement-bar" v-if="announcement && !dismissed">
        <div class="announcement-inner">
          <span class="announcement-icon">📢</span>
          <span class="announcement-text">{{ announcement.content }}</span>
          <button class="announcement-close" @click="dismissAnnouncement" title="关闭">×</button>
        </div>
      </div>
    </Transition>

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view @login-success="onLogin" v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="$route.fullPath" />
        </Transition>
      </router-view>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="footer-logo">📝</span>
          <span>个人博客</span>
        </div>
        <div class="footer-links">
          <router-link to="/">首页</router-link>
          <router-link to="/archive">归档</router-link>
          <router-link to="/about">关于</router-link>
          <router-link to="/links">友链</router-link>
        </div>
        <div class="footer-copyright">
          <p>© {{ currentYear }} 个人博客系统 | 移动应用项目工程实践</p>
          <p class="footer-sub">Built with Vue 3 + Express + SQLite | AI-Assisted Development</p>
        </div>
      </div>
    </footer>

    <!-- 回到顶部 -->
    <Transition name="fade-scale">
      <button v-show="showBackTop" class="back-top-btn" @click="scrollToTop" title="回到顶部">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 16V4M10 4L5 9M10 4L15 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </Transition>

    <!-- Toast 通知 -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUser } from './stores/user.js'
import api from './api'
import Toast from './components/Toast.vue'

const router = useRouter()
const { user, login, logout: doLogout, restore } = useUser()
const isDark = ref(false)
const showBackTop = ref(false)
const progressPercent = ref(0)
const announcement = ref(null)
const dismissed = ref(false)

const currentYear = computed(() => new Date().getFullYear())

const toggleDark = () => {
  isDark.value = !isDark.value
  localStorage.setItem('darkMode', isDark.value ? '1' : '0')
}

const onLogin = (userData) => {
  login(userData)
}

const logout = () => {
  doLogout()
  router.push('/')
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const dismissAnnouncement = () => {
  dismissed.value = true
  if (announcement.value) {
    localStorage.setItem('dismissedAnnouncement', announcement.value.id)
  }
}

const fetchAnnouncement = async () => {
  try {
    const res = await api.get('/api/announcements')
    if (res.data) {
      const dismissedId = localStorage.getItem('dismissedAnnouncement')
      if (dismissedId !== res.data.id) {
        announcement.value = res.data
        dismissed.value = false
      }
    }
  } catch (e) { /* ignore */ }
}

// 滚动监听 (RAF 节流)
let scrollTimer = null
const handleScroll = () => {
  if (scrollTimer) return
  scrollTimer = requestAnimationFrame(() => {
    showBackTop.value = window.scrollY > 500
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    progressPercent.value = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0
    scrollTimer = null
  })
}

onMounted(() => {
  isDark.value = localStorage.getItem('darkMode') === '1'
  restore()
  window.addEventListener('scroll', handleScroll, { passive: true })
  fetchAnnouncement()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style>
/* ===== 全局 CSS 变量 ===== */
:root {
  --primary: #667eea;
  --primary-dark: #5a6fd6;
  --primary-light: #a5b4fc;
  --accent: #764ba2;
  --accent-light: #a78bfa;
  --gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-warm: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;

  --bg-body: #f0f2f5;
  --bg-card: #ffffff;
  --bg-card-hover: #f8f9ff;
  --bg-input: #f5f6fa;
  --bg-tag: #eef0ff;
  --bg-skeleton: #e5e7eb;
  --bg-skeleton-shine: #d1d5db;

  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --text-inverse: #ffffff;

  --border: #e5e7eb;
  --border-light: #f3f4f6;

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 25px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 50px rgba(0,0,0,0.15);
  --shadow-glow: 0 0 30px rgba(102, 126, 234, 0.3);

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  --transition-fast: 0.2s ease;
  --transition: 0.3s ease;
  --transition-slow: 0.5s ease;

  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans SC', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
}

.dark {
  --bg-body: #0f172a;
  --bg-card: #1e293b;
  --bg-card-hover: #273549;
  --bg-input: #1e293b;
  --bg-tag: #1e1b4b;
  --bg-skeleton: #334155;
  --bg-skeleton-shine: #475569;

  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-tertiary: #64748b;
  --text-inverse: #0f172a;

  --border: #334155;
  --border-light: #1e293b;

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.4);
  --shadow-lg: 0 10px 25px rgba(0,0,0,0.5);
  --shadow-xl: 0 20px 50px rgba(0,0,0,0.6);
  --shadow-glow: 0 0 30px rgba(102, 126, 234, 0.2);
}

/* ===== 全局 Reset ===== */
* { margin: 0; padding: 0; box-sizing: border-box; }

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-sans);
  background-color: var(--bg-body);
  color: var(--text-primary);
  line-height: 1.6;
  transition: background var(--transition), color var(--transition);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--text-tertiary);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

::selection {
  background: rgba(102, 126, 234, 0.3);
  color: var(--text-primary);
}

a {
  color: var(--primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--accent);
}

img {
  max-width: 100%;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-body);
  transition: background var(--transition);
}

/* ===== 导航栏 ===== */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--border);
  transition: all var(--transition);
}

.dark .navbar {
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(20px) saturate(180%);
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  user-select: none;
}

.brand-icon {
  font-size: 1.6rem;
  transition: transform var(--transition);
}

.nav-brand:hover .brand-icon {
  transform: rotate(-15deg) scale(1.1);
}

.nav-brand h1 {
  font-size: 1.35rem;
  font-weight: 700;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  gap: 0.3rem;
  align-items: center;
  flex-wrap: wrap;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.45rem 0.75rem;
  border-radius: var(--radius-sm);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: inherit;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--primary);
  background: var(--bg-tag);
}

.nav-link.router-link-exact-active {
  color: var(--primary);
  background: var(--bg-tag);
  font-weight: 600;
}

.nav-icon {
  font-size: 0.85rem;
}

.btn-write {
  background: var(--gradient) !important;
  color: white !important;
  font-weight: 600 !important;
  border-radius: var(--radius-full) !important;
  padding: 0.5rem 1.2rem !important;
  box-shadow: var(--shadow-md);
}

.btn-write:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
  opacity: 0.95 !important;
}

.theme-btn {
  font-size: 1.2rem !important;
  padding: 0.35rem 0.6rem !important;
  min-width: 40px;
  justify-content: center;
}

.nav-user {
  font-size: 0.85rem;
  color: var(--text-secondary);
  padding: 0 0.3rem;
}

.btn-logout {
  font-size: 0.8rem;
  opacity: 0.7;
}

.btn-logout:hover {
  opacity: 1;
  color: var(--danger) !important;
}

/* ===== 阅读进度条 ===== */
.reading-progress-bar {
  position: fixed;
  top: 64px;
  left: 0;
  width: 100%;
  height: 3px;
  background: transparent;
  z-index: 99;
}

.reading-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
  transition: width 0.15s linear;
}

/* ===== 公告栏 ===== */
.announcement-bar {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-bottom: 1px solid #f59e0b;
}

.dark .announcement-bar {
  background: linear-gradient(135deg, #3d3200, #5c4a00);
  border-color: #856404;
}

.announcement-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.55rem 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.announcement-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.announcement-text {
  flex: 1;
  text-align: center;
  font-size: 0.88rem;
  font-weight: 500;
  color: #92400e;
}

.dark .announcement-text {
  color: #fbbf24;
}

.announcement-close {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: #92400e;
  opacity: 0.6;
  padding: 0 0.3rem;
  line-height: 1;
  transition: opacity var(--transition-fast);
  flex-shrink: 0;
}

.dark .announcement-close {
  color: #fbbf24;
}

.announcement-close:hover {
  opacity: 1;
}

/* ===== 主内容 ===== */
.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
}

/* ===== 页脚 ===== */
.footer {
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  margin-top: auto;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.footer-logo {
  font-size: 1.3rem;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-links a {
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: color var(--transition-fast);
}

.footer-links a:hover {
  color: var(--primary);
}

.footer-copyright {
  text-align: center;
}

.footer-copyright p {
  color: var(--text-tertiary);
  font-size: 0.85rem;
}

.footer-sub {
  margin-top: 0.3rem;
  font-size: 0.8rem !important;
  opacity: 0.7;
}

/* ===== 回到顶部 ===== */
.back-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: var(--gradient);
  color: white;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
}

.back-top-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: var(--shadow-xl), var(--shadow-glow);
}

/* ===== 页面过渡动画 ===== */
.page-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(15px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ===== 返回顶部按钮过渡 ===== */
.fade-scale-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-scale-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.7);
}

/* ===== 公告栏过渡 ===== */
.slide-down-enter-active {
  transition: all 0.35s ease;
}
.slide-down-leave-active {
  transition: all 0.25s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  opacity: 0;
  overflow: hidden;
}
.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 60px;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .nav-inner {
    flex-direction: column;
    height: auto;
    padding: 0.8rem 1rem;
    gap: 0.6rem;
  }

  .nav-links {
    justify-content: center;
  }

  .nav-link {
    font-size: 0.8rem;
    padding: 0.35rem 0.5rem;
  }

  .btn-write {
    padding: 0.4rem 0.8rem !important;
  }

  .main-content {
    padding: 1rem;
  }

  .footer-inner {
    padding: 2rem 1rem;
  }

  .back-top-btn {
    bottom: 1.2rem;
    right: 1.2rem;
    width: 42px;
    height: 42px;
  }

  .reading-progress-bar {
    top: 0;
  }
}

@media (max-width: 480px) {
  .nav-links {
    gap: 0.15rem;
  }

  .nav-link {
    font-size: 0.75rem;
    padding: 0.3rem 0.4rem;
  }

  .nav-icon {
    display: none;
  }

  .brand-icon {
    font-size: 1.3rem;
  }

  .nav-brand h1 {
    font-size: 1.15rem;
  }
}
</style>
