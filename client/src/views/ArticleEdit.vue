<template>
  <div class="article-edit">
    <div class="edit-header">
      <router-link to="/" class="back-link">← 返回首页</router-link>
      <h2>{{ isEdit ? '编辑文章' : '写文章' }}</h2>
    </div>

    <form @submit.prevent="saveArticle" class="edit-form">
      <div class="form-group">
        <label for="title">标题 <span class="required">*</span></label>
        <input id="title" v-model="form.title" type="text" placeholder="请输入文章标题" maxlength="100" required />
        <span class="char-count">{{ form.title.length }}/100</span>
      </div>

      <div class="form-row">
        <div class="form-group half">
          <label for="category">分类</label>
          <select id="category" v-model="form.category">
            <option value="笔记">📝 笔记</option>
            <option value="技术">💻 技术</option>
            <option value="生活">🌟 生活</option>
            <option value="随笔">✍️ 随笔</option>
          </select>
        </div>
        <div class="form-group half">
          <label for="tags">标签（用逗号分隔）</label>
          <input id="tags" v-model="form.tags" type="text" placeholder="如: Vue, JavaScript, 前端" />
        </div>
      </div>

      <div class="form-group">
        <label for="cover_url">封面图片地址</label>
        <div class="cover-input-row">
          <input id="cover_url" v-model="form.cover_url" type="text" placeholder="输入图片URL地址" />
          <button type="button" class="btn-preview" @click="previewCover" v-if="form.cover_url">预览</button>
        </div>
        <div class="cover-preview" v-if="showPreview && form.cover_url">
          <img :src="form.cover_url" alt="封面预览" @error="showPreview = false" />
        </div>
      </div>

      <div class="form-group">
        <label for="summary">摘要</label>
        <textarea id="summary" v-model="form.summary" placeholder="请输入文章摘要（可选，不填则自动截取正文前100字）" rows="2" maxlength="200"></textarea>
        <span class="char-count">{{ form.summary.length }}/200</span>
      </div>

      <div class="editor-container">
        <div class="editor-tabs">
          <button type="button" :class="{ active: editorMode === 'edit' }" @click="editorMode = 'edit'">✏️ 编辑</button>
          <button type="button" :class="{ active: editorMode === 'preview' }" @click="editorMode = 'preview'">👁 预览</button>
          <button type="button" :class="{ active: editorMode === 'split' }" @click="editorMode = 'split'">📐 分屏</button>
        </div>
        <div class="editor-body" :class="editorMode">
          <div class="editor-pane" v-show="editorMode !== 'preview'">
            <textarea
              id="content"
              v-model="form.content"
              placeholder="支持 Markdown 语法：&#10;# 标题&#10;**粗体** *斜体*&#10;- 列表项&#10;```js&#10;代码块&#10;```"
              rows="15"
              required
            ></textarea>
          </div>
          <div class="preview-pane" v-show="editorMode !== 'edit'" v-html="renderedPreview"></div>
        </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  }
})

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const saving = ref(false)
const editorMode = ref('edit')
const showPreview = ref(false)

const form = ref({
  title: '',
  summary: '',
  content: '',
  category: '笔记',
  tags: '',
  cover_url: ''
})

const renderedPreview = computed(() => {
  if (!form.value.content) return '<p style="color:#888">输入内容后将在此显示预览...</p>'
  return marked(form.value.content)
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
      content: article.content || '',
      category: article.category || '笔记',
      tags: article.tags || '',
      cover_url: article.cover_url || ''
    }
  } catch (error) {
    alert('获取文章信息失败')
    router.push('/')
  }
}

const previewCover = () => { showPreview.value = true }

const validateForm = () => {
  const title = form.value.title.trim()
  const content = form.value.content.trim()
  if (!title) { alert('标题不能为空'); return false }
  if (title.length > 100) { alert('标题不能超过100字'); return false }
  if (!content) { alert('正文不能为空'); return false }
  if (content.length < 10) { alert('正文内容太短，请至少输入10个字'); return false }
  return true
}

