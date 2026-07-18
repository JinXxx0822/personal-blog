<template>
  <div class="article-edit">
    <div class="edit-top">
      <router-link to="/" class="top-back">← 返回</router-link>
      <h2>{{ isEdit ? '编辑文章' : '写文章' }}</h2>
    </div>

    <form @submit.prevent="saveArticle" class="edit-form">
      <!-- 标题 -->
      <div class="form-group">
        <label for="title">
          标题 <span class="required">*</span>
        </label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          placeholder="给你的文章起个吸引人的标题..."
          maxlength="100"
          required
          autocomplete="off"
        />
        <span class="input-hint">已输入 {{ form.title.length }} / 100 个字</span>
      </div>

      <!-- 分类 + 标签 -->
      <div class="form-row-split">
        <div class="form-group flex-1">
          <label for="category">分类</label>
          <select id="category" v-model="form.category">
            <option value="笔记">📝 笔记</option>
            <option value="技术">💻 技术</option>
            <option value="生活">🌟 生活</option>
            <option value="随笔">✍️ 随笔</option>
          </select>
        </div>
        <div class="form-group flex-1">
          <label for="tags">标签</label>
          <input
            id="tags"
            v-model="form.tags"
            type="text"
            placeholder="逗号分隔，如: Vue, JavaScript"
          />
        </div>
      </div>

      <!-- 置顶 + 封面 -->
      <div class="form-row-split">
        <div class="form-group pin-group">
          <label class="pin-label">
            <span class="pin-checkbox-wrap">
              <input type="checkbox" v-model="form.is_pinned" />
              <span class="pin-check"></span>
            </span>
            置顶文章
          </label>
        </div>
        <div class="form-group flex-1">
          <label for="cover_url">封面图片 URL</label>
          <div class="cover-row">
            <input
              id="cover_url"
              v-model="form.cover_url"
              type="text"
              placeholder="输入图片链接..."
            />
            <button type="button" class="cover-preview-btn" v-if="form.cover_url" @click="showPreview = !showPreview">
              {{ showPreview ? '隐藏预览' : '预览' }}
            </button>
          </div>
          <Transition name="slide">
            <div class="cover-preview-img" v-if="showPreview && form.cover_url">
              <img :src="form.cover_url" alt="封面预览" @error="showPreview = false" />
            </div>
          </Transition>
        </div>
      </div>

      <!-- 摘要 -->
      <div class="form-group">
        <label for="summary">摘要</label>
        <textarea
          id="summary"
          v-model="form.summary"
          placeholder="可选，不填则自动截取正文的前100个字"
          rows="2"
          maxlength="200"
        ></textarea>
        <span class="input-hint">{{ form.summary.length }} / 200</span>
      </div>

      <!-- Markdown 编辑器 -->
      <div class="form-group">
        <label for="content">
          正文 <span class="required">*</span>
          <span class="label-tip">支持 Markdown 语法</span>
        </label>
        <div class="editor-container">
          <div class="editor-tabs">
            <button
              type="button"
              :class="{ active: editorMode === 'edit' }"
              @click="editorMode = 'edit'"
            >✏️ 编辑</button>
            <button
              type="button"
              :class="{ active: editorMode === 'preview' }"
              @click="editorMode = 'preview'"
            >👁 预览</button>
            <button
              type="button"
              :class="{ active: editorMode === 'split' }"
              @click="editorMode = 'split'"
            >📐 分屏</button>
          </div>
          <div class="editor-body" :class="editorMode">
            <div class="editor-pane" v-show="editorMode !== 'preview'">
              <textarea
                id="content"
                v-model="form.content"
                placeholder="# 开始写你的故事...

