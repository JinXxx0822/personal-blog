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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
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
    router.push('/')
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
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 420px;
}

.dark .login-card { background: #16213e; }

.login-card h2 {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  text-align: center;
  color: #888;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.login-form { display: flex; flex-direction: column; gap: 1.2rem; }

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }

.form-group label { font-weight: 600; font-size: 0.9rem; color: #555; }
.dark .form-group label { color: #ccc; }

.form-group input {
  padding: 0.8rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
  background: inherit;
  color: inherit;
}

.dark .form-group input { border-color: #0f3460; background: #0f3460; }

.form-group input:focus { border-color: #667eea; }

.error-msg {
  background: #ffe0e0;
  color: #e74c3c;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

.dark .error-msg { background: #3d1a1a; }

.btn-submit {
  padding: 0.9rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.05rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.switch-mode {
  text-align: center;
  margin-top: 1.5rem;
  color: #888;
  font-size: 0.9rem;
}

.switch-mode a { color: #667eea; text-decoration: none; font-weight: 500; }
.switch-mode a:hover { text-decoration: underline; }
</style>
