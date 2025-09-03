<!-- src/components/BtcIcon.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import * as EpIcons from '@element-plus/icons-vue'

interface Props {
  name: string;           // ep:Setting | lucide:server | sprite:quality-pass
  size?: number | string; // 数字(单位px)或em/rem
  title?: string;         // a11y: aria-label/title
  class?: string;
}
const props = withDefaults(defineProps<Props>(), {
  size: 18,
})

const isEp = computed(() => props.name.startsWith('ep:'))
const isSprite = computed(() => props.name.startsWith('sprite:'))
const isIconify = computed(() => !isEp.value && !isSprite.value)

// Element Plus 图标组件（按需）
const epName = computed(() => props.name.replace(/^ep:/, ''))
const EpComp = computed(() => (EpIcons as any)[epName.value])

// Iconify：用"动态组件名"
// 规则：集合:id → 组件名 i-集合-id（unplugin-icons 的默认命名）
// 例：lucide:server → I-lucide-server
const iconifyTag = computed(() => {
  const comp = 'i-' + props.name.replace(':', '-')
  return comp
})

// 尺寸样式
const fontSize = computed(() =>
  typeof props.size === 'number' ? `${props.size}px` : String(props.size)
)
</script>

<template>
  <!-- Element Plus -->
  <component
    v-if="isEp && EpComp"
    :is="EpComp"
    :title="title"
    class="btc-icon"
    :class="[$props.class]"
    :style="{ fontSize }"
    aria-hidden="false"
    role="img"
  />

  <!-- 本地 Sprite -->
  <svg
    v-else-if="isSprite"
    class="btc-icon"
    :class="[$props.class]"
    :style="{ width: fontSize, height: fontSize }"
    aria-hidden="false"
    role="img"
  >
    <use :href="`#btc-${name.split(':')[1]}`" />
  </svg>

  <!-- Iconify 编译期组件 -->
  <component
    v-else
    :is="iconifyTag"
    :title="title"
    class="btc-icon"
    :class="[$props.class]"
    :style="{ fontSize }"
    aria-hidden="false"
    role="img"
  />
</template>

<style scoped>
.btc-icon {
  display: inline-block;
  line-height: 1;
  vertical-align: middle;
  /* 颜色跟随文本色，按钮里直接继承即可 */
  color: currentColor;
}
</style>
