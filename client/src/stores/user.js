import { ref } from 'vue'

// 全局共享的登录状态
const user = ref(null)

export function useUser() {
  const login = (userData) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const restore = () => {
    const saved = localStorage.getItem('user')
    if (saved) {
      try { user.value = JSON.parse(saved) } catch (e) { /* ignore */ }
    }
  }

  return { user, login, logout, restore }
}
