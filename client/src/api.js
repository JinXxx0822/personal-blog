import axios from 'axios'

// 生产环境：CloudBase 云托管后端地址
// 开发环境：通过 Vite 代理，路径原样转发
const apiBase = import.meta.env.DEV 
  ? '' 
  : 'https://blog-server-283966-10-1455512667.sh.run.tcloudbase.com'

const api = axios.create({
  baseURL: apiBase,
  timeout: 15000,
})

// 请求拦截器：自动附加 JWT Token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：Token 过期自动跳转登录
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // 不在登录页才跳转
      if (window.location.hash !== '#/login' && window.location.pathname !== '/login') {
        window.location.hash = '#/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
