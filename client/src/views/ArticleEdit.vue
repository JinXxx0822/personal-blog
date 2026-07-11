<template>
  <div class="article-edit">
    <div class="edit-header">
      <router-link to="/" class="back-link">← 返回首页</router-link>
      <h2>{{ isEdit ? '编辑文章' : '写文章' }}</h2>
    </div>
    
    <form @submit.prevent="saveArticle" class="edit-form">
      <div class="form-group">
        <label for="title">标题 <span class="required">*</span></label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          placeholder="请输入文章标题"
          maxlength="100"
          required
        />
        <span class="char-count">{{ form.title.length }}/100</span>
      </div>
      
      <div class="form-group">
        <label for="summary">摘要</label>
        <textarea
          id="summary"
          v-model="form.summary"
          placeholder="请输入文章摘要（可选，不填则自动截取正文前100字）"
          rows="3"
          maxlength="200"
        ></textarea>
        <span class="char-count">{{ form.summary.length }}/200</span>
      </div>
      
      <div class="form-group">
        <label for="content">正文 <span class="required">*</span></label>
        <textarea
          id="content"
          v-model="form.content"
          placeholder="请输入文章内容，支持多行输入"
          rows="15"
          required
        ></textarea>
      </div>
      
      <div class="form-actions">
        <router-link to="/" class="btn-cancel">取消</router-link>
        <button type="submit" class="btn-submit" :disabled="saving">
          {{ saving ? '保存中...' : '保存文章' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const saving = ref(false)

const form = ref({
  title: '',
  summary: '',
  content: ''
})

const fetchArticle = async () => {
  if (!route.params.id) return
  
  isEdit.value = true
  try {
    const response = await axios.get(`/api/articles/${route.params.id}`)
    const article = response.data
    form.value = {
      title: article.title || '',
      summary: article.summary || '',
      content: article.content || ''
    }
  } catch (error) {
    console.error('获取文章失败:', error)
    alert('获取文章信息失败')
    router.push('/')
  }
}

const validateForm = () => {
  const title = form.value.title.trim()
  const content = form.value.content.trim()
  
  if (!title) {
    alert('标题不能为空')
    return false
  }
  
  if (title.length > 100) {
    alert('标题不能超过100字')
    return false
  }
  
  if (!content) {
    alert('正文不能为空')
    return false
  }
  
  if (content.length < 10) {
    alert('正文内容太短，请至少输入10个字')
    return false
  }
  
  return true
}

const saveArticle = async () => {
  if (!validateForm()) return
  
  saving.value = true
  try {
    const payload = {
      title: form.value.title.trim(),
      summary: form.value.summary.trim() || form.value.content.trim().substring(0, 100),
      content: form.value.content.trim()
    }
    
    if (isEdit.value) {
      await axios.put(`/api/articles/${route.params.id}`, payload)
      alert('文章更新成功！')
    } else {
      await axios.post('/api/articles', payload)
      alert('文章发布成功！')
    }
    
    router.push('/')
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchArticle()
})
</script>

<style scoped>
.article-edit {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.edit-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.edit-header h2 {
  margin-top: 1rem;
  color: #333;
}

.back-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #444;
  font-size: 0.95rem;
}

.required {
  color: #ff6b6b;
}

.form-group input,
.form-group textarea {
  padding: 0.8rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #aaa;
}

.char-count {
  text-align: right;
  font-size: 0.8rem;
  color: #999;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.btn-cancel {
  padding: 0.8rem 2rem;
  border: 2px solid #ddd;
  background: white;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-cancel:hover {
  background: #f5f5f5;
}

.btn-submit {
  padding: 0.8rem 2rem;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .article-edit {
    padding: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-cancel, .btn-submit {
    width: 100%;
    text-align: center;
  }
}
</style>
