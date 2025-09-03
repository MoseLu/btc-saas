<template>
  <el-tooltip 
    v-if="tooltip" 
    :content="tooltip" 
    :placement="tooltipPlacement"
    :effect="tooltipEffect"
  >
    <button 
      :class="buttonClasses"
      :type="type"
      :disabled="disabled"
      :aria-label="ariaLabel || tooltip"
      @click="handleClick"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <el-icon v-if="icon" :size="iconSize">
        <component :is="icon" />
      </el-icon>
      <span v-if="$slots.default" class="icon-button__text">
        <slot />
      </span>
    </button>
  </el-tooltip>
  
  <button 
    v-else
    :class="buttonClasses"
    :type="type"
    :disabled="disabled"
    :aria-label="ariaLabel"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <el-icon v-if="icon" :size="iconSize">
      <component :is="icon" />
    </el-icon>
    <span v-if="$slots.default" class="icon-button__text">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 定义组件属性
interface Props {
  // 图标组件
  icon?: any
  // 图标尺寸
  iconSize?: number | string
  // 按钮类型
  type?: 'button' | 'submit' | 'reset'
  // 按钮变体
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  // 按钮尺寸
  size?: 'small' | 'medium' | 'large'
  // 是否禁用
  disabled?: boolean
  // 是否加载中
  loading?: boolean
  // 是否圆形
  round?: boolean
  // 是否朴素
  plain?: boolean
  // 是否文本按钮
  text?: boolean
  // 是否链接按钮
  link?: boolean
  // 是否块级按钮
  block?: boolean
  // 是否自动聚焦
  autofocus?: boolean
  // 原生 name 属性
  name?: string
  // 原生 form 属性
  form?: string
  // 提示文本
  tooltip?: string
  // 提示位置
  tooltipPlacement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end'
  // 提示主题
  tooltipEffect?: 'dark' | 'light'
  // 无障碍标签
  ariaLabel?: string
}

// 定义事件
interface Emits {
  (e: 'click', event: MouseEvent): void
  (e: 'mouseenter', event: MouseEvent): void
  (e: 'mouseleave', event: MouseEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

// 定义 props 默认值
const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'default',
  size: 'medium',
  iconSize: 16,
  tooltipPlacement: 'top',
  tooltipEffect: 'dark'
})

// 定义事件
const emit = defineEmits<Emits>()

// 计算按钮类名
const buttonClasses = computed(() => {
  const classes = ['icon-button']
  
  // 基础类
  classes.push(`icon-button--${props.variant}`)
  classes.push(`icon-button--${props.size}`)
  
  // 状态类
  if (props.disabled) classes.push('is-disabled')
  if (props.loading) classes.push('is-loading')
  if (props.round) classes.push('is-round')
  if (props.plain) classes.push('is-plain')
  if (props.text) classes.push('is-text')
  if (props.link) classes.push('is-link')
  if (props.block) classes.push('is-block')
  
  return classes
})

// 事件处理函数
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

const handleMouseEnter = (event: MouseEvent) => {
  emit('mouseenter', event)
}

