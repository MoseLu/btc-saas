<template>
  <div class="page-layout-wrapper cool-scrollbar">
    <!-- 页面内容将在这里渲染 -->
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
// 全局页面布局包装器组件
// 这个组件会自动为所有页面提供统一的布局样式
// 包括边框、边距、滚动条等
</script>

<style lang="scss" scoped>
.page-layout-wrapper {
  /* 基础样式 */
  width: 100%;
  height: 100%;
  
  /* 确保内容能够正确填充容器 */
  display: flex;
  flex-direction: column;
  
  /* 应用统一的页面样式 */
  border: 1px solid var(--el-border-color-light);
  border-radius: 0.5rem;
  background: var(--el-bg-color);
  padding: 1.5rem;
  margin: 0 0 1rem 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  
  /* 确保内容不会溢出边框 */
  position: relative;
  
  /* 启用滚动条 */
  overflow: auto;
  
  /* 最后一个元素不需要底部边距 */
  &:last-child {
    margin-bottom: 0;
  }
  
  /* 内侧内容保持原有滚动条样式 */
  & > * {
    /* 内侧内容可以有自己的滚动条样式 */
    overflow: visible;
  }
}
</style>
