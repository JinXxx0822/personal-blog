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

export default router
