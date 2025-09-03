<template>
  <div id="app">
    <AdminLayout />
  </div>
</template>

<script setup lang="ts">
import AdminLayout from './layouts/AdminLayout.vue'
</script>

<style lang="scss">
// 导入基础样式（包含主题样式）
@use './assets/styles/base.scss' as *;

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  margin: 0;
  padding: 0;
}

/* 全局样式 */
html {
  scroll-behavior: smooth;
  height: 100vh;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background-color: var(--el-bg-color-page);
  color: var(--el-text-color-primary);
}

/* 暗色模式 */
html.dark {
  color-scheme: dark;
}

/* 首屏渲染时禁用过渡动画，但不影响 View Transitions 和 Element Plus 浮层 */
html[data-first-paint] *:not(.el-message):not(.el-notification):not(.el-overlay):not(.el-popper):not(.el-loading-mask) {
  transition: none !important;
  animation: none !important;
}

/* 确保 View Transitions 伪元素不受首屏禁用规则影响 */
html[data-first-paint] ::view-transition-old(root),
html[data-first-paint] ::view-transition-new(root) {
  animation: unset !important;
}
</style>
