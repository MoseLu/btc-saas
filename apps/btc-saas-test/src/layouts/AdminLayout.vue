<template>
  <div ref="shell" class="layout-shell" :class="{ 'is-content-full': contentFullscreen }">
    <!-- 侧边栏 -->
    <aside 
      class="layout__aside"
      :class="{
        'is-collapsed': mode === 'desktop' && sidebarCollapsed,
        'is-open': mode !== 'desktop' && sidebarOpen
      }"
      role="navigation"
      :aria-hidden="mode !== 'desktop' && !sidebarOpen"
      v-if="!contentFullscreen"
    >
      <div class="logo">
        <img src="/favicon.ico" alt="Logo" class="logo-img" />
        <span v-show="mode === 'desktop' && !sidebarCollapsed" class="logo-text">BTC Saas</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="mode === 'desktop' && sidebarCollapsed"
        :unique-opened="false"
        :default-openeds="openeds"
        router
        class="sidebar-menu cool-scrollbar cool-scrollbar--side"
        :collapse-transition="false"
        @select="handleMenuSelect"
        @open="handleMenuOpen"
        @close="handleMenuClose"
      >
        <!-- 系统功能菜单 -->
        <el-sub-menu index="system" v-if="systemRoutes.length > 0">
          <template #title>
            <el-icon class="menu-icon"><Setting /></el-icon>
            <span class="menu-title">系统管理</span>
          </template>
          <el-menu-item 
            v-for="route in systemRoutes" 
            :key="route.path"
            :index="route.path"
            class="menu-item"
          >
            <el-icon class="menu-icon">
              <component :is="iconMap[route.meta?.icon as keyof typeof iconMap]" />
            </el-icon>
            <template #title>
              <span class="menu-title">{{ route.meta?.title }}</span>
            </template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 业务模块菜单 -->
        <el-sub-menu 
          v-for="category in businessCategories" 
          :key="category.name"
          :index="category.name"
        >
          <template #title>
            <el-icon class="menu-icon"><component :is="category.icon" /></el-icon>
            <span class="menu-title">{{ category.title }}</span>
          </template>
          <el-menu-item 
            v-for="route in category.routes" 
            :key="route.path"
            :index="route.path"
            class="menu-item"
          >
            <el-icon class="menu-icon">
              <component :is="iconMap[route.meta?.icon as keyof typeof iconMap]" />
            </el-icon>
            <template #title>
              <span class="menu-title">{{ route.meta?.title }}</span>
            </template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 插件菜单 -->
        <el-sub-menu index="plugins" v-if="pluginRoutes.length > 0">
          <template #title>
            <el-icon class="menu-icon"><Grid /></el-icon>
            <span class="menu-title">插件中心</span>
          </template>
          <el-menu-item 
            v-for="route in pluginRoutes" 
            :key="route.path"
            :index="route.path"
            class="menu-item"
          >
            <el-icon class="menu-icon">
              <component :is="iconMap[route.meta?.icon as keyof typeof iconMap]" />
            </el-icon>
            <template #title>
              <span class="menu-title">{{ route.meta?.title }}</span>
            </template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 应用菜单 -->
        <el-sub-menu index="apps" v-if="appRoutes.length > 0">
          <template #title>
            <el-icon class="menu-icon"><Monitor /></el-icon>
            <span class="menu-title">应用中心</span>
          </template>
          <el-menu-item 
            v-for="route in appRoutes" 
            :key="route.path"
            :index="route.path"
            class="menu-item"
          >
            <el-icon class="menu-icon">
              <component :is="iconMap[route.meta?.icon as keyof typeof iconMap]" />
            </el-icon>
            <template #title>
              <span class="menu-title">{{ route.meta?.title }}</span>
            </template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </aside>

    <!-- 抽屉遮罩，仅在平板/手机模式出现 -->
    <div
      v-if="mode !== 'desktop' && !contentFullscreen"
      class="backdrop"
      :class="{ 'is-open': sidebarOpen }"
      @click="sidebarOpen = false"
      role="presentation"
    />

    <!-- 主内容区 -->
    <section class="layout__main">
      <!-- 顶部导航 -->
      <header class="layout__header" v-if="!contentFullscreen">
        <div class="header-left">
          <el-tooltip :content="toggleButtonLabel">
            <button 
              @click="onToggle"
              class="collapse-btn"
              :aria-label="toggleButtonLabel"
            >
              <el-icon :size="16">
                <component :is="toggleButtonIcon" />
              </el-icon>
            </button>
          </el-tooltip>
        </div>
        
        <div class="header-right">
          <el-tooltip content="切换主题">
            <button 
              @click="toggleTheme"
              class="theme-toggle-btn"
            >
              <el-icon :size="16">
                <Sunny v-if="isDark" />
                <Moon v-else />
              </el-icon>
            </button>
          </el-tooltip>
          
          <el-dropdown>
            <el-avatar :size="32" class="user-avatar">
              <img src="/favicon.ico" alt="用户头像" />
            </el-avatar>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>设置</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- TabBar -->
      <TabBar />
      
      <!-- 页面内容 -->
      <div class="layout__content">
        <!-- 面包屑导航区域 -->
        <div class="breadcrumb-container" v-if="breadcrumbItems.length > 0">
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item 
              v-for="(item, index) in breadcrumbItems" 
              :key="index"
              :to="item.path === '#' ? undefined : item.path"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <!-- 页面内容 - 固定布局容器 -->
        <div class="page-content cool-scrollbar">
          <!-- 页面内容区域 - 固定布局 -->
          <div class="page-body-container">
            <keep-alive :include="tabsStore.includeKeepAlive">
              <router-view v-slot="{ Component, route }">
                <!-- 自动为所有页面内容添加统一的布局包装器 -->
                <PageLayoutWrapper>
                  <component :is="Component" :key="route.fullPath" />
                </PageLayoutWrapper>
              </router-view>
            </keep-alive>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, markRaw, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useMenuStore } from '../stores/menu'
