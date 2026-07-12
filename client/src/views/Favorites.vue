<template>
  <div class="favorites-page">
    <h2>⭐ 我的收藏</h2>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="favorites.length === 0" class="empty">
      <p>📭 还没有收藏任何文章</p>
      <router-link to="/" class="browse-link">去逛逛 →</router-link>
    </div>

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
import axios from 'axios'

const favorites = ref([])
const loading = ref(true)
const user = ref(null)

const fetchFavorites = async () => {
  try {
    const res = await axios.get(`/api/articles/favorites/user/${user.value.id}`)
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
}

.favorites-page h2 {
  font-size: 1.8rem;
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

.browse-link {
  display: inline-block;
  margin-top: 1rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.fav-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fav-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: all 0.3s;
  display: flex;
}

.fav-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
}

.dark .fav-card {
  background: #16213e;
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
  margin-bottom: 0.5rem;
}

.fav-info p {
  color: #888;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 0.8rem;
}

.fav-meta {
  display: flex;
  gap: 0.8rem;
  font-size: 0.8rem;
  color: #999;
  flex-wrap: wrap;
}

.fav-date {
  color: #667eea;
}

@media (max-width: 768px) {
  .fav-card {
    flex-direction: column;
  }
  .fav-cover {
    width: 100%;
    min-width: 100%;
    height: 140px;
  }
}
</style>
