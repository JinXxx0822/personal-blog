<template>
  <div class="home">
    <!-- 站点统计卡片 -->
    <div class="stats-bar">
      <div class="stat-card">
        <span class="stat-num">{{ stats.total }}</span>
        <span class="stat-label">文章</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ stats.totalCategories }}</span>
        <span class="stat-label">分类</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ stats.totalViews }}</span>
        <span class="stat-label">阅读</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ stats.totalComments }}</span>
        <span class="stat-label">评论</span>
      </div>
    </div>

    <!-- 热门文章推荐轮播 -->
    <div class="hot-section" v-if="hotArticles.length > 0">
      <h3>🔥 热门推荐</h3>
      <div class="hot-grid">
        <div class="hot-card hot-card-main" v-if="hotArticles[0]" @click="goToDetail(hotArticles[0].id)">
          <div class="hot-cover" v-if="hotArticles[0].cover_url">
            <img :src="hotArticles[0].cover_url" :alt="hotArticles[0].title" />
          </div>
          <div class="hot-info">
            <span class="hot-badge">HOT</span>
            <h4>{{ hotArticles[0].title }}</h4>
            <p>{{ hotArticles[0].summary }}</p>
            <div class="hot-meta">
              <span>👁 {{ hotArticles[0].views }} 阅读</span>
              <span>❤️ {{ hotArticles[0].likes }} 点赞</span>
            </div>
          </div>
        </div>
        <div class="hot-side">
          <div v-for="(a, i) in hotArticles.slice(1, 4)" :key="a.id" class="hot-mini" @click="goToDetail(a.id)">
            <span class="hot-rank">0{{ i + 2 }}</span>
            <div class="hot-mini-info">
              <h5>{{ a.title }}</h5>
              <span>👁 {{ a.views }} 阅读 · ❤️ {{ a.likes }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和分类 -->
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

    <!-- 标签云 -->
    <div class="tag-cloud-section" v-if="tagCloud.length > 0">
      <h3>🏷️ 热门标签</h3>
      <div class="tag-cloud">
        <span v-for="tag in tagCloud" :key="tag.name" 
          class="tag-item" 
          :style="{ fontSize: (0.8 + tag.count * 0.15) + 'rem', opacity: 0.6 + tag.count * 0.1 }"
          @click="filterByTag(tag.name)"
        >{{ tag.name }}</span>
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
              <div class="article-stats-row">
                <span class="article-date">{{ formatDate(article.created_at) }}</span>
                <span class="stat">👁 {{ article.views || 0 }}</span>
                <span class="stat">❤️ {{ article.likes || 0 }}</span>
                <span class="read-more">阅读全文 →</span>
              </div>
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
const hotArticles = ref([])
const tagCloud = ref([])
const stats = ref({ total: 0, totalCategories: 0, totalViews: 0, totalComments: 0 })
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

const fetchStats = async () => {
  try {
    const res = await axios.get('/api/articles/stats/overview')
    stats.value = res.data
  } catch (e) { /* ignore */ }
}

const fetchHotArticles = async () => {
  try {
    const res = await axios.get('/api/articles/hot/list')
    hotArticles.value = res.data
  } catch (e) { /* ignore */ }
}

const fetchTagCloud = async () => {
  try {
    const res = await axios.get('/api/articles/tags/cloud')
    tagCloud.value = res.data.slice(0, 20)
  } catch (e) { /* ignore */ }
}

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
  fetchStats()
  fetchHotArticles()
  fetchTagCloud()
  fetchCategories()
  fetchArticles()
})
</script>

<style scoped>
.home { max-width: 100%; }

/* 统计卡片 */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.dark .stat-card {
  background: #16213e;
}

.stat-num {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: 0.85rem;
  color: #888;
  margin-top: 0.3rem;
}

/* 热门推荐 */
.hot-section {
  margin-bottom: 1.5rem;
}

.hot-section h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.hot-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

.hot-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.3s;
}

.hot-card:hover {
  transform: translateY(-2px);
}

.dark .hot-card {
  background: #16213e;
}

.hot-card-main .hot-cover img {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.hot-info {
  padding: 1.2rem;
}

.hot-badge {
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.hot-info h4 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.hot-info p {
  color: #888;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 0.8rem;
}

.hot-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #999;
}

.hot-side {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.hot-mini {
  background: white;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: transform 0.3s;
  flex: 1;
}

.hot-mini:hover {
  transform: translateX(5px);
}

.dark .hot-mini {
  background: #16213e;
}

.hot-rank {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  min-width: 35px;
}

.hot-mini-info h5 {
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hot-mini-info span {
  font-size: 0.8rem;
  color: #999;
}

/* 标签云 */
.tag-cloud-section {
  background: white;
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.dark .tag-cloud-section {
  background: #16213e;
}

.tag-cloud-section h3 {
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.tag-item {
  cursor: pointer;
  padding: 0.3rem 0.8rem;
  border-radius: 16px;
  background: #f0f0f0;
  color: #667eea;
  transition: all 0.3s;
}

.tag-item:hover {
  background: #667eea;
  color: white;
}

.dark .tag-item {
  background: #0f3460;
}

/* 筛选 */
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

/* 文章列表 */
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
  display: flex;
  flex-direction: row;
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

.article-cover {
  width: 240px;
  min-width: 240px;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-info {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

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
  flex: 1;
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

.article-stats-row {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  flex-wrap: wrap;
}

.article-date { color: #999; font-size: 0.85rem; }
.stat { color: #999; font-size: 0.8rem; }
.read-more { color: #667eea; font-weight: 500; font-size: 0.9rem; }

/* 分页 */
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
  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
  }
  .hot-grid {
    grid-template-columns: 1fr;
  }
  .article-card {
    flex-direction: column;
  }
  .article-cover {
    width: 100%;
    min-width: 100%;
    height: 160px;
  }
  .article-stats-row {
    flex-wrap: wrap;
  }
}
</style>
