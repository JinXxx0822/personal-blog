<template>
  <div class="home">
    <!-- 骨架屏 -->
    <template v-if="pageLoading">
      <div class="hero-skeleton">
        <div class="skeleton-line w-60 h-8"></div>
        <div class="skeleton-line w-40 h-5 mt-3"></div>
        <div class="skeleton-line w-30 h-5 mt-2"></div>
      </div>
      <div class="stats-skeleton">
        <div class="skeleton-card" v-for="i in 4" :key="i"></div>
      </div>
      <div class="skeleton-card large"></div>
      <div class="skeleton-card large mt-4"></div>
    </template>

    <template v-else>
      <!-- 英雄区 -->
      <section class="hero">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="hero-badge-dot"></span>
            探索 · 记录 · 成长
          </div>
          <h1 class="hero-title">
            用文字记录
            <span class="hero-highlight">技术与生活</span>
          </h1>
          <p class="hero-desc">
            一个分享技术心得、记录生活点滴的个人空间。在这里，每一篇文章都是思考的结晶。
          </p>
          <div class="hero-actions">
            <router-link to="/edit" class="hero-btn primary" v-if="user">
              ✏️ 开始写作
            </router-link>
            <button class="hero-btn secondary" @click="scrollToArticles">
              📖 浏览文章
            </button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-floating-card card-1">
            <span class="hf-icon">📝</span>
            <span class="hf-label">技术笔记</span>
          </div>
          <div class="hero-floating-card card-2">
            <span class="hf-icon">💡</span>
            <span class="hf-label">深度思考</span>
          </div>
          <div class="hero-floating-card card-3">
            <span class="hf-icon">🚀</span>
            <span class="hf-label">持续更新</span>
          </div>
          <div class="hero-shape"></div>
        </div>
      </section>

      <!-- 统计卡片 -->
      <div class="stats-bar">
        <div class="stat-card" v-for="(item, idx) in statItems" :key="idx">
          <div class="stat-icon">{{ item.icon }}</div>
          <div class="stat-info">
            <span class="stat-num">{{ item.value }}</span>
            <span class="stat-label">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- 热门推荐 -->
      <section class="hot-section" v-if="hotArticles.length > 0">
        <div class="section-title">
          <h2>🔥 热门推荐</h2>
          <span class="section-sub">阅读量最高的文章</span>
        </div>
        <div class="hot-grid">
          <article class="hot-card hot-card-main" v-if="hotArticles[0]" @click="goToDetail(hotArticles[0].id)">
            <div class="hot-card-bg" v-if="hotArticles[0].cover_url">
              <img :src="hotArticles[0].cover_url" :alt="hotArticles[0].title" />
              <div class="hot-card-overlay"></div>
            </div>
            <div class="hot-card-content">
              <span class="hot-badge">🔥 热门</span>
              <h3>{{ hotArticles[0].title }}</h3>
              <p>{{ hotArticles[0].summary }}</p>
              <div class="hot-meta">
                <span>👁 {{ hotArticles[0].views || 0 }}</span>
                <span>❤️ {{ hotArticles[0].likes || 0 }}</span>
                <span>{{ formatDate(hotArticles[0].created_at) }}</span>
              </div>
            </div>
          </article>
          <div class="hot-side">
            <article
              v-for="(a, i) in hotArticles.slice(1, 4)"
              :key="a.id"
              class="hot-mini"
              @click="goToDetail(a.id)"
            >
              <span class="hot-rank">{{ String(i + 2).padStart(2, '0') }}</span>
              <div class="hot-mini-info">
                <h4>{{ a.title }}</h4>
                <span>👁 {{ a.views || 0 }} · ❤️ {{ a.likes || 0 }}</span>
              </div>
              <span class="hot-mini-arrow">→</span>
            </article>
          </div>
        </div>
      </section>

      <!-- 搜索和分类 -->
      <div class="filter-bar" ref="articlesSection">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="keyword"
            @input="onSearchInput"
            placeholder="搜索感兴趣的文章..."
          />
          <button v-if="keyword" class="search-clear" @click="clearSearch">×</button>
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
        <div class="section-title">
          <h2>🏷️ 热门标签</h2>
        </div>
        <div class="tag-cloud">
          <span
            v-for="tag in tagCloud"
            :key="tag.name"
            class="tag-item"
            :style="getTagStyle(tag.count)"
            @click="filterByTag(tag.name)"
          >
            {{ tag.name }} <sup>{{ tag.count }}</sup>
          </span>
        </div>
      </div>

      <!-- 文章列表 -->
      <section class="articles-section">
        <div class="section-title">
          <h2>{{ activeCategory === '全部' ? '最新文章' : activeCategory }}</h2>
          <span class="section-sub">共 {{ total }} 篇文章</span>
        </div>

        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>正在加载文章...</p>
        </div>

        <EmptyState
          v-else-if="articles.length === 0"
          icon="📭"
          :title="keyword ? '没有找到相关文章' : '还没有文章'"
          :description="keyword ? '换个关键词试试？' : '点击右上角「写文章」开始你的第一篇创作吧！'"
        />

        <div v-else class="articles-grid">
          <article
            v-for="article in articles"
            :key="article.id"
            class="article-card"
            @click="goToDetail(article.id)"
          >
            <div class="ac-cover" v-if="article.cover_url">
              <img :src="article.cover_url" :alt="article.title" loading="lazy" />
              <span class="ac-category">{{ article.category }}</span>
            </div>
            <div class="ac-body">
              <div class="ac-header">
                <h3>
                  <span class="pin-badge" v-if="article.is_pinned">📌</span>
                  {{ article.title }}
                </h3>
                <span v-if="!article.cover_url" class="ac-category inline">{{ article.category }}</span>
              </div>
              <p class="ac-summary">{{ article.summary }}</p>
              <div class="ac-footer">
                <div class="ac-tags" v-if="article.tags">
                  <span
                    v-for="tag in getTags(article.tags).slice(0, 3)"
                    :key="tag"
                    class="ac-tag"
                    @click.stop="filterByTag(tag)"
                  >#{{ tag }}</span>
                </div>
                <div class="ac-meta">
                  <span class="ac-date">{{ formatDate(article.created_at) }}</span>
                  <span class="ac-stat">👁 {{ article.views || 0 }}</span>
                  <span class="ac-stat">❤️ {{ article.likes || 0 }}</span>
                  <span class="ac-read">阅读全文 →</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- 分页 -->
        <div class="pagination" v-if="totalPages > 1">
          <button :disabled="page <= 1" @click="changePage(page - 1)">← 上一页</button>
          <template v-for="p in displayPages" :key="p">
            <button
              v-if="p !== '...'"
              :class="{ active: p === page }"
              @click="changePage(p)"
            >{{ p }}</button>
            <span v-else class="ellipsis">…</span>
          </template>
          <button :disabled="page >= totalPages" @click="changePage(page + 1)">下一页 →</button>
          <span class="page-jump">
            <span>跳至</span>
            <input
              v-model="jumpPage"
              @keyup.enter="jumpToPage"
              @blur="jumpToPage"
              type="number"
              :min="1"
              :max="totalPages"
              placeholder="?"
            />
            <span>页</span>
          </span>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { inject } from 'vue'
