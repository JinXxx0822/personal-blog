<template>
  <div class="links-page">
    <h2>🔗 友情链接</h2>
    <p class="subtitle">欢迎交换友链，一起成长</p>

    <!-- 管理员添加友链 -->
    <div class="links-form" v-if="user">
      <div class="form-row">
        <input v-model="newName" placeholder="网站名称" />
        <input v-model="newUrl" placeholder="网址 (https://...)" />
        <input v-model="newDesc" placeholder="描述（选填）" />
        <button @click="addLink" :disabled="adding">{{ adding ? '添加中...' : '添加' }}</button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="links.length === 0" class="empty">
      <p>暂无友链，欢迎交换</p>
    </div>

    <div v-else class="links-grid">
      <a v-for="link in links" :key="link.id" :href="link.url" target="_blank" rel="noopener" class="link-card">
        <div class="link-info">
          <h4>{{ link.name }}</h4>
          <p>{{ link.description || '一个有趣的网站' }}</p>
          <span class="link-url">{{ link.url }}</span>
        </div>
        <button v-if="user" class="btn-del" @click.prevent="deleteLink(link.id)">×</button>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const links = ref([])
const loading = ref(true)
const user = ref(null)
const newName = ref('')
const newUrl = ref('')
const newDesc = ref('')
const adding = ref(false)

const fetchLinks = async () => {
  try {
    const res = await axios.get('/api/links')
    links.value = res.data
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const addLink = async () => {
  if (!newName.value || !newUrl.value) return alert('名称和链接不能为空')
  adding.value = true
  try {
    await axios.post('/api/links', {
      name: newName.value,
      url: newUrl.value,
      description: newDesc.value
    })
    newName.value = ''
    newUrl.value = ''
    newDesc.value = ''
    await fetchLinks()
  } catch (e) {
    alert('添加失败')
  } finally {
    adding.value = false
  }
}

const deleteLink = async (id) => {
  if (!confirm('确定删除此友链？')) return
  try {
    await axios.delete(`/api/links/${id}`)
    await fetchLinks()
  } catch (e) {
    alert('删除失败')
  }
}

onMounted(() => {
  const saved = localStorage.getItem('user')
  if (saved) try { user.value = JSON.parse(saved) } catch (e) {}
  fetchLinks()
})
</script>

<style scoped>
.links-page {
  max-width: 800px;
  margin: 0 auto;
}

.links-page h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #888;
  margin-bottom: 2rem;
}

.links-form {
  background: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.dark .links-form {
  background: #16213e;
}

.form-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.form-row input {
  flex: 1;
  min-width: 120px;
  padding: 0.5rem 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  background: inherit;
  color: inherit;
}

.form-row input:focus { border-color: #667eea; }

.form-row button {
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  white-space: nowrap;
}

.form-row button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.link-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: all 0.3s;
  position: relative;
}

.link-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  border-color: #667eea;
}

.dark .link-card {
  background: #16213e;
}

.link-info h4 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #667eea;
}

.link-info p {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.link-url {
  font-size: 0.8rem;
  color: #999;
  word-break: break-all;
}

.btn-del {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #ff6b6b;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  opacity: 0;
  transition: opacity 0.3s;
}

.link-card:hover .btn-del {
  opacity: 1;
}

@media (max-width: 768px) {
  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>
