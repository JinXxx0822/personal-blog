import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ArticleDetail from '../views/ArticleDetail.vue'
import ArticleEdit from '../views/ArticleEdit.vue'
import Login from '../views/Login.vue'
import Archive from '../views/Archive.vue'
import About from '../views/About.vue'
import Links from '../views/Links.vue'
import Favorites from '../views/Favorites.vue'

const routes = [
  { path: '/', name: 'Home', component: Home, meta: { title: '首页' } },
  { path: '/article/:id', name: 'ArticleDetail', component: ArticleDetail, meta: { title: '文章详情' } },
  { path: '/edit', name: 'ArticleCreate', component: ArticleEdit, meta: { requiresAuth: true, title: '写文章' } },
  { path: '/edit/:id', name: 'ArticleEdit', component: ArticleEdit, meta: { requiresAuth: true, title: '编辑文章' } },
  { path: '/login', name: 'Login', component: Login, meta: { title: '登录' } },
  { path: '/archive', name: 'Archive', component: Archive, meta: { title: '归档' } },
  { path: '/about', name: 'About', component: About, meta: { title: '关于我' } },
  { path: '/links', name: 'Links', component: Links, meta: { title: '友链' } },
  { path: '/favorites', name: 'Favorites', component: Favorites, meta: { requiresAuth: true, title: '我的收藏' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局路由守卫：未登录时拦截需要认证的页面
router.beforeEach((to, from, next) => {
  // 动态设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 个人博客` : '个人博客'

  if (to.meta.requiresAuth) {
    const saved = localStorage.getItem('user')
    if (!saved) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
    try {
      JSON.parse(saved)
    } catch (e) {
      localStorage.removeItem('user')
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  }
  next()
})

export default router