import { useTabsStore } from '../stores/tabs'
import { useLayout } from '../composables/useLayout'
// 移除旧的滚动指示器系统，使用新的 overlay 滚动条系统
import { globalPageActions } from '../composables/usePageActions'
import TabBar from '../components/TabBar.vue'
import PageLayoutWrapper from '../components/PageLayoutWrapper.vue'
import { 
  Setting, Grid, Monitor, User, Sunny, Moon, 
  Fold, Expand, Link, Document, Location, Folder, 
  DataAnalysis, Picture, Connection, Brush, House,
  Money, TrendCharts, Box, Tools, List,
  ShoppingCart, HomeFilled, ArrowLeft, Refresh, Close, 
  More, FullScreen, Aim, Search, Delete, Download, 
  CopyDocument, Warning
} from '@element-plus/icons-vue'
import AsyncIcon from '../components/AsyncIcon.vue'


// 图标映射对象 - 使用 markRaw 优化性能，避免不必要的响应式包装
const iconMap = {
  Setting: markRaw(Setting),
  Grid: markRaw(Grid),
  Monitor: markRaw(Monitor),
  User: markRaw(User),
  Sunny: markRaw(Sunny),
  Moon: markRaw(Moon),
  Fold: markRaw(Fold),
  Expand: markRaw(Expand),
  Link: markRaw(Link),
  Document: markRaw(Document),
  Location: markRaw(Location),
  Folder: markRaw(Folder),
  DataAnalysis: markRaw(DataAnalysis),
  Picture: markRaw(Picture),
  Connection: markRaw(Connection),
  Brush: markRaw(Brush),
  House: markRaw(House),
  Money: markRaw(Money),
  TrendCharts: markRaw(TrendCharts),
  Box: markRaw(Box),
  Tools: markRaw(Tools),
  List: markRaw(List),
  ShoppingCart: markRaw(ShoppingCart),
  HomeFilled: markRaw(HomeFilled),
  ArrowLeft: markRaw(ArrowLeft),
  Refresh: markRaw(Refresh),
  Close: markRaw(Close),
  More: markRaw(More),
  FullScreen: markRaw(FullScreen),
  Aim: markRaw(Aim),
  Search: markRaw(Search),
  Delete: markRaw(Delete),
  Download: markRaw(Download),
  CopyDocument: markRaw(CopyDocument),
  Warning: markRaw(Warning)
}
import { getMenuRoutes } from '../router'

// 导入主题切换样式
import 'element-plus/theme-chalk/dark/css-vars.css'

// 导入完美主题切换系统
import { useThemeTransition } from '../composables/useThemeTransition'

// 使用优雅响应式布局状态机
const shell = ref<HTMLElement | null>(null)
const { 
  mode, 
  sidebarOpen, 
  sidebarCollapsed, 
  toggleButtonAction, 
  toggleButtonIcon,
  toggleButtonLabel,
  onShellReady 
} = useLayout()

// 滚动条激活类管理
function wireActiveClass(el: HTMLElement) {
  let timer: number | undefined

  const onEnter = () => el.classList.add('is-active')
  const onLeave = () => el.classList.remove('is-active')
  const onScroll = () => {
    el.classList.add('is-active')
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => el.classList.remove('is-active'), 360) // 停止滚动后淡出
  }

  el.addEventListener('mouseenter', onEnter)
  el.addEventListener('mouseleave', onLeave)
  el.addEventListener('scroll', onScroll, { passive: true })

  return () => {
    el.removeEventListener('mouseenter', onEnter)
    el.removeEventListener('mouseleave', onLeave)
    el.removeEventListener('scroll', onScroll)
  }
}

// 使用新的 overlay 滚动条系统，不再需要旧的滚动指示器

// 使用 Pinia store
const menuStore = useMenuStore()
const tabsStore = useTabsStore()
const { openeds } = storeToRefs(menuStore)
const { contentFullscreen } = storeToRefs(tabsStore)

// 使用完美主题切换系统
const { isDark, toggle } = useThemeTransition()

