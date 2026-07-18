<template>
  <div class="article-detail">
    <!-- 骨架屏 -->
    <template v-if="pageLoading">
      <div class="detail-layout skel-layout">
        <aside class="toc-sidebar">
          <div class="skeleton-card" style="height: 220px"></div>
        </aside>
        <div class="article-main" style="flex:1">
          <div class="skeleton-card" style="height: 50px; margin-bottom:1.5rem"></div>
          <div class="skeleton-card" style="height: 400px; margin-bottom:1.5rem"></div>
          <div class="skeleton-card" style="height: 180px"></div>
        </div>
      </div>
    </template>

    <!-- 404 -->
    <template v-else-if="!article">
      <div class="error-state">
        <div class="error-icon">📄</div>
        <h2>文章不存在</h2>
        <p>该文章可能已被删除或链接无效</p>
        <router-link to="/" class="btn-back">← 返回首页</router-link>
      </div>
    </template>

    <!-- 正常内容 -->
    <div v-else class="detail-layout">
      <!-- 左侧 TOC -->
      <aside class="toc-sidebar" :class="{ hidden: toc.length === 0 && !showSidebarTools }">
        <div class="toc-sticky">
          <!-- 文章目录 -->
          <div v-if="toc.length > 0" class="toc-section">
            <h4 class="toc-title">📑 目录</h4>
            <nav class="toc-nav">
              <a
                v-for="(item, i) in toc"
                :key="i"
                :class="['toc-link', `level-${item.level}`, { active: activeTocId === item.id }]"
                :href="'#' + item.id"
                @click.prevent="scrollToHeading(item.id)"
              >{{ item.text }}</a>
            </nav>
          </div>

          <!-- 工具栏 -->
          <div class="article-toolbar" :class="{ 'no-toc': toc.length === 0 }">
            <button @click="toggleLike" class="tool-btn" :class="{ liked }">
              <span class="tool-icon">{{ liked ? '❤️' : '🤍' }}</span>
              <span class="tool-text">{{ article.likes || 0 }}</span>
            </button>
            <button @click="toggleFavorite" class="tool-btn" :class="{ favorited }">
              <span class="tool-icon">{{ favorited ? '⭐' : '☆' }}</span>
              <span class="tool-text">收藏</span>
            </button>
            <button @click="shareArticle" class="tool-btn">
              <span class="tool-icon">📤</span>
              <span class="tool-text">分享</span>
            </button>
          </div>

          <!-- 回到顶部（侧边栏内） -->
          <button class="toc-back-top" @click="scrollToTop">
            ↑ 回到顶部
          </button>
        </div>
      </aside>

      <!-- 主内容 -->
      <div class="article-main">
        <!-- 操作栏 -->
        <div class="top-bar">
          <router-link to="/" class="top-back">← 返回首页</router-link>
          <div class="top-actions" v-if="user">
            <router-link :to="`/edit/${article.id}`" class="btn-action edit">✏️ 编辑</router-link>
            <button @click="deleteArticle" class="btn-action del">🗑 删除</button>
          </div>
        </div>

        <!-- 置顶标识 -->
        <div class="pin-banner" v-if="article.is_pinned">
          📌 本文已置顶
        </div>

        <!-- 文章主体 -->
        <article class="article">
          <!-- 封面图 -->
          <div class="article-cover" v-if="article.cover_url">
            <img :src="article.cover_url" :alt="article.title" />
          </div>

          <!-- 标题区 -->
          <header class="article-header">
            <div class="ah-category">
              <span class="category-badge">{{ article.category }}</span>
            </div>
            <h1>{{ article.title }}</h1>
            <div class="ah-meta">
              <span class="ah-date">📅 {{ formatDate(article.created_at) }}</span>
              <span v-if="article.updated_at !== article.created_at" class="ah-updated">
                🔄 更新于 {{ formatDate(article.updated_at) }}
              </span>
            </div>
            <div class="ah-tags" v-if="parseTags(article.tags).length">
              <span v-for="tag in parseTags(article.tags)" :key="tag" class="ah-tag"># {{ tag }}</span>
            </div>
            <div class="ah-stats">
              <span>👁 {{ article.views || 0 }} 次阅读</span>
              <span class="ah-divider">·</span>
              <span>❤️ {{ article.likes || 0 }} 次点赞</span>
              <span class="ah-divider">·</span>
              <span>📝 {{ wordCount }} 字</span>
              <span class="ah-divider">·</span>
              <span>⏱ 阅读约 {{ readingTime }} 分钟</span>
            </div>
          </header>

          <!-- 正文 -->
          <div class="article-body" ref="articleBody" v-html="renderedContent"></div>

          <!-- 版权声明 -->
          <div class="copyright-box">
            <div class="copyright-icon">©</div>
            <div class="copyright-text">
              <p>本文由 <strong>{{ user?.nickname || '博主' }}</strong> 原创发布于 个人博客。</p>
              <p>转载请注明出处：<a :href="shareUrl">{{ shareUrl }}</a></p>
            </div>
          </div>
        </article>

        <!-- 上一篇/下一篇 -->
        <div class="nav-articles" v-if="prevArticle || nextArticle">
          <div class="nav-item prev" v-if="prevArticle" @click="goToArticle(prevArticle.id)">
            <span class="nav-label">← 上一篇</span>
            <span class="nav-title">{{ prevArticle.title }}</span>
          </div>
          <div class="nav-spacer" v-if="prevArticle && nextArticle"></div>
          <div class="nav-item next" v-if="nextArticle" @click="goToArticle(nextArticle.id)">
            <span class="nav-label">下一篇 →</span>
            <span class="nav-title">{{ nextArticle.title }}</span>
          </div>
        </div>

        <!-- 相关文章 -->
        <div class="related-section" v-if="relatedArticles.length">
          <div class="section-header">
            <h3>📖 相关推荐</h3>
          </div>
          <div class="related-grid">
            <div v-for="ra in relatedArticles" :key="ra.id" class="related-card" @click="goToArticle(ra.id)">
              <div class="rc-cover" v-if="ra.cover_url">
                <img :src="ra.cover_url" :alt="ra.title" loading="lazy" />
              </div>
              <div class="rc-info">
                <h5>{{ ra.title }}</h5>
                <div class="rc-meta">
                  <span class="rc-cat">{{ ra.category }}</span>
                  <span>👁 {{ ra.views || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="comments-section">
          <div class="section-header">
            <h3>💬 评论 ({{ totalComments }})</h3>
          </div>

          <!-- 评论表单 -->
          <div v-if="user" class="comment-form">
            <div class="comment-form-avatar">👤</div>
            <div class="comment-form-body">
              <div class="reply-hint" v-if="replyTarget">
                <span>回复 <strong>@{{ replyTarget.author }}</strong></span>
                <button class="cancel-reply" @click="cancelReply">取消</button>
              </div>
              <textarea
                v-model="newComment"
                :placeholder="replyTarget ? `回复 @${replyTarget.author}...` : '写下你的评论...'"
                rows="3"
                maxlength="500"
              ></textarea>
              <div class="comment-form-footer">
                <span class="char-count">{{ newComment.length }}/500</span>
                <button @click="submitComment" :disabled="!newComment.trim() || submitting">
                  {{ submitting ? '发布中...' : '发布评论' }}
                </button>
              </div>
            </div>
          </div>
          <div v-else class="login-hint">
            <router-link to="/login">🔑 登录</router-link> 后可以发表评论
          </div>

          <!-- 评论列表 -->
          <div v-if="flatComments.length === 0 && !loading" class="no-comments">
            <p>💭 暂无评论，来说两句吧</p>
          </div>

          <div v-else class="comments-list">
            <div v-for="comment in flatComments" :key="comment.id">
              <div class="comment-card" :class="{ 'is-reply': comment._isReply }">
                <div class="comment-avatar">👤</div>
                <div class="comment-body">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.author }}</span>
                    <div class="comment-header-right">
                      <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                      <button v-if="user" class="btn-reply" @click="setReplyTarget(comment)">
                        💬 回复
                      </button>
                      <button v-if="user" class="btn-del-comment" @click="deleteComment(comment.id)" title="删除">
                        🗑
                      </button>
                    </div>
                  </div>
                  <p class="comment-content" v-if="comment._isReply && comment._replyTo">
                    <span class="reply-to">@{{ comment._replyTo }}</span> {{ comment.content }}
                  </p>
                  <p class="comment-content" v-else>{{ comment.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端悬浮操作栏 -->
    <div class="mobile-toolbar" v-if="!pageLoading && article">
      <button @click="toggleLike" :class="{ liked }">
        {{ liked ? '❤️' : '🤍' }} {{ article.likes || 0 }}
      </button>
      <button @click="toggleFavorite" :class="{ favorited }">
        {{ favorited ? '⭐' : '☆' }}
      </button>
      <button @click="shareArticle">📤</button>
      <button @click="scrollToTop">↑</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'
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
const prevArticle = ref(null)
const nextArticle = ref(null)
const replyTarget = ref(null)
const activeTocId = ref('')
const showSidebarTools = ref(true)

const shareUrl = computed(() => window.location.href)

const parseTags = (tags) => {
  if (!tags) return []
  return tags.split(',').map(t => t.trim()).filter(Boolean)
}

const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  let html = marked(article.value.content)
  // 为标题添加 id
  toc.value.forEach(item => {
    html = html.replace(
      new RegExp(`<h${item.level}>${item.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</h${item.level}>`, 'i'),
      `<h${item.level} id="${item.id}">${item.text}</h${item.level}>`
    )
  })
  return html
})

