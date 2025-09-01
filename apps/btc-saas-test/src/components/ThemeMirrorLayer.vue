<template>
  <teleport to="body">
    <div class="tm-root" :class="[mode, play ? 'play' : '']" aria-hidden="true">
      <div class="tm-veil" :style="veilStyle">
        <!-- 简化：直接使用本地iframe -->
        <iframe
          class="tm-iframe"
          :src="mirrorUrl"
          ref="localFrame"
          loading="eager"
        />
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, nextTick } from 'vue';

const props = defineProps<{
  nextTheme: 'light' | 'dark',
  origin: { cx: string, cy: string },
  duration?: number,
  mode: 'reveal' | 'conceal'
}>();

const D = props.duration ?? 720;
const play = ref(false);
const localFrame = ref<HTMLIFrameElement | null>(null);

const veilStyle = computed(() => ({
  '--cx': props.origin.cx,
  '--cy': props.origin.cy,
  '--dur': `${D}ms`
}));

// 构造强制主题 URL：使 iframe 首帧即为目标主题，避免 FOUC
const mirrorUrl = computed(() => {
  // 临时测试：使用一个简单的测试页面
  const testUrl = `data:text/html,<!DOCTYPE html><html class="${props.nextTheme === 'dark' ? 'dark' : ''}"><head><style>body{margin:0;padding:20px;background:${props.nextTheme === 'dark' ? '#0a0a0a' : '#f0f2f5'};color:${props.nextTheme === 'dark' ? '#e5eaf3' : '#303133'};font-family:Arial;}h1{font-size:24px;}</style></head><body><h1>测试主题: ${props.nextTheme}</h1><p>这是一个测试页面，用于验证iframe主题切换是否正常工作。</p></body></html>`;
  console.log('iframe URL (测试):', testUrl.substring(0, 100) + '...');
  return testUrl;
});

onMounted(async () => {
  console.log('ThemeMirrorLayer挂载:', props.nextTheme, props.mode);
  document.documentElement.classList.add('theme-switching');

  // 等待iframe加载完成
  await new Promise<void>((resolve) => {
    const iframe = localFrame.value!;
    
    const checkReady = () => {
      try {
        const doc = iframe.contentDocument;
        if (doc && doc.readyState === 'complete') {
          console.log('iframe已就绪:', props.nextTheme);
          console.log('iframe主题类:', doc.documentElement?.classList?.contains('dark'));
          resolve();
          return;
        }
      } catch (_) {}
      setTimeout(checkReady, 50);
    };
    
    iframe.addEventListener('load', () => {
      console.log('iframe load事件触发');
      checkReady();
    }, { once: true });
    
    // 如果iframe已经加载完成
    checkReady();
  });

  // 确保iframe内容正确显示
  await nextTick();
  
  console.log('开始播放动画');
  play.value = true;
});

onBeforeUnmount(() => {
  console.log('ThemeMirrorLayer卸载');
  document.documentElement.classList.remove('theme-switching');
});
</script>

<style>
.tm-root { 
  position: fixed; 
  inset: 0; 
  z-index: 4000; 
  pointer-events: none; 
}

.tm-veil { 
  position: absolute; 
  inset: 0; 
  will-change: clip-path; 
}

.tm-iframe { 
  position: absolute; 
  inset: 0; 
  width: 100%; 
  height: 100%; 
  border: 0; 
  pointer-events: none; 
  background: transparent;
}

/* 初始不播放：clip-path 固定在起点，直到 .play 才开始动画 */
.tm-root.reveal .tm-veil { 
  clip-path: circle(0 at var(--cx) var(--cy)); 
}

.tm-root.conceal .tm-veil { 
  clip-path: circle(141.5% at var(--cx) var(--cy)); 
}

.tm-root.play.reveal .tm-veil {
  animation: tm-reveal var(--dur) cubic-bezier(.22,.61,.36,1) forwards;
}

.tm-root.play.conceal .tm-veil {
  animation: tm-conceal var(--dur) cubic-bezier(.22,.61,.36,1) forwards;
}

@keyframes tm-reveal { 
  to { 
    clip-path: circle(141.5% at var(--cx) var(--cy)); 
  } 
}

@keyframes tm-conceal { 
  to { 
    clip-path: circle(0 at var(--cx) var(--cy)); 
  } 
}

/* 降噪：切换期禁用全局 transition，防止组件自带动效争抢合成器 */
html.theme-switching * { 
  transition: none !important; 
}
</style>