支持 Markdown 语法：
- **粗体** 和 *斜体*
- [链接](https://example.com)
- `行内代码`
- > 引用文字

---
```javascript
// 代码块
console.log('Hello World')
```"
                required
              ></textarea>
            </div>
            <div class="preview-pane" v-show="editorMode !== 'edit'">
              <div v-if="form.content" v-html="renderedPreview"></div>
              <div v-else class="preview-empty">输入内容后将在此处显示预览效果</div>
            </div>
          </div>
        </div>
        <span class="input-hint">已输入 {{ form.content.length }} 字</span>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <router-link to="/" class="btn-cancel">取消</router-link>
        <button type="submit" class="btn-submit" :disabled="saving">
          <span v-if="saving" class="spinner-inline"></span>
          {{ saving ? '保存中...' : (isEdit ? '更新文章' : '发布文章') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
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
const toast = inject('toast', null)

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
  cover_url: '',
  is_pinned: false
})

const renderedPreview = computed(() => {
  if (!form.value.content) return ''
  return marked(form.value.content)
})

const fetchArticle = async () => {
  if (!route.params.id) return
  isEdit.value = true
  try {
    const res = await axios.get(`/api/articles/${route.params.id}`)
    const article = res.data
    form.value = {
      title: article.title || '',
      summary: article.summary || '',
      content: article.content || '',
      category: article.category || '笔记',
      tags: article.tags || '',
      cover_url: article.cover_url || '',
      is_pinned: !!article.is_pinned
    }
  } catch (e) {
    toast?.error('获取文章信息失败')
    router.push('/')
  }
}

const validateForm = () => {
  const title = form.value.title.trim()
  const content = form.value.content.trim()
  if (!title) { toast?.warning('标题不能为空'); return false }
  if (title.length > 100) { toast?.warning('标题不能超过100字'); return false }
  if (!content) { toast?.warning('正文不能为空'); return false }
  if (content.length < 10) { toast?.warning('正文内容太短，请至少输入10个字'); return false }
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
      cover_url: form.value.cover_url.trim(),
      is_pinned: form.value.is_pinned
    }

    if (isEdit.value) {
      await axios.put(`/api/articles/${route.params.id}`, payload)
      toast?.success('文章更新成功！')
    } else {
      await axios.post('/api/articles', payload)
      toast?.success('文章发布成功！')
    }
    router.push('/')
  } catch (e) {
    toast?.error(e.response?.data?.error || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => fetchArticle())
</script>

<style scoped>
.article-edit {
  max-width: 860px;
  margin: 0 auto;
}

.edit-top {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.top-back {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  transition: color var(--transition-fast);
}

.top-back:hover { color: var(--primary); }

.edit-top h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

/* ===== 表单 ===== */
.edit-form {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
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
  font-size: 0.95rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.required { color: var(--danger); }

.label-tip {
  font-size: 0.78rem;
  color: var(--text-tertiary);
  font-weight: 400;
}

.input-hint {
  font-size: 0.78rem;
  color: var(--text-tertiary);
  text-align: right;
}

.form-group input[type="text"],
.form-group textarea,
.form-group select {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-family: inherit;
  background: var(--bg-input);
  color: var(--text-primary);
  outline: none;
  transition: all var(--transition-fast);
}

.form-group input[type="text"]:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 70px;
}

.form-group select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}

.form-row-split {
  display: flex;
  gap: 1rem;
}

.flex-1 { flex: 1; }

/* 置顶 */
.pin-group { justify-content: center; }

.pin-label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  font-weight: 600;
  color: var(--text-primary);
  user-select: none;
  padding: 0.5rem 1rem;
  border: 2px dashed var(--border);
  border-radius: var(--radius-sm);
  width: fit-content;
  transition: all var(--transition-fast);
}

.pin-label:has(input:checked) {
  border-color: var(--primary);
  background: var(--bg-tag);
}

.pin-checkbox-wrap {
  position: relative;
  width: 20px;
  height: 20px;
}

.pin-checkbox-wrap input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

.pin-check {
  display: block;
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-radius: 4px;
  transition: all var(--transition-fast);
}

