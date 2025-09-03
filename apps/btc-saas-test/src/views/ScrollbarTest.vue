<template>
  <div class="scrollbar-test-page">
    <h1>滚动条测试页面</h1>
    <p>这个页面用于测试自定义滚动条的位置计算</p>
    
    <!-- 测试说明 -->
    <div class="test-instructions">
      <h3>测试说明</h3>
      <ul>
        <li>✅ 滚动条默认完全不可见（4%透明度）</li>
        <li>✅ 只有鼠标悬浮在右侧滚动条区域时才显示</li>
        <li>🔄 滚动条位置应与实际内容滚动完全对应</li>
        <li>🔄 可以拖拽滚动条来滚动内容</li>
      </ul>
    </div>
    
    <!-- 测试内容区域 -->
    <div class="test-content scrollarea">
      <div v-for="i in 30" :key="i" class="test-item">
        <h3>测试项目 {{ i }}</h3>
        <p>这是第 {{ i }} 个测试项目，用于测试滚动条功能。当内容超过容器高度时，应该出现自定义滚动条。</p>
        <div class="test-details">
          <span>ID: {{ i }}</span>
          <span>状态: {{ i % 2 === 0 ? '活跃' : '待处理' }}</span>
          <span>优先级: {{ ['低', '中', '高'][i % 3] }}</span>
        </div>
      </div>
    </div>
    
    <!-- 滚动条状态显示 -->
    <div class="scrollbar-status">
      <h4>滚动条状态</h4>
      <p>容器高度: {{ containerHeight }}px</p>
      <p>内容高度: {{ contentHeight }}px</p>
      <p>是否需要滚动: {{ needsScroll ? '是' : '否' }}</p>
      <p>当前滚动位置: {{ scrollTop }}px</p>
      <p>滚动比例: {{ scrollRatio }}%</p>
      
      <!-- 调试信息 -->
      <hr style="margin: 1rem 0; border-color: var(--el-border-color-light);">
      <h5>调试信息</h5>
      <p>可滚动距离: {{ scrollableDistance }}px</p>
      <p>滚动条轨道范围: {{ trackRange }}px</p>
      <p>滚动条当前位置: {{ thumbPosition }}px</p>
      <p>滚动条透明度: {{ thumbOpacity }}</p>
      
      <!-- 测试按钮 -->
      <hr style="margin: 1rem 0; border-color: var(--el-border-color-light);">
      <h5>测试操作</h5>
      <div class="test-buttons">
        <button @click="scrollToTop" class="test-btn">滚动到顶部</button>
        <button @click="scrollToMiddle" class="test-btn">滚动到中间</button>
        <button @click="scrollToBottom" class="test-btn">滚动到底部</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

const containerHeight = ref(0)
const contentHeight = ref(0)
const needsScroll = ref(false)
const scrollTop = ref(0)
const scrollRatio = ref(0)
const scrollableDistance = ref(0)
const trackRange = ref(0)
const thumbPosition = ref(0)
const thumbOpacity = ref('0.04')

onMounted(async () => {
  await nextTick()
  
  // 获取容器信息
  const container = document.querySelector('.test-content')
  if (container) {
    containerHeight.value = container.clientHeight
    contentHeight.value = container.scrollHeight
    needsScroll.value = contentHeight.value > containerHeight.value
    
    // 计算滚动条相关信息
    if (needsScroll.value) {
      scrollableDistance.value = contentHeight.value - containerHeight.value
      // 滚动条轨道范围 = 容器高度 - 滚动条拇指高度
      const ratio = containerHeight.value / contentHeight.value
      const thumbHeight = Math.max(20, Math.round(containerHeight.value * ratio))
      trackRange.value = containerHeight.value - thumbHeight
    }
    
    // 监听滚动事件
    container.addEventListener('scroll', () => {
      scrollTop.value = container.scrollTop
      
      // 计算滚动比例
      if (contentHeight.value > containerHeight.value) {
        const maxScroll = contentHeight.value - containerHeight.value
        scrollRatio.value = Math.round((scrollTop.value / maxScroll) * 100)
        
        // 计算滚动条位置
        if (trackRange.value > 0) {
          thumbPosition.value = Math.round((scrollTop.value / maxScroll) * trackRange.value)
        }
      }
    })
    
    // 检查原生滚动条样式
    setTimeout(() => {
      const scrollbar = container.querySelector('::-webkit-scrollbar-thumb');
      if (scrollbar) {
        const style = getComputedStyle(scrollbar);
        thumbOpacity.value = style.backgroundColor;
        console.log('原生滚动条样式:', {
          background: style.backgroundColor,
          opacity: style.opacity,
          width: style.width,
          height: style.height
        });
      }
    }, 1000)
  }
})

// 测试函数
const scrollToTop = () => {
  const container = document.querySelector('.test-content')
  if (container) {
    container.scrollTop = 0
  }
}

const scrollToMiddle = () => {
  const container = document.querySelector('.test-content')
  if (container) {
    const maxScroll = container.scrollHeight - container.clientHeight
    container.scrollTop = Math.round(maxScroll / 2)
  }
}

const scrollToBottom = () => {
  const container = document.querySelector('.test-content')
  if (container) {
    const maxScroll = container.scrollHeight - container.clientHeight
    container.scrollTop = maxScroll
  }
}
</script>

<style lang="scss" scoped>
.scrollbar-test-page {
  padding: 1rem;
  
  h1 {
    color: var(--el-text-color-primary);
    margin-bottom: 1rem;
  }
  
  p {
    color: var(--el-text-color-regular);
    margin-bottom: 2rem;
  }
}

.test-instructions {
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 2rem;
  
  h3 {
    color: var(--el-color-primary);
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
  }
  
  ul {
    margin: 0;
    padding-left: 1.5rem;
    
    li {
      color: var(--el-text-color-regular);
      margin-bottom: 0.5rem;
      line-height: 1.4;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.test-content {
  height: 400px; /* 固定高度，确保内容可以滚动 */
  overflow: auto;
  
  .test-item {
    background: var(--el-bg-color-page);
    border: 1px solid var(--el-border-color-light);
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
    
    h3 {
      color: var(--el-text-color-primary);
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
    }
    
    p {
      color: var(--el-text-color-regular);
      margin: 0 0 1rem 0;
      line-height: 1.5;
    }
    
    .test-details {
      display: flex;
      gap: 1rem;
      font-size: 0.9rem;
      
      span {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
      }
    }
  }
}

.scrollbar-status {
  position: fixed;
  top: 100px;
  right: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 0.5rem;
  padding: 1rem;
  min-width: 250px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  h4, h5 {
    color: var(--el-text-color-primary);
    margin: 0 0 1rem 0;
    font-size: 1rem;
  }
  
  h5 {
    font-size: 0.9rem;
    margin-top: 1rem;
  }
  
  p {
    color: var(--el-text-color-regular);
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.test-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.test-btn {
  background: var(--el-color-primary);
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: var(--el-color-primary-dark-2);
  }
  
  &:active {
    background: var(--el-color-primary-dark-1);
  }
}
</style>
