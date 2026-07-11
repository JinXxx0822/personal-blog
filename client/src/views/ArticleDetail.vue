<template>
  <div class="article-detail">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="!article" class="error">
      <p>文章不存在或已被删除</p>
      <router-link to="/" class="back-link">← 返回首页</router-link>
    </div>
    
    <div v-else class="article-content">
      <div class="article-actions">
        <router-link to="/" class="back-link">← 返回首页</router-link>
        <div class="action-buttons">
          <router-link :to="`/edit/${article.id}`" class="btn-edit">编辑</router-link>
          <button @click="deleteArticle" class="btn-delete">删除</button>
        </div>
      </div>
      
      <article class="article">
        <header class="article-header">
          <h1>{{ article.title }}</h1>
          <div class="article-meta">
            <span class="publish-date">{{ formatDate(article.created_at) }}</span>
            <span v-if="article.updated_at !== article.created_at" class="update-date">
              更新于 {{ formatDate(article.updated_at) }}
            </span>
          </div>
        </header>
        
        <div class="article-body">
          <p v-for="(paragraph, index) in contentParagraphs" :key="index">
            {{ paragraph }}
          </p>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const article = ref(null)
const loading = ref(true)

const contentParagraphs = computed(() => {
  if (!article.value?.content) return []
  return article.value.content.split('\n').filter(p => p.trim())
})

const fetchArticle = async () => {
  try {
    const response = await axios.get(`/api/articles/${route.params.id}`)
    article.value = response.data
  } catch (error) {
    console.error('获取文章失败:', error)
    article.value = null
  } finally {
    loading.value = false
  }
}

const deleteArticle = async () => {
  if (!confirm('确定要删除这篇文章吗？此操作不可恢复。')) {
    return
  }
  
  try {
    await axios.delete(`/api/articles/${route.params.id}`)
    alert('删除成功！')
    router.push('/')
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败，请稍后重试')
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchArticle()
})
</script>

<style scoped>
.article-detail {
  max-width: 800px;
  margin: 0 auto;
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

.error {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.article-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.article-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.back-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

.action-buttons {
  display: flex;
  gap: 0.8rem;
}

.btn-edit, .btn-delete {
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-edit {
  background: #667eea;
  color: white;
}

.btn-edit:hover {
  background: #5a6fd6;
}

.btn-delete {
  background: #ff6b6b;
  color: white;
}

.btn-delete:hover {
  background: #ee5a5a;
}

.article-header {
  margin-bottom: 2rem;
}

.article-header h1 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.article-meta {
  display: flex;
  gap: 1rem;
  color: #888;
  font-size: 0.9rem;
}

.update-date {
  color: #667eea;
}

.article-body {
  line-height: 1.8;
  color: #444;
  font-size: 1.05rem;
}

.article-body p {
  margin-bottom: 1.2rem;
  text-indent: 2em;
}

@media (max-width: 768px) {
  .article-content {
    padding: 1.5rem;
  }
  
  .article-header h1 {
    font-size: 1.5rem;
  }
  
  .article-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
