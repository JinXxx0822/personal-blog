import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ArticleDetail from '../views/ArticleDetail.vue'
import ArticleEdit from '../views/ArticleEdit.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/article/:id', name: 'ArticleDetail', component: ArticleDetail },
  { path: '/edit', name: 'ArticleCreate', component: ArticleEdit },
  { path: '/edit/:id', name: 'ArticleEdit', component: ArticleEdit }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
