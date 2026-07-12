<template>
  <div class="archive-page">
    <h2>📅 文章归档</h2>
    <p class="subtitle">共 {{ totalCount }} 篇文章</p>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="Object.keys(archive).length === 0" class="empty">
      <p>暂无文章</p>
    </div>

    <div v-else class="timeline">
      <div v-for="(articles, month) in archive" :key="month" class="timeline-group">
        <div class="timeline-month">{{ month }}</div>
        <div class="timeline-items">
          <div v-for="article in articles" :key="article.id" class="timeline-item" @click="$router.push(`/article/${article.id}`)">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-date">{{ formatDay(article.created_at) }}</span>
              <h4>{{ article.title }}</h4>
              <div class="timeline-meta">
                <span class="cat">{{ article.category }}</span>
                <span class="views">👁 {{ article.views || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const archive = ref({})
const loading = ref(true)
const totalCount = ref(0)

const formatDay = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', { day: 'numeric' })
}

onMounted(async () => {
  try {
    const res = await axios.get('/api/articles/archive/list')
    archive.value = res.data
    Object.values(res.data).forEach(arr => totalCount.value += arr.length)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.archive-page {
  max-width: 800px;
  margin: 0 auto;
}

.archive-page h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #888;
  margin-bottom: 2rem;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px; height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty {
  text-align: center;
  padding: 3rem;
  color: #888;
}

.timeline-group {
  margin-bottom: 2rem;
}

.timeline-month {
  font-size: 1.3rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #667eea;
}

.timeline-items {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  border-left: 3px solid #e0e0e0;
  padding-left: 1.5rem;
}

.timeline-item {
  background: white;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  cursor: pointer;
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: all 0.3s;
}

.timeline-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.dark .timeline-item {
  background: #16213e;
}

.timeline-dot {
  position: absolute;
  left: -1.75rem;
  top: 1.3rem;
  width: 10px;
  height: 10px;
  background: #667eea;
  border-radius: 50%;
  border: 2px solid white;
}

.dark .timeline-dot {
  border-color: #1a1a2e;
}

.timeline-content h4 {
  font-size: 1rem;
  margin-bottom: 0.3rem;
}

.timeline-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #999;
}

.timeline-date {
  color: #667eea;
  font-size: 0.8rem;
  font-weight: 600;
}

.cat {
  background: #e8ecff;
  color: #667eea;
  padding: 0.1rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
}

.dark .cat { background: #1a1a4e; }
</style>
