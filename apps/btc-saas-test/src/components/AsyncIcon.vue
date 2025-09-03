<template>
  <el-icon class="async-icon" :class="{ 'is-loading': loading, 'has-error': error }">
    <!-- 加载状态 -->
    <Loading v-if="loading" class="loading-icon" />
    
    <!-- 错误状态 -->
    <Warning v-else-if="error" class="error-icon" />
    
    <!-- 正常图标 -->
    <component v-else-if="iconComponent" :is="iconComponent" />
    
    <!-- 默认占位符 -->
    <div v-else class="icon-placeholder" />
  </el-icon>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Loading, Warning } from '@element-plus/icons-vue'
import { loadIcon, getIcon, isIconLoaded } from '../utils/icon-manager'
import type { IconComponent } from '../utils/icon-manager'

// Props
interface Props {
  name: string
  size?: string | number
  color?: string
  showLoading?: boolean
  showError?: boolean
  fallbackIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: '1em',
  color: 'currentColor',
  showLoading: true,
  showError: true,
  fallbackIcon: 'Setting'
})

// 响应式数据
const iconComponent = ref<IconComponent | null>(null)
const loading = ref(false)
const error = ref(false)

// 计算属性
const iconStyle = computed(() => ({
  fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
  color: props.color
}))

// 加载图标
const loadIconComponent = async () => {
  // 检查是否已缓存
  if (isIconLoaded(props.name)) {
    iconComponent.value = getIcon(props.name)
    return
  }

  // 设置加载状态
  if (props.showLoading) {
    loading.value = true
    error.value = false
  }

  try {
    const component = await loadIcon(props.name)
    iconComponent.value = component
    error.value = false
  } catch (err) {
    console.error(`加载图标 ${props.name} 失败:`, err)
    error.value = true
    
    // 尝试加载备用图标
    if (props.fallbackIcon && props.fallbackIcon !== props.name) {
      try {
        const fallbackComponent = await loadIcon(props.fallbackIcon)
        iconComponent.value = fallbackComponent
        error.value = false
      } catch (fallbackErr) {
        console.error(`加载备用图标 ${props.fallbackIcon} 也失败:`, fallbackErr)
      }
    }
  } finally {
    loading.value = false
  }
}

// 监听图标名称变化
watch(() => props.name, (newName, oldName) => {
  if (newName !== oldName) {
    loadIconComponent()
  }
})

// 生命周期
onMounted(() => {
  loadIconComponent()
})
</script>

<style scoped lang="scss">
.async-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &.is-loading {
    opacity: 0.7;
    
    .loading-icon {
      animation: spin 1s linear infinite;
    }
  }
  
  &.has-error {
    opacity: 0.5;
    
    .error-icon {
      color: var(--el-color-danger);
    }
  }
}

.loading-icon {
  animation: spin 1s linear infinite;
}

.error-icon {
  color: var(--el-color-danger);
}

.icon-placeholder {
  width: 1em;
  height: 1em;
  background-color: var(--el-fill-color-light);
  border-radius: 2px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