import EmptyState from '../components/EmptyState.vue'

const router = useRouter()
const toast = inject('toast', null)

const articles = ref([])
const hotArticles = ref([])
const tagCloud = ref([])
const stats = ref({ total: 0, totalCategories: 0, totalViews: 0, totalComments: 0 })
const loading = ref(true)
const pageLoading = ref(true)
const page = ref(1)
const total = ref(0)
const totalPages = ref(0)
const keyword = ref('')
const activeCategory = ref('全部')
const categories = ref(['全部'])
const jumpPage = ref('')
const articlesSection = ref(null)

const statItems = computed(() => [
  { icon: '📄', value: stats.value.total, label: '文章总数' },
  { icon: '📂', value: stats.value.totalCategories, label: '分类数量' },
  { icon: '👁', value: stats.value.totalViews, label: '总阅读量' },
  { icon: '💬', value: stats.value.totalComments, label: '总评论数' },
])

const getTagStyle = (count) => ({
  fontSize: `${Math.min(0.8 + count * 0.12, 1.5)}rem`,
  opacity: Math.min(0.6 + count * 0.08, 1),
  fontWeight: count > 3 ? 600 : 400,
})

let searchTimer = null
const onSearchInput = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(doSearch, 400)
}

const clearSearch = () => {
  keyword.value = ''
  doSearch()
}

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