const handleMouseLeave = (event: MouseEvent) => {
  emit('mouseleave', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}
</script>

<style lang="scss" scoped>
.icon-button {
  /* 基础样式 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
  color: var(--el-text-color-regular);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  font-family: inherit;
  font-size: inherit;
  line-height: 1;
  text-decoration: none;
  outline: none;
  position: relative;
  
  /* 默认尺寸 - 基于 TabBar 按钮标准 */
  width: 28px;
  height: 28px;
  border-radius: 6px;
  
  /* 防止主题切换时的布局变化 */
  flex-shrink: 0;
  contain: layout style;
  
  /* 图标样式 */
  .el-icon {
    flex-shrink: 0;
  }
  
  /* 文本样式 */
  &__text {
    flex-shrink: 0;
    white-space: nowrap;
  }
  
  /* 悬停状态 - 亮色模式优化 */
  &:hover:not(.is-disabled) {
    background: var(--el-fill-color-light);
    border-color: var(--el-color-primary-light-5);
    color: var(--el-color-primary);
    transform: translateY(-1px);
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.08);
  }
  
  /* 激活状态 */
  &:active:not(.is-disabled) {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  /* 聚焦状态 */
  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 2px;
  }
  
  /* 禁用状态 */
  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none !important;
    box-shadow: none !important;
    
    &:hover {
      background: var(--el-bg-color);
      border-color: var(--el-border-color-light);
      color: var(--el-text-color-regular);
    }
  }
  
  /* 加载状态 */
  &.is-loading {
    cursor: wait;
    pointer-events: none;
  }
  
  /* 圆形按钮 */
  &.is-round {
    border-radius: 50%;
  }
  
  /* 朴素按钮 */
  &.is-plain {
    background: transparent;
    
    &:hover:not(.is-disabled) {
      background: var(--el-fill-color-light);
      border-color: var(--el-color-primary-light-5);
      color: var(--el-color-primary);
      transform: translateY(-1px);
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.08);
    }
  }
  
  /* 文本按钮 */
  &.is-text {
    border: none;
    background: transparent;
    padding: 0;
    
    &:hover:not(.is-disabled) {
      background: var(--el-fill-color-light);
      color: var(--el-color-primary);
      transform: none;
      box-shadow: none;
    }
  }
  
  /* 链接按钮 */
  &.is-link {
    border: none;
    background: transparent;
    padding: 0;
    color: var(--el-color-primary);
    
    &:hover:not(.is-disabled) {
      color: var(--el-color-primary-light-3);
      background: transparent;
      transform: none;
      box-shadow: none;
    }
  }
  
  /* 块级按钮 */
  &.is-block {
    width: 100%;
  }
  
  /* 尺寸变体 */
  &--small {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    
    .el-icon {
      font-size: 12px;
    }
  }
  
  &--medium {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    
    .el-icon {
      font-size: 14px;
    }
  }
  
  &--large {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    
    .el-icon {
      font-size: 16px;
    }
  }
  
  /* 变体样式 */
  &--primary {
    background: var(--el-color-primary);
    border-color: var(--el-color-primary);
    color: white;
    
    &:hover:not(.is-disabled) {
      background: var(--el-color-primary-light-3);
      border-color: var(--el-color-primary-light-3);
    }
  }
  
  &--success {
    background: var(--el-color-success);
    border-color: var(--el-color-success);
    color: white;
    
    &:hover:not(.is-disabled) {
      background: var(--el-color-success-light-3);
      border-color: var(--el-color-success-light-3);
    }
  }
  
  &--warning {
    background: var(--el-color-warning);
    border-color: var(--el-color-warning);
    color: white;
    
    &:hover:not(.is-disabled) {
      background: var(--el-color-warning-light-3);
      border-color: var(--el-color-warning-light-3);
    }
  }
  
  &--danger {
    background: var(--el-color-danger);
    border-color: var(--el-color-danger);
    color: white;
    
    &:hover:not(.is-disabled) {
      background: var(--el-color-danger-light-3);
      border-color: var(--el-color-danger-light-3);
    }
  }
  
  &--info {
    background: var(--el-color-info);
    border-color: var(--el-color-info);
    color: white;
    
    &:hover:not(.is-disabled) {
      background: var(--el-color-info-light-3);
      border-color: var(--el-color-info-light-3);
    }
  }
}

/* 亮色主题优化 */
.icon-button {
  /* 亮色模式下的基础样式优化 */
  &:hover:not(.is-disabled) {
    /* 亮色模式下使用更明显的悬浮效果 */
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.08);
  }
}

/* 亮色模式下下拉菜单样式优化 - 采用 cool-admin 风格 */
:deep(.el-dropdown-menu) {
  background: var(--el-bg-color-overlay) !important;
  border: 1px solid var(--el-border-color-light) !important;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.12) !important;
  
  .el-dropdown-menu__item {
    color: var(--el-text-color-primary) !important;
    transition: all 0.2s ease !important;
    
    &:hover {
      background: var(--el-fill-color-light) !important;
      color: var(--el-color-primary) !important;
    }
    
    &:focus {
      background: var(--el-fill-color-light) !important;
      color: var(--el-color-primary) !important;
    }
    
    &:active {
      background: var(--el-fill-color) !important;
      color: var(--el-color-primary) !important;
    }
  }
}

/* 深色模式适配 */
html.dark .icon-button {
  border-color: var(--el-border-color);
  background: var(--el-bg-color);
  color: var(--el-text-color-regular);
  
  &:hover:not(.is-disabled) {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-7);
    color: var(--el-color-primary);
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
  }
  
  &.is-plain {
    &:hover:not(.is-disabled) {
      background: var(--el-fill-color-dark);
      border-color: var(--el-border-color);
      color: var(--el-color-primary);
    }
  }
  
  &.is-text {
    &:hover:not(.is-disabled) {
      background: var(--el-fill-color-dark);
      color: var(--el-color-primary);
    }
  }
}

/* 深色模式下下拉菜单样式优化 - 采用 cool-admin 风格 */
:deep(.el-dropdown-menu) {
  background: var(--el-bg-color-overlay) !important;
  border: 1px solid var(--el-border-color) !important;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.3) !important;
  
  .el-dropdown-menu__item {
    color: var(--el-text-color-primary) !important;
    transition: all 0.2s ease !important;
    
    &:hover {
      background: var(--el-fill-color-dark) !important;
      color: var(--el-color-primary) !important;
    }
    
    &:focus {
      background: var(--el-fill-color-dark) !important;
      color: var(--el-color-primary) !important;
    }
    
    &:active {
      background: var(--el-fill-color) !important;
      color: var(--el-color-primary) !important;
    }
  }
}
</style>
