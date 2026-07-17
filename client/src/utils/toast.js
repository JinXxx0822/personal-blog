import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

export function useToast() {
  const show = (message, type = 'info', duration = 3000) => {
    const id = nextId++
    toasts.value.push({ id, message, type, visible: true })
    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }
    return id
  }

  const success = (msg, duration) => show(msg, 'success', duration)
  const error = (msg, duration) => show(msg, 'error', duration)
  const info = (msg, duration) => show(msg, 'info', duration)
  const warning = (msg, duration) => show(msg, 'warning', duration)

  const remove = (id) => {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx > -1) {
      toasts.value[idx].visible = false
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      }, 300)
    }
  }

  return { toasts, show, success, error, info, warning, remove }
}

// 全局单例 toast
let _globalToast = null
let _toasts = null

export function createToastPlugin() {
  return {
    install(app) {
      _toasts = ref([])
      _globalToast = {
        toasts: _toasts,
        _nextId: 0,
        show(message, type = 'info', duration = 3000) {
          const id = this._nextId++
          _toasts.value.push({ id, message, type, visible: true })
          if (duration > 0) {
            setTimeout(() => { this.remove(id) }, duration)
          }
          return id
        },
        success(msg, duration) { return this.show(msg, 'success', duration) },
        error(msg, duration) { return this.show(msg, 'error', duration) },
        info(msg, duration) { return this.show(msg, 'info', duration) },
        warning(msg, duration) { return this.show(msg, 'warning', duration) },
        remove(id) {
          const idx = _toasts.value.findIndex(t => t.id === id)
          if (idx > -1) {
            _toasts.value[idx].visible = false
            setTimeout(() => {
              _toasts.value = _toasts.value.filter(t => t.id !== id)
            }, 300)
          }
        }
      }
      app.provide('toast', _globalToast)
      app.config.globalProperties.$toast = _globalToast
    }
  }
}

export { useToast as default }