const jumpToPage = () => {
  const target = parseInt(jumpPage.value)
  if (target >= 1 && target <= totalPages.value) changePage(target)
  jumpPage.value = ''
}

const scrollToArticles = () => {
  if (articlesSection.value) {
    articlesSection.value.scrollIntoView({ behavior: 'smooth' })
  }
}

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

const doSearch = () => {
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

onMounted(async () => {
  await Promise.all([
    fetchStats(),
    fetchHotArticles(),
    fetchTagCloud(),
    fetchCategories(),
    fetchArticles(),
  ])
  pageLoading.value = false
})
</script>

<style scoped>
.home {
  max-width: 100%;
}

/* ===== 骨架屏 ===== */
.hero-skeleton {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 3rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-md);
}
.skeleton-line {
  height: 14px;
  background: var(--bg-skeleton);
  border-radius: 6px;
  animation: sk-pulse 1.6s ease-in-out infinite;
}
.w-60 { width: 60%; }
.w-40 { width: 40%; }
.w-30 { width: 30%; }
.h-8 { height: 2rem; }
.h-5 { height: 1.2rem; }
.mt-3 { margin-top: 1rem; }
.mt-2 { margin-top: 0.6rem; }
.mt-4 { margin-top: 1.5rem; }
.stats-skeleton {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.skeleton-card {
  background: var(--bg-skeleton);
  border-radius: var(--radius-md);
  animation: sk-pulse 1.6s ease-in-out infinite;
  min-height: 90px;
}
.skeleton-card.large {
  min-height: 200px;
}
@keyframes sk-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
@media (max-width: 768px) {
  .stats-skeleton { grid-template-columns: repeat(2, 1fr); }
}

/* ===== 英雄区 ===== */
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3rem;
  padding: 3rem;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.08), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.hero-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-tag);
  color: var(--primary);
  padding: 0.35rem 1rem;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
}

.hero-badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
  animation: dot-blink 2s ease-in-out infinite;
}

@keyframes dot-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.25;
  margin-bottom: 1rem;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.hero-highlight {
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  font-size: 1.08rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 1.8rem;
  max-width: 480px;
}

.hero-actions {
  display: flex;
  gap: 0.8rem;
}

.hero-btn {
  padding: 0.75rem 1.8rem;
  border-radius: var(--radius-full);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: all var(--transition);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.hero-btn.primary {
  background: var(--gradient);
  color: white;
  box-shadow: var(--shadow-md);
}

.hero-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
}

.hero-btn.secondary {
  background: var(--bg-tag);
  color: var(--primary);
  border: 2px solid transparent;
}

.hero-btn.secondary:hover {
  border-color: var(--primary);
  background: transparent;
}

/* 英雄区视觉装饰 */
.hero-visual {
  flex-shrink: 0;
  width: 280px;
  height: 280px;
  position: relative;
}

.hero-shape {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.2));
  animation: hero-float 6s ease-in-out infinite;
}

@keyframes hero-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15px) scale(1.03); }
}

.hero-floating-card {
  position: absolute;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 0.6rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: var(--shadow-lg);
  font-size: 0.85rem;
  font-weight: 600;
  animation: card-float 4s ease-in-out infinite;
  white-space: nowrap;
}

