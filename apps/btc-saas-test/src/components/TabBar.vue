<template>
  <div class="tabbar">
    <!-- 左侧功能图标区域 -->
    <div class="tabbar__nav">
      <el-tooltip content="上一个标签">
        <button class="tabbar__nav-btn" @click="goToPrevious">
          <el-icon><ArrowLeft /></el-icon>
        </button>
      </el-tooltip>
      
      <el-tooltip content="刷新页面">
        <button class="tabbar__nav-btn" @click="refreshPage">
          <el-icon><Refresh /></el-icon>
        </button>
      </el-tooltip>
      
      <el-tooltip content="首页">
        <button class="tabbar__nav-btn" @click="goHome">
          <el-icon><HomeFilled /></el-icon>
        </button>
      </el-tooltip>
    </div>

    <!-- 标签列表区域 -->
    <div class="tabbar__list" ref="listRef" @wheel.prevent="onWheel">
      <div v-for="t in tabs.visited" :key="t.path"
           class="tabbar__item"
           :class="{ 'is-active': t.path === tabs.activePath, 'is-affix': t.affix }"
           @click="go(t.path)"
           @auxclick.middle.prevent="removeTab(t.path)">
        <el-icon v-if="t.icon" class="tabbar__icon">
          <component :is="t.icon" />
        </el-icon>
        <span class="tabbar__title">{{ t.title }}</span>
        <button v-if="!t.affix" class="tabbar__close" @click.stop="removeTab(t.path)">
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </div>

    <!-- 右侧功能图标区域 -->
    <div class="tabbar__ops">
      <el-dropdown v-if="!tabs.contentFullscreen">
        <button class="tabbar__ops-btn">
          <el-icon><More /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="closeOthers">关闭其他</el-dropdown-item>
            <el-dropdown-item @click="closeAll">关闭全部</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-tooltip content="内容区全屏">
        <button class="tabbar__ops-btn" @click="tabs.toggleContentFullscreen()">
          <el-icon>
            <FullScreen v-if="!tabs.contentFullscreen" />
            <Aim v-else />
          </el-icon>
        </button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useTabsStore } from '../stores/tabs'
import { ref } from 'vue'
import { Close, More, FullScreen, Aim, ArrowLeft, Refresh, HomeFilled } from '@element-plus/icons-vue'

const tabs = useTabsStore()
const router = useRouter()

function go(path: string) { 
  router.push(path) 
}

function removeTab(path: string) {
  const result = tabs.remove(path)
  if (result?.shouldNavigate) {
    router.push(result.nextPath)
  }
}

function closeOthers() {
  tabs.closeOthers(tabs.activePath)
  // closeOthers不需要路由跳转，因为当前tab仍然活跃
}

function closeAll() {
  tabs.closeAll()
  // 跳转到剩余的第一个tab或首页
  if (tabs.visited.length > 0) {
    router.push(tabs.visited[0].path)
  } else {
    router.push('/')
  }
}

// 新增功能方法
function goToPrevious() {
  // 回到上一个tab（基于访问历史）
  const currentIndex = tabs.visited.findIndex(t => t.path === tabs.activePath)
  if (currentIndex > 0) {
    const previousTab = tabs.visited[currentIndex - 1]
    router.push(previousTab.path)
  } else if (tabs.visited.length > 1) {
    // 如果是第一个，跳转到最后一个
    const lastTab = tabs.visited[tabs.visited.length - 1]
    router.push(lastTab.path)
  }
}

function refreshPage() {
  // 刷新当前页面内容（暂时不实现具体逻辑）
}

function goHome() {
  // 跳转到根路由，不会在TabBar中显示
  router.push('/')
}

const listRef = ref<HTMLElement>()

function onWheel(e: WheelEvent) { 
  listRef.value?.scrollBy({ 
    left: e.deltaY + e.deltaX, 
    behavior: 'smooth' 
  }) 
}
</script>

