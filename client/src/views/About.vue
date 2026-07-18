<template>
  <div class="about-page">
    <h2>👤 关于我</h2>

    <div class="about-card" v-if="user">
      <div class="about-form">
        <textarea v-model="content" placeholder="介绍一下自己吧..." rows="10"></textarea>
        <div class="form-actions">
          <span class="hint">支持 Markdown 格式</span>
          <button @click="save" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <EmptyState v-else-if="!aboutContent && !user" icon="👤" title="还没有自我介绍" description="博主还没有写自我介绍" />

    <div v-else class="about-content">
      <div class="about-body" v-html="renderedContent"></div>
    </div>

    <div v-if="!user" class="about-footer">
      <router-link to="/login" class="login-link">登录后可编辑关于页面</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import api from '../api'
import { marked } from 'marked'
import EmptyState from '../components/EmptyState.vue'

const toast = inject('toast', null)
const aboutContent = ref('')
const content = ref('')
const loading = ref(true)
const saving = ref(false)
const user = ref(null)

const renderedContent = computed(() => {
  return aboutContent.value ? marked(aboutContent.value) : ''
})

const fetchAbout = async () => {
  try {
    const res = await api.get('/api/about')
    aboutContent.value = res.data?.content || ''
    content.value = aboutContent.value
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const save = async () => {
  saving.value = true
  try {
    await api.post('/api/about', { content: content.value })
    aboutContent.value = content.value
    if (toast) toast.success('保存成功')
    else alert('保存成功')
  } catch (e) {
    if (toast) toast.error('保存失败')
    else alert('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  const saved = localStorage.getItem('user')
  if (saved) try { user.value = JSON.parse(saved) } catch (e) {}
  fetchAbout()
})
</script>

<style scoped>
.about-page {
  max-width: 800px;
  margin: 0 auto;
}

.about-page h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
}

.about-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.about-form textarea {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  outline: none;
  background: var(--bg-input);
  color: var(--text-primary);
  transition: border-color var(--transition-fast);
}

.about-form textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.hint { color: var(--text-tertiary); font-size: 0.85rem; }

.form-actions button {
  padding: 0.6rem 2rem;
  background: var(--gradient);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  transition: all var(--transition);
}

.form-actions button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.form-actions button:disabled { opacity: 0.6; cursor: not-allowed; }

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

.about-content {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.about-body {
  line-height: 1.9;
  font-size: 1.02rem;
  color: var(--text-primary);
}

.about-body :deep(h1), .about-body :deep(h2), .about-body :deep(h3) {
  margin: 1.5rem 0 0.8rem;
  color: var(--text-primary);
}

.about-body :deep(p) { margin-bottom: 1rem; }

.about-footer { text-align: center; margin-top: 2rem; }

.login-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-fast);
}
.login-link:hover { color: var(--accent); }
</style>
