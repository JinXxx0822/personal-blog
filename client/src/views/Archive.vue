<template>
  <div class="archive-page">
    <h2>📅 文章归档</h2>
    <p class="subtitle">共 {{ totalCount }} 篇文章</p>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <EmptyState v-else-if="Object.keys(archive).length === 0" icon="📅" title="暂无文章" description="还没有发布过文章" />

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
import api from '../api'
import EmptyState from '../components/EmptyState.vue'

const archive = ref({})
const loading = ref(true)
const totalCount = ref(0)

const formatDay = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', { day: 'numeric' })
}

onMounted(async () => {
  try {
    const res = await api.get('/api/articles/archive/list')
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
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.archive-page h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
}

.subtitle {
  color: var(--text-tertiary);
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.loading { text-align: center; padding: 3rem; }

.spinner {
  width: 40px; height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin { to { transform: rotate(360deg); } }

.timeline-group { margin-bottom: 2rem; }

.timeline-month {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--primary);
}

.timeline-items {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  border-left: 3px solid var(--border);
  padding-left: 1.5rem;
}

.timeline-item {
  background: var(--bg-card-hover);
  border-radius: var(--radius-sm);
  padding: 1rem 1.2rem;
  cursor: pointer;
  position: relative;
  border: 1px solid var(--border-light);
  transition: all var(--transition);
}

.timeline-item:hover {
  transform: translateX(5px);
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
}

.timeline-dot {
  position: absolute;
  left: -1.78rem;
  top: 1.35rem;
  width: 10px;
  height: 10px;
  background: var(--primary);
  border-radius: 50%;
  border: 2px solid var(--bg-card);
}

.timeline-content h4 {
  font-size: 1rem;
  margin-bottom: 0.3rem;
  font-weight: 600;
}

.timeline-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.timeline-date {
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 600;
}

.cat {
  background: var(--bg-tag);
  color: var(--primary);
  padding: 0.1rem 0.5rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
}
</style>