const wordCount = computed(() => {
  if (!article.value?.content) return 0
  return article.value.content.replace(/[#*`~\-_>\[\]()!|\s]/g, '').length
})

const readingTime = computed(() => Math.max(1, Math.ceil(wordCount.value / 300)))

const flatComments = computed(() => {
  const result = []
  function flatten(list, depth = 0, parentAuthor = null) {
    list.forEach(c => {
      result.push({
        ...c,
        _isReply: depth > 0,
        _replyTo: parentAuthor
      })
      if (c.replies?.length) {
        flatten(c.replies, depth + 1, c.author)
      }
    })
  }
  flatten(comments.value)
  return result
})

const totalComments = computed(() => flatComments.value.length)

// 提取目录
const extractToc = () => {
  if (!article.value?.content) return
  const headings = article.value.content.match(/^#{1,3}\s+.+$/gm)
  if (!headings) return
  toc.value = headings.map(h => {
    const level = h.match(/^(#{1,3})/)[1].length
    const text = h.replace(/^#{1,3}\s+/, '')
    const id = 'heading-' + text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '')
    return { level, text, id }
  })
}

// 目录滚动高亮
const updateActiveToc = () => {
  if (toc.value.length === 0) return
  let activeId = toc.value[0].id
  for (const item of toc.value) {
    const el = document.getElementById(item.id)
    if (el && el.getBoundingClientRect().top <= 120) {
      activeId = item.id
    }
  }
  activeTocId.value = activeId
}

const scrollToHeading = (id) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 点赞 / 取消点赞
const toggleLike = async () => {
  if (!article.value) return
  try {
    const payload = user.value ? { user_id: user.value.id } : {}
    const res = await api.post(`/api/articles/${article.value.id}/like`, payload)
    if (res.data.action === 'liked') {
      article.value.likes = (article.value.likes || 0) + 1
      liked.value = true
      toast?.success('点赞成功')
    } else if (res.data.action === 'unliked') {
      article.value.likes = Math.max(0, (article.value.likes || 0) - 1)
      liked.value = false
      toast?.info('已取消点赞')
    }
  } catch (e) {
    toast?.error('操作失败')
  }
}

// 收藏 / 取消收藏
const toggleFavorite = async () => {
  if (!user.value) {
    toast?.warning('请先登录')
    return
  }
  try {
    if (favorited.value) {
      await api.delete(`/api/articles/${article.value.id}/favorite/${user.value.id}`)
      favorited.value = false
      toast?.info('已取消收藏')
    } else {
      await api.post(`/api/articles/${article.value.id}/favorite`, { user_id: user.value.id })
      favorited.value = true
      toast?.success('收藏成功')
    }
  } catch (e) {
    toast?.error('操作失败')
  }
}

// 分享
const shareArticle = () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    toast?.success('链接已复制！')
  }).catch(() => {
    prompt('复制以下链接分享：', window.location.href)
  })
}

// 回复
const setReplyTarget = (comment) => {
  replyTarget.value = comment
  newComment.value = ''
}

const cancelReply = () => {
  replyTarget.value = null
  newComment.value = ''
}

// 数据请求
const fetchArticle = async () => {
  try {
    const res = await api.get(`/api/articles/${route.params.id}`)
    article.value = res.data
    await nextTick()
    extractToc()
    document.title = `${article.value.title} - 个人博客`
  } catch (error) {
    article.value = null
  } finally {
    loading.value = false
  }
}

const fetchComments = async () => {
  try {
    const res = await api.get(`/api/comments/${route.params.id}`)
    comments.value = res.data
  } catch (e) { /* ignore */ }
}

const fetchRelatedArticles = async () => {
  try {
    const res = await api.get(`/api/articles/related/${route.params.id}`)
    relatedArticles.value = res.data
  } catch (e) { /* ignore */ }
}

const fetchNavArticles = async () => {
  try {
    const res = await api.get(`/api/articles/${route.params.id}/nav`)
    prevArticle.value = res.data.prev
    nextArticle.value = res.data.next
  } catch (e) { /* ignore */ }
}

const checkFavorite = async () => {
  if (!user.value) return
  try {
    const res = await api.get(`/api/articles/${route.params.id}/favorite/${user.value.id}`)
    favorited.value = res.data.favorited
  } catch (e) { /* ignore */ }
}

const checkLikeStatus = async () => {
  if (!user.value) return
  try {
    const res = await api.get(`/api/articles/${route.params.id}/like/${user.value.id}`)
    liked.value = res.data.liked
  } catch (e) { /* ignore */ }
}

// 提交评论
const submitComment = async () => {
  if (!newComment.value.trim()) return
  submitting.value = true
  try {
    await api.post('/api/comments', {
      article_id: route.params.id,
      author: user.value?.nickname || '匿名',
      content: newComment.value.trim(),
      parent_id: replyTarget.value?.id || null
    })
    newComment.value = ''
    replyTarget.value = null
    await fetchComments()
    toast?.success(replyTarget.value ? '回复成功' : '评论发布成功')
  } catch (e) {
    toast?.error(e.response?.data?.error || '评论失败')
  } finally {
    submitting.value = false
  }
}

// 删除评论
const deleteComment = async (commentId) => {
  if (!confirm('确定要删除这条评论吗？')) return
  try {
    await api.delete(`/api/comments/${commentId}`)
    await fetchComments()
    toast?.success('评论已删除')
  } catch (e) {
    toast?.error('删除失败')
  }
}

// 删除文章
const deleteArticle = async () => {
  if (!confirm('确定要删除这篇文章吗？此操作不可恢复。')) return
  try {
    await api.delete(`/api/articles/${route.params.id}`)
    toast?.success('文章已删除')
    router.push('/')
  } catch (e) {
    toast?.error('删除失败')
  }
}

const goToArticle = (id) => {
  router.push(`/article/${id}`)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

// 生命周期
onMounted(async () => {
  const saved = localStorage.getItem('user')
  if (saved) try { user.value = JSON.parse(saved) } catch (e) {}

  await Promise.all([
    fetchArticle(),
    fetchComments(),
    fetchRelatedArticles(),
    fetchNavArticles(),
  ])

  checkFavorite()
  checkLikeStatus()
  pageLoading.value = false

  window.addEventListener('scroll', updateActiveToc, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveToc)
})
</script>

<style scoped>
.article-detail {
  max-width: 100%;
  position: relative;
}

/* ===== 骨架屏 ===== */
.skel-layout { display: flex; gap: 2rem; }
.skel-layout .toc-sidebar { width: 220px; min-width: 220px; }
.skeleton-card {
  background: var(--bg-skeleton);
  border-radius: var(--radius-md);
  animation: sk-pulse 1.6s ease-in-out infinite;
}
@keyframes sk-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ===== 404 ===== */
.error-state {
  text-align: center;
  padding: 5rem 2rem;
}
.error-icon { font-size: 4rem; margin-bottom: 1rem; }
.error-state h2 { font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-primary); }
.error-state p { color: var(--text-secondary); margin-bottom: 1.5rem; }
.btn-back {
  display: inline-block;
  padding: 0.7rem 2rem;
  background: var(--gradient);
  color: white;
  border-radius: var(--radius-full);
  font-weight: 600;
  transition: all var(--transition);
}
.btn-back:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }

/* ===== 布局 ===== */
.detail-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

/* ===== 左侧 TOC 侧边栏 ===== */
.toc-sidebar {
  width: 240px;
  min-width: 240px;
  flex-shrink: 0;
}

.toc-sticky {
  position: sticky;
  top: 88px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 1.3rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.toc-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.8rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--border-light);
}