const saveArticle = async () => {
  if (!validateForm()) return
  saving.value = true
  try {
    const payload = {
      title: form.value.title.trim(),
      summary: form.value.summary.trim() || form.value.content.trim().substring(0, 100),
      content: form.value.content.trim(),
      category: form.value.category,
      tags: form.value.tags.trim(),
      cover_url: form.value.cover_url.trim()
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
    alert(error.response?.data?.error || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => { fetchArticle() })
</script>

<style scoped>
.article-edit {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.dark .article-edit { background: #16213e; }

.edit-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.dark .edit-header { border-color: #0f3460; }

.edit-header h2 { margin-top: 1rem; color: #333; }
.dark .edit-header h2 { color: #e0e0e0; }
.back-link { color: #667eea; text-decoration: none; font-weight: 500; }
.back-link:hover { text-decoration: underline; }

.edit-form { display: flex; flex-direction: column; gap: 1.5rem; }

.form-group { display: flex; flex-direction: column; gap: 0.5rem; }

.form-row { display: flex; gap: 1rem; }
.half { flex: 1; }

.form-group label { font-weight: 600; color: #444; font-size: 0.95rem; }
.dark .form-group label { color: #ccc; }
.required { color: #ff6b6b; }

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.8rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
  background: inherit;
  color: inherit;
}

.dark .form-group input,
.dark .form-group textarea,
.dark .form-group select {
  border-color: #0f3460;
  background: #0f3460;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea { resize: vertical; min-height: 100px; }

.cover-input-row { display: flex; gap: 0.5rem; }
.cover-input-row input { flex: 1; }
.btn-preview {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.cover-preview {
  margin-top: 0.5rem;
  border-radius: 8px;
  overflow: hidden;
}

.cover-preview img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
}

.char-count { text-align: right; font-size: 0.8rem; color: #999; }

/* Markdown 编辑器 */
.editor-container {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.dark .editor-container { border-color: #0f3460; }

.editor-tabs {
  display: flex;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.dark .editor-tabs { background: #0f3460; border-color: #1a1a4e; }

.editor-tabs button {
  padding: 0.6rem 1.2rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  transition: all 0.3s;
}

.dark .editor-tabs button { color: #aaa; }

.editor-tabs button.active {
  background: white;
  color: #667eea;
  font-weight: 600;
  border-bottom: 2px solid #667eea;
}

.dark .editor-tabs button.active { background: #16213e; }

.editor-body { display: flex; min-height: 400px; }

.editor-body.split .editor-pane,
.editor-body.split .preview-pane { width: 50%; }

.editor-body.edit .editor-pane { width: 100%; }
.editor-body.edit .preview-pane { display: none; }

.editor-body.preview .editor-pane { display: none; }
.editor-body.preview .preview-pane { width: 100%; }

.editor-pane { border-right: 1px solid #e0e0e0; }
.dark .editor-pane { border-color: #0f3460; }

.editor-pane textarea {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border: none;
  padding: 1rem;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  resize: none;
  outline: none;
  background: inherit;
  color: inherit;
  line-height: 1.6;
}

.preview-pane {
  padding: 1rem;
  overflow-y: auto;
  max-height: 500px;
  line-height: 1.8;
  color: #444;
}

.dark .preview-pane { color: #ccc; }

.preview-pane :deep(h1),
.preview-pane :deep(h2),
.preview-pane :deep(h3) { margin: 1rem 0 0.5rem; }

.preview-pane :deep(pre) {
  background: #1e1e1e;
  padding: 0.8rem;
  border-radius: 6px;
  overflow-x: auto;
}

.preview-pane :deep(code) { font-family: monospace; font-size: 0.85rem; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.dark .form-actions { border-color: #0f3460; }

.btn-cancel {
  padding: 0.8rem 2rem;
  border: 2px solid #ddd;
  background: inherit;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-cancel:hover { background: #f5f5f5; }
.dark .btn-cancel:hover { background: #0f3460; }

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

.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 768px) {
  .article-edit { padding: 1.5rem; }
  .form-row { flex-direction: column; }
  .editor-body { flex-direction: column; }
  .editor-body.split .editor-pane,
  .editor-body.split .preview-pane { width: 100%; height: 300px; }
  .form-actions { flex-direction: column; }
  .btn-cancel, .btn-submit { width: 100%; text-align: center; }
}
</style>
