<template>
  <div class="tabbar">
    <!-- 左侧功能图标区域 -->
    <div class="tabbar__nav">
      <IconButton
        :icon="ArrowLeft"
        title="上一个标签"
        @click="goToPrevious"
      />
      
      <IconButton
        :icon="Refresh"
        title="刷新页面"
        @click="refreshPage"
      />
      
      <IconButton
        :icon="HomeFilled"
        title="首页"
        @click="goHome"
      />
    </div>

    <!-- 标签列表区域 -->
    <div class="tabbar__list">
      <div v-for="t in tabs.visited" :key="t.path"
           class="tabbar__item"
           :class="{ 'is-active': t.path === tabs.activePath, 'is-affix': t.affix }"
           @click="go(t.path)"
           @auxclick.middle.prevent="removeTab(t.path)">
        <span class="tabbar__title">{{ t.title }}</span>
        <button v-if="!t.affix" class="tabbar__close" @click.stop="removeTab(t.path)">
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </div>

    <!-- 右侧功能图标区域 -->
    <div class="tabbar__ops">
      <el-dropdown v-if="!tabs.contentFullscreen">
        <IconButton
          :icon="More"
          :title="!tabs.contentFullscreen ? '更多操作' : '更多操作'"
        />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="closeOthers">关闭其他</el-dropdown-item>
            <el-dropdown-item @click="closeAll">关闭全部</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <IconButton
        :icon="!tabs.contentFullscreen ? FullScreen : Aim"
        :title="!tabs.contentFullscreen ? '内容区全屏' : '退出全屏'"
        @click="tabs.toggleContentFullscreen()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useTabsStore } from '../stores/tabs'
import { ref } from 'vue'
import BtcIcon from './BtcIcon.vue'
import IconButton from './IconButton.vue'
import { 
  ArrowLeft, 
  Refresh, 
  HomeFilled, 
  More, 
  FullScreen, 
  Aim,
  Close
} from '@element-plus/icons-vue'

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

// 移除滚动相关的引用和函数
// const listRef = ref<HTMLElement>()

// function onWheel(e: WheelEvent) { 
//   listRef.value?.scrollBy({ 
//     left: e.deltaY + e.deltaX, 
//     behavior: 'smooth' 
//   }) 
// }
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
  
  /* 防止主题切换时的布局变化 */
  contain: layout style;
  will-change: auto;
  

  
  /* 确保宽度稳定 */
  width: 100%;
  min-width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  
  /* 使用flexbox垂直居中，避免高度计算问题 */
  align-items: center;
  justify-content: flex-start;
  
  &__nav {
    display: flex;
    align-items: center;
    gap: 6px; /* 统一间距 */
    padding: 0 6px 0 12px; /* 左侧12px，右侧6px */
    
    /* 防止主题切换时的布局变化 */
    flex-shrink: 0;
    contain: layout style;
  }

  &__list {
    flex: 1;
    overflow: visible; /* 移除滚动，改为可见 */
    white-space: nowrap;
    padding: 0 6px; /* 左右各6px内边距 */
    margin: 0;
    
    /* 防止主题切换时的布局变化 */
    contain: layout style;
    min-width: 0; /* 允许flex子项收缩 */
  }
  
  
  
  &__item {
    display: inline-flex;
    align-items: center;
    justify-content: center; /* 确保内容垂直居中 */
    gap: 4px;
    height: 28px; /* 固定高度，与容器高度36px配合，上下各留4px空间 */
    padding: 0 8px; /* 固定左右内边距 */
    cursor: pointer;
    user-select: none;
    border-radius: 6px;
    margin: 4px 3px; /* 上下各4px，确保总高度为36px */
    transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease; /* 只过渡必要的属性 */
    font-size: 12px;
    font-weight: normal; /* 固定字体粗细，避免激活状态变化 */
    line-height: 1; /* 固定行高 */
    position: relative;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-light);
    
    /* 确保内容垂直居中 */
    vertical-align: middle;
    
    /* 关闭按钮在非悬浮状态下不占用空间 */
    .tabbar__close {
      opacity: 0;
      width: 0;
      height: 16px;
      overflow: hidden;
      transition: all 0.2s ease; /* 过渡所有属性包括宽度 */
      flex-shrink: 0; /* 防止收缩 */
      margin-left: 0; /* 确保没有左边距 */
    }
    
    &:hover {
      background: var(--el-fill-color-light);
      border-color: var(--el-border-color);
      /* 保持所有尺寸不变 */
      
      .tabbar__close {
        opacity: 1;
        width: 16px; /* 悬浮时显示正常宽度 */
        margin-left: 4px; /* 悬浮时添加左边距 */
      }
    }
    
    /* 激活状态的标签也显示关闭按钮 */
    &.is-active {
      .tabbar__close {
        opacity: 1;
        width: 16px; /* 激活时显示正常宽度 */
        margin-left: 4px; /* 激活时添加左边距 */
      }
    }
    
    &.is-active {
      background: var(--el-color-primary);
      color: white;
      border-color: var(--el-color-primary);
      /* 移除font-weight变化，避免高度抖动 */
      /* font-weight: 600; */
    }
    
    &.is-affix .tabbar__close {
      display: none;
    }
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
    background: var(--el-fill-color-light);
    padding: 0; /* 移除内边距，避免尺寸变化 */
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-regular);
    transition: opacity 0.2s ease, background-color 0.2s ease, color 0.2s ease; /* 只过渡必要的属性 */
    width: 16px;
    height: 16px;
    flex-shrink: 0; /* 防止收缩 */
    
    &:hover {
      background: var(--el-color-danger-light-9);
      color: var(--el-color-danger);
      border: 1px solid var(--el-color-danger-light-7);
    }
  }
  
    /* 左侧导航按钮样式 - 现在使用统一的IconButton组件 */
    
    &__ops {
      display: flex;
      align-items: center;
      gap: 6px; /* 统一间距 */
      padding: 0 6px 0 12px; /* 左侧12px，右侧6px */
      margin: 0;
      
      /* 防止主题切换时的布局变化 */
      flex-shrink: 0;
      contain: layout style;
      
      /* 右侧操作按钮样式 - 现在使用统一的IconButton组件 */
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
    }
  }
  
  &__close {
    background: var(--el-fill-color-dark);
    color: var(--el-text-color-regular);
    
    &:hover {
      background: var(--el-color-danger-light-9);
      color: var(--el-color-danger);
      border: 1px solid var(--el-color-danger-light-7);
    }
  }
  
  /* 暗色主题下的按钮样式 - 现在由IconButton组件统一处理 */
}
</style>
