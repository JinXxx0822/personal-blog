<template>
  <div class="favorites-page">
    <h2>⭐ 我的收藏</h2>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <EmptyState v-else-if="favorites.length === 0" icon="⭐" title="还没有收藏" description="浏览文章时可以点击收藏按钮">
      <router-link to="/" class="browse-link">去首页逛逛 →</router-link>
    </EmptyState>

    <div v-else class="fav-grid">
      <div v-for="fav in favorites" :key="fav.id" class="fav-card" @click="$router.push(`/article/${fav.id}`)">
        <div class="fav-cover" v-if="fav.cover_url">
          <img :src="fav.cover_url" :alt="fav.title" />
        </div>
        <div class="fav-info">
          <h4>{{ fav.title }}</h4>
          <p>{{ fav.summary }}</p>
          <div class="fav-meta">
            <span>{{ fav.category }}</span>
            <span>👁 {{ fav.views }}</span>
            <span>❤️ {{ fav.likes }}</span>
            <span class="fav-date">{{ formatDate(fav.fav_time) }}</span>
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

const favorites = ref([])
const loading = ref(true)
const user = ref(null)

const fetchFavorites = async () => {
  try {
    const res = await api.get(`/api/articles/favorites/user/${user.value.id}`)
    favorites.value = res.data
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

onMounted(() => {
  const saved = localStorage.getItem('user')
  if (saved) {
    try { user.value = JSON.parse(saved) } catch (e) {}
    fetchFavorites()
  } else {
    loading.value = false
  }
})
</script>

<style scoped>
.favorites-page {
  max-width: 800px;
  margin: 0 auto;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.favorites-page h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
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

.browse-link {
  display: inline-block;
  margin-top: 0.8rem;
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
  transition: color var(--transition-fast);
}
.browse-link:hover { color: var(--accent); }

.fav-grid {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.fav-card {
  background: var(--bg-card-hover);
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--border-light);
  transition: all var(--transition);
  display: flex;
}

.fav-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.fav-cover {
  width: 160px;
  min-width: 160px;
}

.fav-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fav-info {
  padding: 1.2rem;
  flex: 1;
}

.fav-info h4 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.fav-info p {
  color: var(--text-secondary);
  font-size: 0.88rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 0.8rem;
  line-height: 1.5;
}

.fav-meta {
  display: flex;
  gap: 0.8rem;
  font-size: 0.8rem;
  color: var(--text-tertiary);
  flex-wrap: wrap;
}

.fav-date { color: var(--primary); font-weight: 500; }

@media (max-width: 768px) {
  .fav-card { flex-direction: column; }
  .fav-cover { width: 100%; min-width: 100%; height: 140px; }
  .favorites-page { padding: 1.5rem; }
}
</style>