<style scoped lang="scss">
.tabbar {
  display: flex;
  align-items: center;
  height: 36px; /* 减小高度，更加紧凑 */
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  margin: 0;
  padding: 0;
  
  &__nav {
    display: flex;
    align-items: center;
    gap: 6px; /* 统一间距 */
    padding: 0 6px 0 12px; /* 左侧12px，右侧6px */
  }

  &__list {
    flex: 1;
    overflow: auto hidden;
    white-space: nowrap;
    scrollbar-width: none;
    padding: 0 6px; /* 左右各6px内边距 */
    margin: 0;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
  
  &__item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 32px; /* 减小高度 */
    padding: 0 8px;
    cursor: pointer;
    user-select: none;
    border-radius: 6px;
    margin: 2px 3px; /* 统一间距：上下2px，左右3px */
    transition: all 0.2s ease;
    font-size: 12px;
    position: relative;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-light); /* 使用更明显的边框颜色 */
    
    /* 默认状态下关闭按钮隐藏 */
    .tabbar__close {
      opacity: 0;
      width: 0;
      overflow: hidden;
      transition: all 0.2s ease;
    }
    
    &:hover {
      background: var(--el-fill-color-light);
      border-color: var(--el-border-color);
      padding: 0 12px 0 8px; /* 悬浮时右侧增加内边距为关闭按钮留空间 */
      
      .tabbar__close {
        opacity: 1;
        width: 16px; /* 显示关闭按钮 */
      }
      
      /* 悬浮时影响其他tab向右移动 */
      & ~ .tabbar__item {
        transform: translateX(8px);
      }
    }
    
    &.is-active {
      background: var(--el-color-primary);
      color: white;
      border-color: var(--el-color-primary);
      font-weight: 600;
      
      .tabbar__icon {
        color: white;
      }
    }
    
    &.is-affix .tabbar__close {
      display: none; /* 固定标签完全不显示关闭按钮 */
    }
  }
  
  &__icon {
    font-size: 12px; /* 减小图标尺寸 */
    flex-shrink: 0;
  }
  
  &__title {
    max-width: 120px; /* 减小最大宽度 */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px; /* 减小字体 */
  }
  
  &__close {
    border: 0;
    background: transparent;
    padding: 1px; /* 减小内边距 */
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-regular);
    transition: all 0.2s ease;
    width: 16px; /* 固定尺寸 */
    height: 16px;
    
    &:hover {
      background: var(--el-fill-color);
      color: var(--el-color-danger);
    }
  }
  
  /* 左侧导航按钮样式 */
  &__nav-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    border: 1px solid var(--el-border-color-light);
    background: var(--el-bg-color);
    cursor: pointer;
    color: var(--el-text-color-regular);
    transition: all 0.2s ease;
    
    &:hover {
      background: var(--el-color-primary);
      border-color: var(--el-color-primary);
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
  }

  &__ops {
    display: flex;
    align-items: center;
    gap: 6px; /* 统一间距 */
    padding: 0 6px 0 12px; /* 左侧12px，右侧6px */
    margin: 0;
  }
  
  /* 右侧操作按钮样式 */
  &__ops-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    border: 1px solid var(--el-border-color-light);
    background: var(--el-bg-color);
    cursor: pointer;
    color: var(--el-text-color-regular);
    transition: all 0.2s ease;
    
    &:hover {
      background: var(--el-color-primary);
      border-color: var(--el-color-primary);
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
  }
}

// 深色主题适配
html.dark .tabbar {
  background: var(--el-bg-color);
  border-bottom-color: var(--el-border-color);
  
  &__item {
    background: var(--el-bg-color);
    border-color: var(--el-border-color);
    color: var(--el-text-color-regular);
    
    &:hover {
      background: var(--el-fill-color-dark);
      border-color: var(--el-border-color);
    }
    
    &.is-active {
      background: var(--el-color-primary);
      color: white;
      border-color: var(--el-color-primary);
      
      .tabbar__icon {
        color: white;
      }
    }
  }
  
  &__close {
    color: var(--el-text-color-regular);
    
    &:hover {
      background: var(--el-fill-color-dark);
      color: var(--el-color-danger);
    }
  }
  
  /* 暗色主题下的按钮样式 */
  &__nav-btn,
  &__ops-btn {
    border-color: var(--el-border-color);
    background: var(--el-bg-color);
    color: var(--el-text-color-regular);
    
    &:hover {
      background: var(--el-color-primary);
      border-color: var(--el-color-primary);
      color: white;
      box-shadow: 0 4px 8px rgba(64, 158, 255, 0.4);
    }
  }
}
</style>
