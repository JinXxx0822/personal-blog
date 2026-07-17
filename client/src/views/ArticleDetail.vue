<template>
  <div class="article-detail">
    <!-- 骨架屏 -->
    <template v-if="pageLoading">
      <div class="detail-layout skel-layout">
        <aside class="toc-sidebar">
          <div class="skeleton-card" style="height: 200px"></div>
        </aside>
        <div class="article-main" style="flex: 1">
          <div class="skeleton-card" style="height: 60px; margin-bottom: 1.5rem"></div>
          <div class="skeleton-card" style="height: 350px; margin-bottom: 1.5rem"></div>
          <div class="skeleton-card" style="height: 200px"></div>
        </div>
      </div>
    </template>

    <template v-else-if="!article">
      <div class="error">
        <p>文章不存在或已被删除</p>
        <router-link to="/" class="back-link">← 返回首页</router-link>
      </div>
    </template>

    <div v-else class="detail-layout">
      <!-- 左侧目录导航 -->
      <aside class="toc-sidebar" v-if="toc.length > 0">
        <div class="toc-sticky">
          <h4>📑 目录</h4>
          <nav class="toc-nav">
            <a v-for="(item, i) in toc" :key="i" 
              :class="'toc-' + item.level" 
              :href="'#' + item.id"
              @click.prevent="scrollTo(item.id)"
            >{{ item.text }}</a>
          </nav>
          <div class="article-toolbar">
            <button @click="toggleLike" class="tool-btn" :class="{ liked: liked }">
              {{ liked ? '❤️' : '🤍' }} {{ article.likes || 0 }}
            </button>
            <button @click="toggleFavorite" class="tool-btn" :class="{ favorited: favorited }">
              {{ favorited ? '⭐' : '☆' }} 收藏
            </button>
            <button @click="shareArticle" class="tool-btn" title="复制链接">
              📤 分享
            </button>
          </div>
        </div>
      </aside>

      <!-- 主内容区 -->
      <div class="article-main">
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
            <div class="article-stats">
              <span>👁 {{ article.views || 0 }} 阅读</span>
              <span>❤️ {{ article.likes || 0 }} 点赞</span>
            </div>
          </header>

          <div class="article-body" ref="articleBody" v-html="renderedContent"></div>
        </article>

        <!-- 相关文章推荐 -->
        <div class="related-section" v-if="relatedArticles.length > 0">
          <h3>📖 相关推荐</h3>
          <div class="related-grid">
            <div v-for="ra in relatedArticles" :key="ra.id" class="related-card" @click="goToArticle(ra.id)">
              <div class="related-cover" v-if="ra.cover_url">
                <img :src="ra.cover_url" :alt="ra.title" />
              </div>
              <div class="related-info">
                <h5>{{ ra.title }}</h5>
                <span class="related-cat">{{ ra.category }}</span>
                <div class="related-meta">
                  <span>👁 {{ ra.views }}</span>
                  <span>❤️ {{ ra.likes }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, inject } from 'vue'
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

const article = ref(null)
const loading = ref(true)
const pageLoading = ref(true)
const comments = ref([])
const newComment = ref('')
const submitting = ref(false)
const user = ref(null)
const liked = ref(false)
const favorited = ref(false)
const toc = ref([])
const articleBody = ref(null)
const relatedArticles = ref([])

const tagList = computed(() => {
  if (!article.value?.tags) return []
  return article.value.tags.split(',').map(t => t.trim()).filter(Boolean)
})

const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  return marked(article.value.content)
})

// 提取目录
const extractToc = () => {
  if (!article.value?.content) return
  const headings = article.value.content.match(/^#{1,3}\s+.+$/gm)
  if (!headings) return
  toc.value = headings.map(h => {
    const level = h.match(/^(#{1,3})/)[1].length
    const text = h.replace(/^#{1,3}\s+/, '')
    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fff-]/g, '')
    return { level, text, id }
  })
}

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const toggleLike = async () => {
  if (!article.value) return
  try {
    const payload = user.value ? { user_id: user.value.id } : {}
    const res = await axios.post(`/api/articles/${article.value.id}/like`, payload)
    if (res.data.action === 'liked') {
      article.value.likes = (article.value.likes || 0) + 1
      liked.value = true
      if (toast) toast.success('点赞成功')
    } else if (res.data.action === 'unliked') {
      article.value.likes = Math.max(0, (article.value.likes || 0) - 1)
      liked.value = false
      if (toast) toast.info('已取消点赞')
    }
  } catch (e) {
    if (toast) toast.error('操作失败')
  }
}

const toggleFavorite = async () => {
  if (!user.value || !article.value) {
    if (toast) toast.warning('请先登录')
    else alert('请先登录')
    return
  }
  try {
    if (favorited.value) {
      await axios.delete(`/api/articles/${article.value.id}/favorite/${user.value.id}`)
      favorited.value = false
      if (toast) toast.info('已取消收藏')
    } else {
      await axios.post(`/api/articles/${article.value.id}/favorite`, { user_id: user.value.id })
      favorited.value = true
      if (toast) toast.success('收藏成功')
    }
  } catch (e) {
    if (toast) toast.error('操作失败')
  }
}

const shareArticle = () => {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    if (toast) toast.success('链接已复制到剪贴板！')
    else alert('链接已复制到剪贴板！')
  }).catch(() => {
    prompt('复制以下链接分享：', url)
  })
}

