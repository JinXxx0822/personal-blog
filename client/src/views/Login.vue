<template>
  <div class="login-page">
    <div class="login-card">
      <h2>{{ isRegister ? '注册' : '登录' }}</h2>
      <p class="subtitle">{{ isRegister ? '创建账号开始写作' : '登录后可以发布文章和评论' }}</p>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input id="username" v-model="form.username" type="text" placeholder="请输入用户名" required maxlength="20" />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input id="password" v-model="form.password" type="password" placeholder="请输入密码（至少6位）" required minlength="6" />
        </div>

        <div class="form-group" v-if="isRegister">
          <label for="nickname">昵称</label>
          <input id="nickname" v-model="form.nickname" type="text" placeholder="请输入昵称（可选）" maxlength="20" />
        </div>

        <div class="error-msg" v-if="errorMsg">{{ errorMsg }}</div>

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? '处理中...' : (isRegister ? '注册' : '登录') }}
        </button>
      </form>

      <p class="switch-mode">
        {{ isRegister ? '已有账号？' : '没有账号？' }}
        <a href="#" @click.prevent="toggleMode">{{ isRegister ? '去登录' : '去注册' }}</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const toast = inject('toast', null)
const emit = defineEmits(['login-success'])

const isRegister = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const form = ref({
  username: '',
  password: '',
  nickname: ''
})

const toggleMode = () => {
  isRegister.value = !isRegister.value
  errorMsg.value = ''
}

const handleSubmit = async () => {
  errorMsg.value = ''
  loading.value = true

  try {
    const endpoint = isRegister.value ? '/api/users/register' : '/api/users/login'
    const payload = {
      username: form.value.username.trim(),
      password: form.value.password
    }
    if (isRegister.value && form.value.nickname.trim()) {
      payload.nickname = form.value.nickname.trim()
    }

    const response = await axios.post(endpoint, payload)
    const user = {
      id: response.data.id,
      username: response.data.username,
      nickname: response.data.nickname
    }

    localStorage.setItem('user', JSON.stringify(user))
    emit('login-success', user)

    if (toast) toast.success(response.data.message || '操作成功')

    // 如果有 redirect 参数，跳转到目标页面
    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
  } catch (error) {
    errorMsg.value = error.response?.data?.error || '操作失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.login-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 420px;
  border: 1px solid var(--border-light);
}

.login-card h2 {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.login-form { display: flex; flex-direction: column; gap: 1.2rem; }

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }

.form-group label { font-weight: 600; font-size: 0.9rem; color: var(--text-primary); }

.form-group input {
  padding: 0.8rem 1rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  outline: none;
  transition: border-color var(--transition-fast);
  background: var(--bg-input);
  color: var(--text-primary);
  font-family: inherit;
}

.form-group input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.error-msg {
  background: #fee2e2;
  color: var(--danger);
  padding: 0.6rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  text-align: center;
  border: 1px solid #fecaca;
}
.dark .error-msg { background: #3d1a1a; border-color: #5c1a1a; }

.btn-submit {
  padding: 0.9rem;
  background: var(--gradient);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 1.05rem;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  transition: all var(--transition);
  box-shadow: var(--shadow-sm);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.switch-mode {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.switch-mode a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-fast);
}
.switch-mode a:hover { color: var(--accent); }
</style>