.toc-nav {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  max-height: 50vh;
  overflow-y: auto;
}

.toc-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.84rem;
  padding: 0.3rem 0.5rem;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  border-left: 2px solid transparent;
  line-height: 1.4;
}

.toc-link:hover {
  color: var(--primary);
  background: var(--bg-tag);
}

.toc-link.active {
  color: var(--primary);
  background: var(--bg-tag);
  border-left-color: var(--primary);
  font-weight: 600;
}

.toc-link.level-2 { padding-left: 1.2rem; font-size: 0.82rem; }
.toc-link.level-3 { padding-left: 2rem; font-size: 0.8rem; }

/* 工具栏 */
.article-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid var(--border-light);
}

.article-toolbar.no-toc {
  border-top: none;
  margin-top: 0;
  padding-top: 0;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.55rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
}

.tool-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.tool-btn.liked {
  border-color: #ff6b6b;
  color: #ff6b6b;
  background: #fff5f5;
}
.dark .tool-btn.liked { background: #3d1a1a; }

.tool-btn.favorited {
  border-color: #f0a500;
  color: #f0a500;
  background: #fffdf5;
}
.dark .tool-btn.favorited { background: #3d2e00; }

.tool-icon { font-size: 1rem; }

.toc-back-top {
  display: block;
  width: 100%;
  margin-top: 0.8rem;
  padding: 0.4rem;
  border: none;
  background: var(--bg-tag);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.8rem;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.toc-back-top:hover {
  background: var(--primary);
  color: white;
}

/* ===== 主内容区 ===== */
.article-main {
  flex: 1;
  min-width: 0;
}

/* 顶部操作栏 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.3rem;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: 1rem;
  border: 1px solid var(--border-light);
}

.top-back {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  transition: color var(--transition-fast);
}

.top-back:hover {
  color: var(--primary);
}

.top-actions { display: flex; gap: 0.5rem; }

.btn-action {
  padding: 0.4rem 1rem;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.btn-action.edit {
  background: var(--primary);
  color: white;
}

.btn-action.edit:hover {
  filter: brightness(1.1);
}

.btn-action.del {
  background: var(--danger);
  color: white;
}

.btn-action.del:hover {
  filter: brightness(1.1);
}

/* 置顶横幅 */
.pin-banner {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  text-align: center;
  padding: 0.55rem;
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 0.88rem;
  border: 1px solid #f59e0b;
}
.dark .pin-banner {
  background: linear-gradient(135deg, #3d3200, #5c4a00);
  color: #fbbf24;
  border-color: #856404;
}

/* 文章主体 */
.article {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 2.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.article-cover img {
  width: 100%;
  max-height: 420px;
  object-fit: cover;
  border-radius: var(--radius-md);
  margin-bottom: 2rem;
}

/* 文章头部 */
.article-header {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-light);
}

.ah-category { margin-bottom: 1rem; }

.category-badge {
  display: inline-block;
  background: var(--gradient);
  color: white;
  padding: 0.25rem 1rem;
  border-radius: var(--radius-full);
  font-size: 0.82rem;
  font-weight: 600;
}

.article-header h1 {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.35;
  margin-bottom: 1rem;
  letter-spacing: -0.01em;
}

.ah-meta {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  color: var(--text-secondary);
  font-size: 0.88rem;
  margin-bottom: 0.8rem;
  flex-wrap: wrap;
}

.ah-updated { color: var(--primary); font-size: 0.82rem; }

.ah-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.8rem;
}

.ah-tag {
  display: inline-block;
  background: var(--bg-tag);
  color: var(--primary);
  padding: 0.1rem 0.7rem;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 500;
}

.ah-stats {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.88rem;
  color: var(--text-tertiary);
  flex-wrap: wrap;
}

.ah-divider { color: var(--border); }

/* 文章正文 */
.article-body {
  font-size: 1.05rem;
  line-height: 1.9;
  color: var(--text-primary);
}

.article-body :deep(h1),
.article-body :deep(h2),
.article-body :deep(h3) {
  margin: 2rem 0 1rem;
  color: var(--text-primary);
  scroll-margin-top: 100px;
  line-height: 1.35;
}

.article-body :deep(h1) { font-size: 1.6rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem; }
.article-body :deep(h2) { font-size: 1.35rem; }
.article-body :deep(h3) { font-size: 1.15rem; }

.article-body :deep(p) { margin-bottom: 1.2rem; }

.article-body :deep(a) { color: var(--primary); text-decoration: underline; text-underline-offset: 3px; }
.article-body :deep(a:hover) { color: var(--accent); }

.article-body :deep(blockquote) {
  border-left: 4px solid var(--primary);
  padding: 0.8rem 1.2rem;
  margin: 1.5rem 0;
  background: var(--bg-tag);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  color: var(--text-secondary);
}

.article-body :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--bg-tag);
  padding: 0.15em 0.4em;
  border-radius: 4px;
  color: #e83e8c;
}

.dark .article-body :deep(code) { color: #f093fb; }

.article-body :deep(pre) {
  background: #1e1e2e !important;
  padding: 1.2rem;
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: 1.5rem 0;
  border: 1px solid #2d2d3d;
}

.article-body :deep(pre code) {
  background: transparent !important;
  padding: 0;
  color: #cdd6f4;
  font-size: 0.88rem;
  line-height: 1.6;
}

.article-body :deep(ul),
.article-body :deep(ol) {
  padding-left: 1.5rem;
  margin-bottom: 1.2rem;
}

.article-body :deep(li) { margin-bottom: 0.4rem; }

.article-body :deep(img) {
  max-width: 100%;
  border-radius: var(--radius-md);
  margin: 1rem 0;
}

.article-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

.article-body :deep(th),
.article-body :deep(td) {
  border: 1px solid var(--border);
  padding: 0.6rem 1rem;
  text-align: left;
}

.article-body :deep(th) {
  background: var(--bg-tag);
  font-weight: 600;
}

.article-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--border);
  margin: 2rem 0;
}

