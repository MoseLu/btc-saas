<!-- src/components/ThemeToggleButton.vue -->
<script setup lang="ts">
import { useThemeTransition } from '../composables/useThemeTransition'

// 使用完美主题切换系统
const {
  isDark,
  isTransitioning,
  toggle,
  themeLabel,
  isSupported
} = useThemeTransition()

// 处理主题切换
const handleToggle = async () => {
  if (isTransitioning.value || !isSupported) return
  
  try {
    await toggle()
  } catch (error) {
    console.error('主题切换失败:', error)
  }
}
</script>

<template>
  <button
    :class="[
      'theme-toggle-btn',
      { 'is-transitioning': isTransitioning }
    ]"
    :aria-label="themeLabel"
    :title="themeLabel"
    @click="handleToggle"
    @keydown.enter="handleToggle"
    @keydown.space.prevent="handleToggle"
  >
    <!-- 主题图标 -->
    <span class="theme-toggle-icon" :class="{ 'is-dark': isDark }">
      <svg
        v-if="isDark"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <!-- 月亮图标 -->
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      <svg
        v-else
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <!-- 太阳图标 -->
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    </span>

    <!-- 加载状态指示器 -->
    <span
      v-if="isTransitioning"
      class="theme-loading-indicator"
      aria-hidden="true"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 12a9 9 0 11-6.219-8.56" />
      </svg>
    </span>

    <!-- 主题切换提示 -->
    <span class="theme-toggle-tooltip">
      {{ themeLabel }}
    </span>
  </button>
</template>

<style lang="scss" scoped>
.theme-toggle-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--el-text-color-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: visible;
  
  /* 亮色主题 */
  &:hover {
    background-color: var(--el-fill-color-light);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:focus {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 2px;
  }
  
  /* 暗色主题 */
  html.dark & {
    color: var(--el-text-color-primary);
    
    &:hover {
      background-color: var(--el-fill-color);
    }
  }
  
  /* 过渡状态 */
  &.is-transitioning {
    cursor: not-allowed;
    pointer-events: none;
    
    .theme-toggle-icon {
      opacity: 0.5;
    }
  }
  
  /* 禁用状态 */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background-color: transparent;
      transform: none;
    }
  }
}

.theme-toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &.is-dark {
    /* 暗色主题下轻微调亮 */
    filter: brightness(1.1);
  }
  
  svg {
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease;
  }
}

.theme-loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: spin 1s linear infinite;
  
  svg {
    width: 16px;
    height: 16px;
  }
}

@keyframes spin {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.theme-toggle-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 12px;
  background-color: var(--el-bg-color-overlay);
  color: var(--el-text-color-primary);
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;
  z-index: 1000;
  
  /* 箭头 */
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: var(--el-bg-color-overlay);
  }
  
  /* 显示提示 */
  .theme-toggle-btn:hover &,
  .theme-toggle-btn:focus & {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(-4px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .theme-toggle-btn {
    width: 36px;
    height: 36px;
  }
  
  .theme-toggle-icon svg {
    width: 18px;
    height: 18px;
  }
  
  .theme-toggle-tooltip {
    display: none; /* 移动端隐藏工具提示 */
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .theme-toggle-btn {
    border: 2px solid currentColor;
    
    &:focus {
      outline: 3px solid var(--el-color-primary);
      outline-offset: 2px;
    }
  }
}

/* 无动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .theme-toggle-btn,
  .theme-toggle-icon,
  .theme-toggle-tooltip {
    transition: none;
  }
  
  .theme-loading-indicator {
    animation: none;
  }
}
</style>