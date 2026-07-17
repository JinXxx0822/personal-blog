import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createToastPlugin } from './utils/toast'

const app = createApp(App)
app.use(router)
app.use(createToastPlugin())
app.mount('#app')
