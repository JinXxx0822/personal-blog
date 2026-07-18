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

export default api
