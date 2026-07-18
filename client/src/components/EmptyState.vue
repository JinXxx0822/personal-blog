<template>
  <div class="empty-state">
    <span class="empty-icon">{{ icon }}</span>
    <h4>{{ title }}</h4>
    <p v-if="description">{{ description }}</p>
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '📭' },
  title: { type: String, default: '暂无数据' },
  description: { type: String, default: '' }
})
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #888;
}
.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}
.empty-state h4 {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 0.5rem;
}
.empty-state p {
  font-size: 0.95rem;
  color: #999;
}
.dark .empty-state h4 { color: #aaa; }
.dark .empty-state p { color: #777; }
</style>
