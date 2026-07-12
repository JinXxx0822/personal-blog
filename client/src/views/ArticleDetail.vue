<template>
  <div class="article-detail">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="!article" class="error">
      <p>文章不存在或已被删除</p>
      <router-link to="/" class="back-link">← 返回首页</router-link>
    </div>

    <div v-else class="article-content">
      <div class="article-actions">
        <router-link to="/" class="back-link">← 返回首页</router-link>
        <div class="action-buttons" v-if="user">
          <router-link :to="`/edit/${article.id}`" class="btn-edit">编辑</router-link>
          <button @click="deleteArticle" class="btn-delete">删除</button>
        </div>
      </div>

      <article class="article">
        <div class="article-cover" v-if="article.cover_url">
          <img :src="article.cover_url" :alt="article.title" />
        </div>

        <header class="article-header">
          <h1>{{ article.title }}</h1>
          <div class="article-meta">
            <span class="category-tag">{{ article.category }}</span>
            <span class="publish-date">{{ formatDate(article.created_at) }}</span>
            <span v-if="article.updated_at !== article.created_at" class="update-date">
              更新于 {{ formatDate(article.updated_at) }}
            </span>
          </div>
          <div class="article-tags" v-if="article.tags">
            <span v-for="tag in tagList" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </header>

        <div class="article-body" v-html="renderedContent"></div>
      </article>

      <!-- 评论区 -->
      <div class="comments-section">
        <h3>💬 评论 ({{ comments.length }})</h3>

        <div class="comment-form" v-if="user">
          <textarea v-model="newComment" placeholder="写下你的评论..." rows="3" maxlength="500"></textarea>
          <div class="comment-form-footer">
            <span class="char-count">{{ newComment.length }}/500</span>
            <button @click="submitComment" :disabled="!newComment.trim() || submitting">发布评论</button>
          </div>
        </div>
        <div v-else class="login-hint">
          <router-link to="/login">登录</router-link> 后可以发表评论
        </div>

        <div v-if="comments.length === 0" class="no-comments">
          <p>暂无评论，来说两句吧</p>
        </div>

        <div v-else class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-card">
            <div class="comment-header">
              <span class="comment-author">👤 {{ comment.author }}</span>
              <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
            </div>
            <p class="comment-content">{{ comment.content }}</p>
          </div>
        </div>
      </div>
    </div>
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
const article = ref(null)
const loading = ref(true)
const comments = ref([])
const newComment = ref('')
const submitting = ref(false)
const user = ref(null)

const tagList = computed(() => {
  if (!article.value?.tags) return []
  return article.value.tags.split(',').map(t => t.trim()).filter(Boolean)
})

const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  return marked(article.value.content)
})

const fetchArticle = async () => {
  try {
    const response = await axios.get(`/api/articles/${route.params.id}`)
    article.value = response.data
  } catch (error) {
    article.value = null
  } finally {
    loading.value = false
  }
}

const fetchComments = async () => {
  try {
    const response = await axios.get(`/api/comments/${route.params.id}`)
    comments.value = response.data
  } catch (e) { /* ignore */ }
}

const submitComment = async () => {
  if (!newComment.value.trim()) return
  submitting.value = true
  try {
    await axios.post('/api/comments', {
      article_id: route.params.id,
      author: user.value?.nickname || '匿名',
      content: newComment.value.trim()
    })
    newComment.value = ''
    await fetchComments()
  } catch (error) {
    alert(error.response?.data?.error || '评论失败')
  } finally {
    submitting.value = false
  }
}

const deleteArticle = async () => {
  if (!confirm('确定要删除这篇文章吗？此操作不可恢复。')) return
  try {
    await axios.delete(`/api/articles/${route.params.id}`)
    router.push('/')
  } catch (error) {
    alert('删除失败')
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

onMounted(() => {
  const saved = localStorage.getItem('user')
  if (saved) try { user.value = JSON.parse(saved) } catch (e) {}
  fetchArticle()
  fetchComments()
})
</script>

<style scoped>
.article-detail { max-width: 800px; margin: 0 auto; }
.loading { text-align: center; padding: 3rem; }

.spinner {
  width: 40px; height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error { text-align: center; padding: 3rem; color: #666; }
.back-link { color: #667eea; text-decoration: none; font-weight: 500; }
.back-link:hover { text-decoration: underline; }

.article-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.dark .article-content { background: #16213e; }

.article-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.dark .article-actions { border-color: #0f3460; }

.action-buttons { display: flex; gap: 0.8rem; }

.btn-edit, .btn-delete {
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-edit { background: #667eea; color: white; }
.btn-edit:hover { background: #5a6fd6; }
.btn-delete { background: #ff6b6b; color: white; }
.btn-delete:hover { background: #ee5a5a; }

.article-cover img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.article-header { margin-bottom: 2rem; }

.article-header h1 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.dark .article-header h1 { color: #e0e0e0; }

.article-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
  flex-wrap: wrap;
}

.category-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.2rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.update-date { color: #667eea; }

.article-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.tag { background: #e8ecff; color: #667eea; padding: 0.15rem 0.6rem; border-radius: 10px; font-size: 0.8rem; }
.dark .tag { background: #1a1a4e; }

.article-body {
  line-height: 1.8;
  color: #444;
  font-size: 1.05rem;
}

.dark .article-body { color: #ccc; }

.article-body :deep(h1), .article-body :deep(h2), .article-body :deep(h3) {
  margin: 1.5rem 0 0.8rem;
  color: #333;
}

.dark .article-body :deep(h1),
.dark .article-body :deep(h2),
.dark .article-body :deep(h3) { color: #e0e0e0; }

.article-body :deep(p) { margin-bottom: 1rem; }
.article-body :deep(pre) {
  background: #1e1e1e;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1rem 0;
}
.article-body :deep(code) { font-family: 'Courier New', monospace; font-size: 0.9rem; }
.article-body :deep(blockquote) {
  border-left: 4px solid #667eea;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #666;
}
.article-body :deep(ul), .article-body :deep(ol) { padding-left: 1.5rem; margin-bottom: 1rem; }

/* 评论区 */
.comments-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #f0f0f0;
}

.dark .comments-section { border-color: #0f3460; }

.comments-section h3 { margin-bottom: 1.5rem; }

.comment-form textarea {
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

.comment-form textarea:focus { border-color: #667eea; }

.comment-form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.char-count { color: #999; font-size: 0.8rem; }

.comment-form-footer button {
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.3s;
}

.comment-form-footer button:disabled { opacity: 0.5; cursor: not-allowed; }

.login-hint { text-align: center; padding: 1.5rem; color: #888; }
.login-hint a { color: #667eea; }

.no-comments { text-align: center; padding: 2rem; color: #888; }

.comments-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; }

.comment-card {
  background: #fafafa;
  border-radius: 10px;
  padding: 1.2rem;
  border: 1px solid #eee;
}

.dark .comment-card { background: #0f3460; border-color: #1a1a4e; }

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.comment-author { font-weight: 600; color: #667eea; }
.comment-date { color: #999; font-size: 0.85rem; }
.comment-content { color: #555; line-height: 1.6; }
.dark .comment-content { color: #bbb; }

@media (max-width: 768px) {
  .article-content { padding: 1.5rem; }
  .article-header h1 { font-size: 1.5rem; }
  .article-actions { flex-direction: column; gap: 1rem; align-items: flex-start; }
}
</style>
