<template>
  <div class="base-page" :class="{ 'page-scrollable': scrollable }">
    <!-- 页面内容将在这里渲染 -->
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
// 基础页面组件 - 提供统一的页面布局结构
// 所有页面都应该使用这个组件作为根容器

interface Props {
  // 页面标题（可选，如果不提供则使用路由meta中的title）
  title?: string
  // 页面描述（可选，如果不提供则使用路由meta中的description）
  description?: string
  // 是否启用滚动（默认启用）
  scrollable?: boolean
}

// 定义props，设置默认值
withDefaults(defineProps<Props>(), {
  scrollable: true
})
</script>

<style lang="scss" scoped>
.base-page {
  /* 基础页面样式 */
  width: 100%;
  height: 100%;
  
  /* 确保内容能够正确填充容器 */
  display: flex;
  flex-direction: column;
  
  /* 当启用滚动时，继承父容器的滚动条样式 */
  &.page-scrollable {
    /* 滚动条样式由父容器 .page-body-container 提供 */
  }
}
</style>