.card-1 { top: 10px; right: -20px; animation-delay: 0s; }
.card-2 { bottom: 50px; left: -30px; animation-delay: 1.5s; }
.card-3 { top: 50%; right: -10px; animation-delay: 3s; }

@keyframes card-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.hf-icon { font-size: 1.1rem; }
.hf-label { color: var(--text-primary); }

/* ===== 统计卡片 ===== */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition);
  border: 1px solid var(--border-light);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-light);
}

.stat-icon {
  font-size: 2rem;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tag);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 1.6rem;
  font-weight: 800;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-top: 0.15rem;
}

/* ===== 区块标题 ===== */
.section-title {
  display: flex;
  align-items: baseline;
  gap: 0.8rem;
  margin-bottom: 1.2rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid var(--border-light);
}

.section-title h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.section-sub {
  font-size: 0.85rem;
  color: var(--text-tertiary);
}

/* ===== 热门推荐 ===== */
.hot-section {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.hot-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

.hot-card {
  cursor: pointer;
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all var(--transition);
  border: 1px solid var(--border-light);
}

.hot-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.hot-card-main {
  position: relative;
  min-height: 260px;
  display: flex;
  align-items: flex-end;
}

.hot-card-bg {
  position: absolute;
  inset: 0;
}

.hot-card-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hot-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 30%, rgba(0,0,0,0.7));
}

.hot-card-content {
  position: relative;
  z-index: 1;
  padding: 2rem 1.5rem 1.5rem;
  color: white;
}

.hot-badge {
  display: inline-block;
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
  padding: 0.2rem 0.7rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.6rem;
}

.hot-card-content h3 {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
  line-height: 1.4;
}

.hot-card-content p {
  color: rgba(255,255,255,0.8);
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
  font-size: 0.8rem;
  color: rgba(255,255,255,0.7);
}

.hot-side {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hot-mini {
  background: var(--bg-card-hover);
  border-radius: var(--radius-sm);
  padding: 1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  border: 1px solid var(--border-light);
  transition: all var(--transition-fast);
  flex: 1;
}

.hot-mini:hover {
  border-color: var(--primary);
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
}

.hot-rank {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--primary);
  opacity: 0.6;
  min-width: 32px;
  font-variant-numeric: tabular-nums;
}

.hot-mini-info {
  flex: 1;
  min-width: 0;
}

.hot-mini-info h4 {
  font-size: 0.88rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hot-mini-info span {
  font-size: 0.78rem;
  color: var(--text-tertiary);
}

.hot-mini-arrow {
  color: var(--text-tertiary);
  transition: transform var(--transition-fast);
  font-size: 1.1rem;
}

.hot-mini:hover .hot-mini-arrow {
  transform: translateX(3px);
  color: var(--primary);
}

/* ===== 搜索和分类 ===== */
.filter-bar {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-input);
  border-radius: var(--radius-full);
  padding: 0.6rem 1.2rem;
  margin-bottom: 1rem;
  border: 2px solid transparent;
  transition: all var(--transition);
}

.search-box:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.search-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--text-primary);
  outline: none;
}

.search-box input::placeholder {
  color: var(--text-tertiary);
}

.search-clear {
  background: none;
  border: none;
  font-size: 1.3rem;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 0 0.2rem;
  transition: color var(--transition-fast);
}

.search-clear:hover {
  color: var(--danger);
}

.category-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-tabs button {
  padding: 0.5rem 1.1rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-full);
  background: transparent;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  font-family: inherit;
}

.category-tabs button:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.category-tabs button.active {
  background: var(--gradient);
  color: white;
  border-color: transparent;
}

