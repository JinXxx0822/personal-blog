<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast-item', 'toast-' + toast.type, { 'toast-leaving': !toast.visible }]"
          @click="remove(toast.id)"
        >
          <span class="toast-icon">{{ iconMap[toast.type] }}</span>
          <span class="toast-msg">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { inject } from 'vue'

const iconMap = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
}

const toast = inject('toast', null)
const toasts = toast ? toast.toasts : []
const remove = (id) => toast ? toast.remove(id) : null
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 380px;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;
  animation: toast-in 0.3s ease;
}

.toast-success { background: linear-gradient(135deg, #2ecc71, #27ae60); }
.toast-error { background: linear-gradient(135deg, #e74c3c, #c0392b); }
.toast-warning { background: linear-gradient(135deg, #f39c12, #e67e22); }
.toast-info { background: linear-gradient(135deg, #667eea, #764ba2); }

.toast-leaving {
  opacity: 0;
  transform: translateX(50px);
}

.toast-icon { font-size: 1.1rem; flex-shrink: 0; }
.toast-msg { flex: 1; line-height: 1.4; }

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .toast-container {
    left: 10px;
    right: 10px;
    max-width: none;
  }
}
</style>