.pin-checkbox-wrap input:checked + .pin-check {
  background: var(--primary);
  border-color: var(--primary);
}

.pin-checkbox-wrap input:checked + .pin-check::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* 封面 */
.cover-row {
  display: flex;
  gap: 0.5rem;
}

.cover-row input { flex: 1; }

.cover-preview-btn {
  padding: 0.5rem 1rem;
  background: var(--bg-tag);
  color: var(--primary);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.85rem;
  font-family: inherit;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.cover-preview-btn:hover { background: var(--primary); color: white; }

.cover-preview-img {
  margin-top: 0.5rem;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.cover-preview-img img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
}

/* 编辑器 */
.editor-container {
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.editor-container:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.editor-tabs {
  display: flex;
  background: var(--bg-input);
  border-bottom: 1px solid var(--border);
}

.editor-tabs button {
  padding: 0.55rem 1.2rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-secondary);
  font-family: inherit;
  transition: all var(--transition-fast);
  position: relative;
}

.editor-tabs button.active {
  color: var(--primary);
  font-weight: 600;
}

.editor-tabs button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0.6rem;
  right: 0.6rem;
  height: 2px;
  background: var(--primary);
  border-radius: 1px;
}

.editor-body {
  display: flex;
  min-height: 420px;
}

.editor-body.split .editor-pane,
.editor-body.split .preview-pane {
  width: 50%;
}

.editor-body.edit .editor-pane { width: 100%; }
.editor-body.edit .preview-pane { display: none; }
.editor-body.preview .editor-pane { display: none; }
.editor-body.preview .preview-pane { width: 100%; }

.editor-pane {
  border-right: 1px solid var(--border);
}

.editor-body.split .editor-pane { border-right: 1px solid var(--border); }
.editor-body.preview .editor-pane { border-right: none; }

.editor-pane textarea {
  width: 100%;
  height: 100%;
  min-height: 420px;
  border: none;
  padding: 1rem;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  line-height: 1.7;
  resize: none;
  outline: none;
  background: var(--bg-card) !important;
  color: var(--text-primary);
  tab-size: 2;
}

.preview-pane {
  padding: 1.2rem;
  overflow-y: auto;
  max-height: 520px;
  line-height: 1.8;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.preview-empty {
  color: var(--text-tertiary);
  text-align: center;
  padding-top: 5rem;
}

.preview-pane :deep(h1),
.preview-pane :deep(h2),
.preview-pane :deep(h3) { margin: 1rem 0 0.6rem; }

.preview-pane :deep(pre) {
  background: #1e1e2e;
  padding: 0.8rem;
  border-radius: 6px;
  overflow-x: auto;
}

.preview-pane :deep(code) { font-family: var(--font-mono); font-size: 0.85rem; }

.preview-pane :deep(blockquote) {
  border-left: 3px solid var(--primary);
  padding-left: 0.8rem;
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

/* 操作按钮 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
}

.btn-cancel {
  padding: 0.7rem 2rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.95rem;
  font-family: inherit;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all var(--transition-fast);
}

.btn-cancel:hover {
  background: var(--bg-input);
  border-color: var(--text-tertiary);
}

.btn-submit {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.7rem 2.5rem;
  border: none;
  background: var(--gradient);
  color: white;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  transition: all var(--transition);
  box-shadow: var(--shadow-sm);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-inline {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* 过渡 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}
.slide-enter-to,
.slide-leave-from {
  max-height: 300px;
}

/* 响应式 */
@media (max-width: 768px) {
  .edit-form { padding: 1.5rem; }
  .form-row-split { flex-direction: column; }
  .editor-body { flex-direction: column; }
  .editor-body.split .editor-pane,
  .editor-body.split .preview-pane { width: 100%; height: 300px; }
  .form-actions { flex-direction: column-reverse; }
  .btn-cancel, .btn-submit { width: 100%; text-align: center; justify-content: center; }
  .pin-label { width: 100%; justify-content: center; }
}
</style>
