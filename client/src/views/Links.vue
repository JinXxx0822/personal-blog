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

    <EmptyState v-else-if="links.length === 0" icon="🔗" title="暂无友链" description="欢迎交换友链，一起成长" />

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
import { ref, onMounted, inject } from 'vue'
import api from '../api'
import EmptyState from '../components/EmptyState.vue'

const toast = inject('toast', null)
const links = ref([])
const loading = ref(true)
const user = ref(null)
const newName = ref('')
const newUrl = ref('')
const newDesc = ref('')
const adding = ref(false)

const fetchLinks = async () => {
  try {
    const res = await api.get('/api/links')
    links.value = res.data
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const addLink = async () => {
  if (!newName.value || !newUrl.value) {
    if (toast) toast.warning('名称和链接不能为空')
    else alert('名称和链接不能为空')
    return
  }
  adding.value = true
  try {
    await api.post('/api/links', {
      name: newName.value,
      url: newUrl.value,
      description: newDesc.value
    })
    newName.value = ''
    newUrl.value = ''
    newDesc.value = ''
    await fetchLinks()
    if (toast) toast.success('友链添加成功')
  } catch (e) {
    if (toast) toast.error('添加失败')
    else alert('添加失败')
  } finally {
    adding.value = false
  }
}

const deleteLink = async (id) => {
  if (!confirm('确定删除此友链？')) return
  try {
    await api.delete(`/api/links/${id}`)
    await fetchLinks()
  } catch (e) {
    if (toast) toast.error('删除失败')
    else alert('删除失败')
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
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.links-page h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
}

.subtitle {
  color: var(--text-tertiary);
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.links-form {
  background: var(--bg-card-hover);
  border-radius: var(--radius-md);
  padding: 1rem 1.2rem;
  margin-bottom: 2rem;
  border: 1px solid var(--border-light);
}

.form-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.form-row input {
  flex: 1;
  min-width: 120px;
  padding: 0.6rem 0.8rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  outline: none;
  background: var(--bg-input);
  color: var(--text-primary);
  font-family: inherit;
  transition: border-color var(--transition-fast);
}

.form-row input:focus {
  border-color: var(--primary);
}

.form-row button {
  padding: 0.6rem 1.5rem;
  background: var(--gradient);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  white-space: nowrap;
  transition: all var(--transition);
}

.form-row button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
.form-row button:disabled { opacity: 0.6; cursor: not-allowed; }

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

.links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
}

.link-card {
  background: var(--bg-card-hover);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--border-light);
  transition: all var(--transition);
  position: relative;
}

.link-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.link-info h4 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: var(--primary);
  font-weight: 700;
}

.link-info p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.link-url {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  word-break: break-all;
}

.btn-del {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--danger);
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.link-card:hover .btn-del { opacity: 1; }

@media (max-width: 768px) {
  .links-grid { grid-template-columns: 1fr; }
  .links-page { padding: 1.5rem; }
}
</style>