const fetchArticle = async () => {
  try {
    const response = await axios.get(`/api/articles/${route.params.id}`)
    article.value = response.data
    await nextTick()
    extractToc()
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

const fetchRelatedArticles = async () => {
  try {
    const res = await axios.get(`/api/articles/related/${route.params.id}`)
    relatedArticles.value = res.data
  } catch (e) { /* ignore */ }
}

const checkFavorite = async () => {
  if (!user.value) return
  try {
    const res = await axios.get(`/api/articles/${route.params.id}/favorite/${user.value.id}`)
    favorited.value = res.data.favorited
  } catch (e) { /* ignore */ }
}

const checkLikeStatus = async () => {
  if (!user.value) return
  try {
    const res = await axios.get(`/api/articles/${route.params.id}/like/${user.value.id}`)
    liked.value = res.data.liked
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
    if (toast) toast.success('评论发布成功')
  } catch (error) {
    if (toast) toast.error(error.response?.data?.error || '评论失败')
    else alert(error.response?.data?.error || '评论失败')
  } finally {
    submitting.value = false
  }
}

const deleteArticle = async () => {
  if (!confirm('确定要删除这篇文章吗？此操作不可恢复。')) return
  try {
    await axios.delete(`/api/articles/${route.params.id}`)
    if (toast) toast.success('文章已删除')
    router.push('/')
  } catch (error) {
    if (toast) toast.error('删除失败')
    else alert('删除失败')
  }
}

const goToArticle = (id) => {
  router.push(`/article/${id}`)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

onMounted(async () => {
  const saved = localStorage.getItem('user')
  if (saved) try { user.value = JSON.parse(saved) } catch (e) {}
  
  await Promise.all([
    fetchArticle(),
    fetchComments(),
    fetchRelatedArticles()
  ])
  
  checkFavorite()
  checkLikeStatus()
  pageLoading.value = false
})
</script>

<style scoped>
.article-detail { max-width: 100%; }

/* 骨架屏 */
.skel-layout { display: flex; gap: 2rem; }
.skel-layout .toc-sidebar { width: 220px; min-width: 220px; }
.skeleton-card {
  background: #e8e8e8;
  border-radius: 12px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
.dark .skeleton-card {
  background: #1a1a4e;
}
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

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

.detail-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

/* 目录侧边栏 */
.toc-sidebar {
  width: 220px;
  min-width: 220px;
}

.toc-sticky {
  position: sticky;
  top: 80px;
  background: white;
  border-radius: 12px;
  padding: 1.2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.dark .toc-sticky {
  background: #16213e;
}

.toc-sticky h4 {
  font-size: 1rem;
  margin-bottom: 0.8rem;
  color: #667eea;
}

.toc-nav {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.toc-nav a {
  color: #666;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.3s;
  display: block;
  padding: 0.2rem 0;
}

.toc-nav a:hover {
  color: #667eea;
}

.toc-nav .toc-1 { font-weight: 600; }
.toc-nav .toc-2 { padding-left: 0.8rem; }
.toc-nav .toc-3 { padding-left: 1.6rem; font-size: 0.8rem; }

.dark .toc-nav a { color: #aaa; }

/* 工具栏 */
.article-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.dark .article-toolbar { border-color: #0f3460; }

.tool-btn {
  background: none;
  border: 1px solid #e0e0e0;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  color: inherit;
  transition: all 0.3s;
  text-align: center;
}

.tool-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.tool-btn.liked {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.tool-btn.favorited {
  border-color: #f0a500;
  color: #f0a500;
}

/* 主内容 */
.article-main {
  flex: 1;
  min-width: 0;
}

.article {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.dark .article { background: #16213e; }

.article-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.dark .article-actions { background: #16213e; }

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

.article-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.8rem; }
.tag { background: #e8ecff; color: #667eea; padding: 0.15rem 0.6rem; border-radius: 10px; font-size: 0.8rem; }
.dark .tag { background: #1a1a4e; }

.article-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #999;
}

.article-body {
  line-height: 1.8;
  color: #444;
  font-size: 1.05rem;
}

.dark .article-body { color: #ccc; }

.article-body :deep(h1), .article-body :deep(h2), .article-body :deep(h3) {
  margin: 1.5rem 0 0.8rem;
  color: #333;
  scroll-margin-top: 80px;
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

/* 相关文章 */
.related-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-top: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.dark .related-section { background: #16213e; }

.related-section h3 {
  margin-bottom: 1.2rem;
  font-size: 1.2rem;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.related-card {
  background: #fafafa;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #eee;
  transition: all 0.3s;
}

.dark .related-card { background: #0f3460; border-color: #1a1a4e; }

.related-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  border-color: #667eea;
}

.related-cover img {
  width: 100%;
  height: 130px;
  object-fit: cover;
}

.related-info {
  padding: 0.8rem;
}

.related-info h5 {
  font-size: 0.95rem;
  margin-bottom: 0.4rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-cat {
  display: inline-block;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.1rem 0.5rem;
  border-radius: 8px;
  font-size: 0.7rem;
  margin-bottom: 0.4rem;
}

.related-meta {
  display: flex;
  gap: 0.8rem;
  font-size: 0.8rem;
  color: #999;
}

/* 评论区 */
.comments-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-top: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.dark .comments-section { background: #16213e; }

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

@media (max-width: 900px) {
  .detail-layout {
    flex-direction: column;
  }
  .toc-sidebar {
    width: 100%;
    min-width: 100%;
    order: -1;
  }
  .toc-sticky {
    position: static;
  }
  .toc-nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .toc-nav a {
    background: #f0f0f0;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    font-size: 0.8rem;
  }
  .dark .toc-nav a { background: #0f3460; }
  .toc-nav .toc-2, .toc-nav .toc-3 { padding-left: 0.3rem; }
  .article-toolbar {
    flex-direction: row;
  }
  .article { padding: 1.5rem; }
  .article-header h1 { font-size: 1.5rem; }
  .related-grid {
    grid-template-columns: 1fr;
  }
  .skel-layout { flex-direction: column; }
  .skel-layout .toc-sidebar { width: 100%; min-width: 100%; }
}
</style>
