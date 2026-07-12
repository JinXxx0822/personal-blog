<template>
  <div class="home">
    <div class="hero">
      <h2>欢迎来到我的博客</h2>
      <p>记录学习、分享技术、沉淀思考</p>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="filter-bar">
      <div class="search-box">
        <input v-model="keyword" @keyup.enter="search" placeholder="🔍 搜索文章..." />
        <button @click="search" class="btn-search">搜索</button>
      </div>
      <div class="category-tabs">
        <button 
          v-for="cat in categories" 
          :key="cat"
          :class="{ active: activeCategory === cat }"
          @click="filterByCategory(cat)"
        >{{ cat }}</button>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="articles-section">
      <div class="section-header">
        <h3>{{ activeCategory === '全部' ? '最新文章' : activeCategory }}</h3>
        <span class="article-count">共 {{ total }} 篇</span>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="articles.length === 0" class="empty-state">
        <p>📭 {{ keyword ? '没有找到相关文章' : '暂无文章，点击右上角"写文章"开始创作吧！' }}</p>
      </div>

      <div v-else class="articles-grid">
        <article
          v-for="article in articles"
          :key="article.id"
          class="article-card"
          @click="goToDetail(article.id)"
        >
          <div class="article-cover" v-if="article.cover_url">
            <img :src="article.cover_url" :alt="article.title" />
          </div>
          <div class="article-info">
            <div class="article-header">
              <h4 class="article-title">{{ article.title }}</h4>
              <span class="article-category">{{ article.category }}</span>
            </div>
            <p class="article-summary">{{ article.summary }}</p>
            <div class="article-footer">
              <div class="article-tags" v-if="article.tags">
                <span v-for="tag in getTags(article.tags)" :key="tag" class="tag" @click.stop="filterByTag(tag)">{{ tag }}</span>
              </div>
              <span class="article-date">{{ formatDate(article.created_at) }}</span>
              <span class="read-more">阅读全文 →</span>
            </div>
          </div>
        </article>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <button :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
        <span v-for="p in displayPages" :key="p">
          <button v-if="p !== '...'" :class="{ active: p === page }" @click="changePage(p)">{{ p }}</button>
          <span v-else class="ellipsis">...</span>
        </span>
        <button :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const articles = ref([])
const loading = ref(true)
const page = ref(1)
const total = ref(0)
const totalPages = ref(0)
const keyword = ref('')
const activeCategory = ref('全部')
const categories = ref(['全部'])

const displayPages = computed(() => {
  const pages = []
  const tp = totalPages.value
  const cp = page.value
  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) pages.push(i)
  } else {
    pages.push(1)
    if (cp > 3) pages.push('...')
    for (let i = Math.max(2, cp - 1); i <= Math.min(tp - 1, cp + 1); i++) pages.push(i)
    if (cp < tp - 2) pages.push('...')
    pages.push(tp)
  }
  return pages
})

const fetchArticles = async () => {
  loading.value = true
  try {
    const params = { page: page.value, pageSize: 6 }
    if (activeCategory.value !== '全部') params.category = activeCategory.value
    if (keyword.value.trim()) params.keyword = keyword.value.trim()
    const response = await axios.get('/api/articles', { params })
    articles.value = response.data.articles
    total.value = response.data.total
    totalPages.value = response.data.totalPages
  } catch (error) {
    console.error('获取文章失败:', error)
    alert('获取文章列表失败，请检查后端服务是否启动')
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/articles/categories/all')
    categories.value = ['全部', ...response.data]
  } catch (e) { /* ignore */ }
}

const search = () => {
  page.value = 1
  fetchArticles()
}

const filterByCategory = (cat) => {
  activeCategory.value = cat
  page.value = 1
  keyword.value = ''
  fetchArticles()
}

const filterByTag = (tag) => {
  activeCategory.value = '全部'
  keyword.value = tag
  page.value = 1
  fetchArticles()
}

const changePage = (p) => {
  page.value = p
  fetchArticles()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToDetail = (id) => router.push(`/article/${id}`)

const getTags = (tags) => {
  if (!tags) return []
  return tags.split(',').map(t => t.trim()).filter(Boolean)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

onMounted(() => {
  fetchCategories()
  fetchArticles()
})
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 3rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.hero h2 { font-size: 2rem; margin-bottom: 0.5rem; }
.hero p { font-size: 1.1rem; opacity: 0.9; }

.filter-bar {
  background: white;
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.dark .filter-bar {
  background: #16213e;
}

.search-box {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-box input {
  flex: 1;
  padding: 0.6rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.3s;
  background: inherit;
  color: inherit;
}

.search-box input:focus { border-color: #667eea; }

.btn-search {
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: opacity 0.3s;
}

.btn-search:hover { opacity: 0.9; }

.category-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-tabs button {
  padding: 0.4rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  background: transparent;
  cursor: pointer;
  font-size: 0.85rem;
  color: inherit;
  transition: all 0.3s;
}

.category-tabs button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.articles-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.dark .articles-section {
  background: #16213e;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.dark .section-header { border-color: #0f3460; }

.section-header h3 { font-size: 1.3rem; }
.article-count { color: #888; font-size: 0.9rem; }

.loading { text-align: center; padding: 3rem; }

.spinner {
  width: 40px; height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state { text-align: center; padding: 3rem; color: #888; }

.articles-grid { display: grid; gap: 1.5rem; }

.article-card {
  background: #fafafa;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #eee;
}

.dark .article-card {
  background: #0f3460;
  border-color: #1a1a4e;
}

.article-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border-color: #667eea;
}

.article-cover img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.article-info { padding: 1.5rem; }

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.8rem;
  gap: 0.8rem;
}

.article-title {
  font-size: 1.2rem;
  font-weight: 600;
  flex: 1;
}

.article-category {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.2rem 0.8rem;
  border-radius: 12px;
  font-size: 0.75rem;
  white-space: nowrap;
}

.article-summary {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dark .article-summary { color: #aaa; }

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.article-tags { display: flex; gap: 0.3rem; flex-wrap: wrap; }

.tag {
  background: #e8ecff;
  color: #667eea;
  padding: 0.15rem 0.6rem;
  border-radius: 10px;
  font-size: 0.75rem;
}

.dark .tag { background: #1a1a4e; }

.article-date { color: #999; font-size: 0.85rem; }
.read-more { color: #667eea; font-weight: 500; font-size: 0.9rem; }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.dark .pagination { border-color: #0f3460; }

.pagination button {
  padding: 0.4rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  color: inherit;
  transition: all 0.3s;
}

.dark .pagination button { background: #0f3460; border-color: #1a1a4e; }

.pagination button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ellipsis { padding: 0 0.3rem; }

@media (max-width: 768px) {
  .hero h2 { font-size: 1.5rem; }
  .article-header { flex-direction: column; }
}
</style>