// 监听主题变化，但避免循环调用
watch(() => document.documentElement.classList.contains('dark'), (newValue, oldValue) => {
  if (newValue !== oldValue) {
    // 主题已经通过完美主题切换系统更新，这里只需要同步状态
    // 不需要手动更新isDark，因为useThemeTransition会自动处理
  }
}, { immediate: true })

// 路由相关
const route = useRoute()
const router = useRouter()

// 计算属性
const activeMenu = computed(() => route.path)

const currentPageTitle = computed(() => {
  return route.meta?.title || '页面'
})

// 获取菜单路由
const menuRoutes = computed(() => getMenuRoutes())

// 系统路由
const systemRoutes = computed(() => 
  menuRoutes.value.filter(route => route.meta?.category === 'system')
)

// 插件路由
const pluginRoutes = computed(() => 
  menuRoutes.value.filter(route => route.meta?.category === 'plugin')
)

// 应用路由
const appRoutes = computed(() => 
  menuRoutes.value.filter(route => route.meta?.category === 'app')
)

// 业务模块分类
const businessCategories = computed(() => {
  const categories = new Map<string, any>()
  
  menuRoutes.value.forEach(route => {
    const category = route.meta?.category
    if (category && category !== 'system' && category !== 'plugin' && category !== 'app') {
      if (!categories.has(category)) {
        categories.set(category, {
          name: category,
          title: getCategoryTitle(category),
          icon: getCategoryIcon(category),
          routes: []
        })
      }
      categories.get(category).routes.push(route)
    }
  })
  
  return Array.from(categories.values()).sort((a, b) => a.title.localeCompare(b.title))
})

// 面包屑导航
const breadcrumbItems = computed(() => {
  const items: Array<{ title: string; path: string }> = []
  
  // 添加一级菜单（根据当前路由的category找到对应的菜单标题）
  const currentCategory = route.meta?.category as string
  if (currentCategory) {
    let categoryTitle = ''
    
    // 根据category查找对应的菜单标题
    if (currentCategory === 'system') {
      categoryTitle = '系统管理'
    } else if (currentCategory === 'plugin') {
      categoryTitle = '插件中心'
    } else if (currentCategory === 'app') {
      categoryTitle = '应用中心'
    } else {
      // 对于业务模块，查找对应的分类标题
      const businessCategory = businessCategories.value.find(cat => cat.name === currentCategory)
      categoryTitle = businessCategory?.title || getCategoryTitle(currentCategory)
    }
    
    items.push({
      title: categoryTitle,
      path: '#' // 一级菜单不可点击
    })
  }
  
  // 添加当前页面标题
  if (route.meta?.title) {
    items.push({
      title: route.meta.title as string,
      path: route.path
    })
  }
  
  return items
})

// 菜单事件处理
const handleMenuSelect = (index: string) => {
  // 菜单选择后的处理逻辑
}

const handleMenuOpen = (index: string) => {
  // 菜单展开后的处理逻辑
}

const handleMenuClose = (index: string) => {
  // 菜单收起后的处理逻辑
}

// 主题切换
const toggleTheme = () => {
  toggle()
}

// 优雅响应式布局切换
const onToggle = () => {
  if (toggleButtonAction.value === 'collapse') {
    // 桌面模式：折叠/展开侧栏
    sidebarCollapsed.value = !sidebarCollapsed.value
  } else {
    // 平板/手机模式：打开/关闭抽屉
    sidebarOpen.value = !sidebarOpen.value
    
    // 抽屉打开时，将焦点移到第一个可聚焦元素
    if (sidebarOpen.value) {
      requestAnimationFrame(() => {
        const firstLink = document.querySelector('.sidebar-menu a') as HTMLElement
        firstLink?.focus()
      })
    }
  }
}

// 页面标题和描述管理
function getPageTitle(): string {
  return route.meta?.title as string || '页面'
}

function getPageDescription(): string {
  return route.meta?.description as string || ''
}

// 工具函数
function getCategoryTitle(category: string): string {
  const titles: Record<string, string> = {
    'user': '用户管理',
    'order': '订单管理',
    'product': '产品管理',
    'finance': '财务管理',
    'report': '报表统计'
  }
  return titles[category] || category
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'user': 'User',
    'order': 'Document',
    'product': 'Box',
    'finance': 'Money',
    'report': 'TrendCharts'
  }
  return icons[category] || 'Folder'
}

// 生命周期
onMounted(() => {
    // 初始化优雅响应式布局
  if (shell.value) {
    onShellReady(shell.value)
  }
  
  // 初始化滚动条激活类
  const targets = document.querySelectorAll<HTMLElement>('.cool-scrollbar')
  const cleanups: Array<() => void> = []
  targets.forEach(n => cleanups.push(wireActiveClass(n)))
  
  // 清理滚动条事件监听器
  onBeforeUnmount(() => {
    cleanups.forEach(fn => fn())
  })

  // 监听ESC键关闭抽屉
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && sidebarOpen.value) {
      sidebarOpen.value = false
    }
  }
  
  document.addEventListener('keydown', handleEsc)
  
  // 清理事件监听器
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleEsc)
  })
})
</script>

<style lang="scss" src="./AdminLayout.scss"></style>