/* ===== 标签云 ===== */
.tag-cloud-section {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.tag-cloud-section .section-title {
  margin-bottom: 0.8rem;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
}

.tag-item {
  cursor: pointer;
  padding: 0.35rem 0.9rem;
  border-radius: var(--radius-full);
  background: var(--bg-tag);
  color: var(--primary);
  transition: all var(--transition-fast);
  line-height: 1.5;
}

.tag-item:hover {
  background: var(--primary);
  color: white !important;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.tag-item sup {
  font-size: 0.65em;
  font-weight: 400;
  opacity: 0.7;
}

/* ===== 文章列表 ===== */
.articles-section {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.articles-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 文章卡片 */
.article-card {
  display: flex;
  background: var(--bg-card-hover);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--border-light);
  transition: all var(--transition);
}

.article-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.ac-cover {
  width: 260px;
  min-width: 260px;
  position: relative;
  overflow: hidden;
}

.ac-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.article-card:hover .ac-cover img {
  transform: scale(1.05);
}

.ac-category {
  position: absolute;
  top: 0.8rem;
  left: 0.8rem;
  background: var(--gradient);
  color: white;
  padding: 0.2rem 0.7rem;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 600;
}

.ac-category.inline {
  position: static;
  display: inline-block;
}

.ac-body {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.ac-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.6rem;
  margin-bottom: 0.6rem;
}

.ac-header h3 {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.4;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pin-badge {
  display: inline;
  font-size: 0.9rem;
}

.ac-summary {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
  margin-bottom: 0.8rem;
}

.ac-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.ac-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.ac-tag {
  background: var(--bg-tag);
  color: var(--primary);
  padding: 0.15rem 0.6rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.ac-tag:hover {
  background: var(--primary);
  color: white;
}

.ac-meta {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.ac-date {
  color: var(--text-tertiary);
  font-size: 0.82rem;
}

.ac-stat {
  color: var(--text-tertiary);
  font-size: 0.8rem;
}

.ac-read {
  color: var(--primary);
  font-weight: 600;
  font-size: 0.85rem;
  transition: transform var(--transition-fast);
}

.article-card:hover .ac-read {
  transform: translateX(3px);
}

/* ===== 分页 ===== */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.4rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-light);
  flex-wrap: wrap;
}

.pagination button {
  padding: 0.45rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.pagination button:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
}

.pagination button.active {
  background: var(--gradient);
  color: white;
  border-color: transparent;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ellipsis {
  padding: 0 0.3rem;
  color: var(--text-tertiary);
}

.page-jump {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-left: 0.6rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.page-jump input {
  width: 48px;
  padding: 0.35rem 0.4rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  text-align: center;
  font-size: 0.85rem;
  background: var(--bg-input);
  color: var(--text-primary);
  outline: none;
  transition: border-color var(--transition-fast);
}

.page-jump input:focus {
  border-color: var(--primary);
}

/* ===== 响应式 ===== */
@media (max-width: 1024px) {
  .hero-visual { display: none; }
  .hero { padding: 2.5rem 2rem; }
  .hero-title { font-size: 2rem; }
}

@media (max-width: 768px) {
  .hero {
    padding: 2rem 1.5rem;
    flex-direction: column;
    text-align: center;
  }
  .hero-title { font-size: 1.7rem; }
  .hero-desc { max-width: 100%; }
  .hero-actions { justify-content: center; }
  .hero-visual { display: none; }

  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
  }

  .hot-grid {
    grid-template-columns: 1fr;
  }

  .hot-card-main { min-height: 200px; }

  .article-card {
    flex-direction: column;
  }

  .ac-cover {
    width: 100%;
    min-width: 100%;
    height: 180px;
  }

  .articles-section { padding: 1.2rem; }
  .hot-section { padding: 1.2rem; }

  .pagination { gap: 0.25rem; }
  .pagination button { padding: 0.35rem 0.6rem; font-size: 0.8rem; }
  .page-jump { width: 100%; justify-content: center; margin-left: 0; margin-top: 0.4rem; }
}

@media (max-width: 480px) {
  .hero-title { font-size: 1.4rem; }
  .hero { padding: 1.5rem 1rem; }
  .stats-bar { grid-template-columns: 1fr 1fr; gap: 0.6rem; }
  .stat-card { padding: 1rem; gap: 0.6rem; }
  .stat-icon { font-size: 1.5rem; width: 40px; height: 40px; }
  .stat-num { font-size: 1.3rem; }
}
</style>
