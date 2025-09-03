<template>
  <el-scrollbar
    :class="['scrollable-container', customClass]"
    :height="height"
    :max-height="maxHeight"
    :always="always"
    :noresize="noresize"
    :tag="tag"
    @scroll="handleScroll"
  >
    <slot />
  </el-scrollbar>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  height?: string | number
  maxHeight?: string | number
  always?: boolean
  noresize?: boolean
  tag?: string
  customClass?: string
}

interface Emits {
  (e: 'scroll', event: Event): void
}

const props = withDefaults(defineProps<Props>(), {
  height: '100%',
  maxHeight: undefined,
  always: false,
  noresize: false,
  tag: 'div',
  customClass: ''
})

const emit = defineEmits<Emits>()

const handleScroll = (event: Event) => {
  emit('scroll', event)
}
</script>

<style scoped lang="scss">
.scrollable-container {
  /* 确保滚动条样式统一 */
  .el-scrollbar__wrap {
    overflow-x: hidden;
  }
  
  .el-scrollbar__bar {
    &.is-vertical {
      width: 8px;
    }
    
    &.is-horizontal {
      height: 8px;
    }
  }
  
  .el-scrollbar__thumb {
    background: var(--el-border-color);
    border-radius: 4px;
    transition: background-color 0.3s ease;
    
    &:hover {
      background: var(--el-border-color-darker);
    }
  }
}
</style>