/* 版权声明 */
.copyright-box {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-top: 2.5rem;
  padding: 1.5rem;
  background: var(--bg-tag);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.copyright-icon {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-tertiary);
}

.copyright-text {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.8;
}

.copyright-text a {
  color: var(--primary);
  word-break: break-all;
}

/* ===== 上一篇/下一篇 ===== */
.nav-articles {
  display: flex;
  gap: 0.8rem;
  margin-top: 1rem;
}

.nav-item {
  flex: 1;
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  padding: 1rem 1.2rem;
  cursor: pointer;
  border: 1px solid var(--border-light);
  transition: all var(--transition);
  min-width: 0;
}

.nav-item:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.nav-item.next { text-align: right; }

.nav-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-tertiary);
  margin-bottom: 0.3rem;
}

.nav-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ===== 相关文章 ===== */
.related-section {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 1.8rem;
  margin-top: 1rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.section-header {
  margin-bottom: 1rem;
}

.section-header h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.8rem;
}

.related-card {
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--border-light);
  transition: all var(--transition);
  background: var(--bg-card-hover);
}

.related-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.rc-cover img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.rc-info { padding: 0.8rem; }

.rc-info h5 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rc-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  color: var(--text-tertiary);
}

.rc-cat {
  display: inline-block;
  background: var(--gradient);
  color: white;
  padding: 0.1rem 0.5rem;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 600;
}

