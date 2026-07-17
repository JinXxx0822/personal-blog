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
  { path: '/', name: 'Home', component: Home },
  { path: '/article/:id', name: 'ArticleDetail', component: ArticleDetail },
  { path: '/edit', name: 'ArticleCreate', component: ArticleEdit, meta: { requiresAuth: true } },
  { path: '/edit/:id', name: 'ArticleEdit', component: ArticleEdit, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: Login },
  { path: '/archive', name: 'Archive', component: Archive },
  { path: '/about', name: 'About', component: About },
  { path: '/links', name: 'Links', component: Links },
  { path: '/favorites', name: 'Favorites', component: Favorites, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局路由守卫：未登录时拦截需要认证的页面
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const saved = localStorage.getItem('user')
    if (!saved) {
      // 跳转到登录页，并记录来源路径以便登录后跳回
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
