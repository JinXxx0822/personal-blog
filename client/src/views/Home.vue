<template>
  <div class="home">
    <div class="hero">
      <h2>欢迎来到我的博客</h2>
      <p>记录学习、分享技术、沉淀思考</p>
    </div>
    
    <div class="articles-section">
      <div class="section-header">
        <h3>最新文章</h3>
        <span class="article-count">共 {{ articles.length }} 篇</span>
      </div>
      
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="articles.length === 0" class="empty-state">
        <p>暂无文章，点击右上角"写文章"开始创作吧！</p>
      </div>
      
      <div v-else class="articles-grid">
        <article 
          v-for="article in articles" 
          :key="article.id"
          class="article-card"
          @click="goToDetail(article.id)"
        >
          <div class="article-header">
            <h4 class="article-title">{{ article.title }}</h4>
            <span class="article-date">{{ formatDate(article.created_at) }}</span>
          </div>
          <p class="article-summary">{{ article.summary }}</p>
          <div class="article-footer">
            <span class="read-more">阅读全文 →</span>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const articles = ref([])
const loading = ref(true)

const fetchArticles = async () => {
  try {
    const response = await axios.get('/api/articles')
    articles.value = response.data
  } catch (error) {
    console.error('获取文章失败:', error)
    alert('获取文章列表失败，请检查后端服务是否启动')
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/article/${id}`)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
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
  margin-bottom: 2rem;
}

.hero h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.hero p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.articles-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.section-header h3 {
  font-size: 1.3rem;
  color: #333;
}

.article-count {
  color: #888;
  font-size: 0.9rem;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
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

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #888;
}

.articles-grid {
  display: grid;
  gap: 1.5rem;
}

.article-card {
  background: #fafafa;
  border-radius: 10px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #eee;
}

.article-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border-color: #667eea;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.8rem;
}

.article-title {
  font-size: 1.2rem;
  color: #333;
  font-weight: 600;
  flex: 1;
  margin-right: 1rem;
}

.article-date {
  color: #999;
  font-size: 0.85rem;
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

.article-footer {
  display: flex;
  justify-content: flex-end;
}

.read-more {
  color: #667eea;
  font-weight: 500;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .hero h2 {
    font-size: 1.5rem;
  }
  
  .article-header {
    flex-direction: column;
  }
  
  .article-date {
    margin-top: 0.3rem;
  }
}
</style>