/* ===== 评论区 ===== */
.comments-section {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 1.8rem;
  margin-top: 1rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

/* 评论表单 */
.comment-form {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.comment-form-avatar {
  font-size: 1.8rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.comment-form-body { flex: 1; min-width: 0; }

.reply-hint {
  background: var(--bg-tag);
  border-left: 3px solid var(--primary);
  padding: 0.5rem 0.8rem;
  border-radius: var(--radius-sm);
  margin-bottom: 0.6rem;
  font-size: 0.85rem;
  color: var(--primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cancel-reply {
  background: none;
  border: none;
  color: var(--danger);
  cursor: pointer;
  font-size: 0.82rem;
  font-family: inherit;
}

.comment-form-body textarea {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  background: var(--bg-input);
  color: var(--text-primary);
  outline: none;
  transition: border-color var(--transition-fast);
}

.comment-form-body textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.comment-form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.char-count { font-size: 0.8rem; color: var(--text-tertiary); }

.comment-form-footer button {
  padding: 0.5rem 1.5rem;
  background: var(--gradient);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 600;
  font-family: inherit;
  transition: all var(--transition);
}

.comment-form-footer button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.comment-form-footer button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-hint {
  text-align: center;
  padding: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
  background: var(--bg-tag);
  border-radius: var(--radius-sm);
}

.login-hint a { color: var(--primary); font-weight: 600; }

.no-comments {
  text-align: center;
  padding: 2rem;
  color: var(--text-tertiary);
}

/* 评论列表 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 1.5rem;
}

.comment-card {
  display: flex;
  gap: 0.8rem;
  padding: 1rem 1.2rem;
  background: var(--bg-card-hover);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
  transition: all var(--transition-fast);
}

.comment-card:hover { border-color: var(--border); }

.comment-card.is-reply {
  margin-left: 2.5rem;
  background: var(--bg-tag);
  border-left: 3px solid var(--primary);
}

.comment-avatar {
  font-size: 1.5rem;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.comment-body { flex: 1; min-width: 0; }

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.comment-author {
  font-weight: 700;
  color: var(--primary);
  font-size: 0.9rem;
}

.comment-header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comment-date {
  font-size: 0.78rem;
  color: var(--text-tertiary);
}

.btn-reply, .btn-del-comment {
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.15rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  font-family: inherit;
}

.btn-reply:hover { border-color: var(--primary); color: var(--primary); }
.btn-del-comment:hover { border-color: var(--danger); color: var(--danger); opacity: 1; }

.comment-content {
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 0.93rem;
  word-break: break-word;
}

.reply-to {
  color: var(--primary);
  font-weight: 600;
}

/* ===== 移动端悬浮操作栏 ===== */
.mobile-toolbar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  padding: 0.6rem;
  justify-content: space-around;
  z-index: 50;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}

.mobile-toolbar button {
  background: none;
  border: none;
  font-size: 1.2rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color var(--transition-fast);
  font-family: inherit;
}

.mobile-toolbar button.liked { color: #ff6b6b; }
.mobile-toolbar button.favorited { color: #f0a500; }

/* ===== 响应式 ===== */
@media (max-width: 1024px) {
  .toc-sidebar { display: none; }
  .article { padding: 1.8rem; }
}

@media (max-width: 768px) {
  .detail-layout { flex-direction: column; }
  .toc-sidebar { display: none; }

  .article-header h1 { font-size: 1.5rem; }
  .article { padding: 1.5rem; }
  .article-body { font-size: 1rem; }

  .nav-articles { flex-direction: column; }
  .nav-item.next { text-align: left; }

  .related-grid { grid-template-columns: 1fr; }

  .comment-card.is-reply { margin-left: 1.5rem; }

  .mobile-toolbar {
    display: flex;
    padding-bottom: env(safe-area-inset-bottom);
  }

  .comments-section,
  .related-section {
    margin-bottom: 60px;
  }

  .skel-layout { flex-direction: column; }
  .skel-layout .toc-sidebar { display: none; }
}
</style>
