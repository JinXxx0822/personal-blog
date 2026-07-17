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

    <div v-else-if="!aboutContent && !user" class="empty">
      <p>博主还没有写自我介绍</p>
    </div>

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
import axios from 'axios'
import { marked } from 'marked'

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
    const res = await axios.get('/api/about')
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
    await axios.post('/api/about', { content: content.value })
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
  font-size: 1.8rem;
  margin-bottom: 2rem;
}

.about-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.dark .about-card {
  background: #16213e;
}

.about-form textarea {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  outline: none;
  background: inherit;
  color: inherit;
}

.about-form textarea:focus {
  border-color: #667eea;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.hint {
  color: #999;
  font-size: 0.85rem;
}

.form-actions button {
  padding: 0.6rem 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: opacity 0.3s;
}

.form-actions button:disabled {
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

.about-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.dark .about-content {
  background: #16213e;
}

.about-body {
  line-height: 1.8;
  color: #444;
}

.dark .about-body {
  color: #ccc;
}

.about-body :deep(h1), .about-body :deep(h2), .about-body :deep(h3) {
  margin: 1.5rem 0 0.8rem;
  color: #333;
}

.dark .about-body :deep(h1), .dark .about-body :deep(h2), .dark .about-body :deep(h3) {
  color: #e0e0e0;
}

.about-body :deep(p) { margin-bottom: 1rem; }

.about-footer {
  text-align: center;
  margin-top: 2rem;
}

.login-link {
  color: #667eea;
  text-decoration: none;
}
</style>
