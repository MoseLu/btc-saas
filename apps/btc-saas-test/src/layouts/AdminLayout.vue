<template>
  <div class="layout" :class="{ 'is-content-full': contentFullscreen, 'is-collapse': isCollapse }">
    <!-- 侧边栏 -->
    <aside class="layout__aside" v-if="!contentFullscreen">
      <div class="logo">
        <img src="/favicon.ico" alt="Logo" class="logo-img" />
        <span v-show="!isCollapse" class="logo-text">BTC Saas</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="false"
        :default-openeds="openeds"
        router
        class="sidebar-menu"
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
              <component :is="route.meta?.icon" />
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
              <component :is="route.meta?.icon" />
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
              <component :is="route.meta?.icon" />
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
              <component :is="route.meta?.icon" />
            </el-icon>
            <template #title>
              <span class="menu-title">{{ route.meta?.title }}</span>
            </template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </aside>

    <!-- 主内容区 -->
    <section class="layout__main">
      <!-- 顶部导航 -->
      <header class="layout__header" v-if="!contentFullscreen">
        <div class="header-left">
          <el-tooltip content="折叠侧边栏">
            <button 
              @click="toggleCollapse"
              class="collapse-btn"
            >
              <el-icon :size="16">
                <Fold v-if="!isCollapse" />
                <Expand v-else />
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
        
        <!-- 页面内容 -->
        <div class="page-content">
          <keep-alive :include="tabsStore.includeKeepAlive">
            <router-view v-slot="{ Component, route }">
              <component :is="Component" :key="route.fullPath" />
            </router-view>
          </keep-alive>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, markRaw, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useThemeWaveSwitch } from '../composables/useThemeWaveSwitch'
import { useMenuStore } from '../stores/menu'
import { useTabsStore } from '../stores/tabs'
import TabBar from '../components/TabBar.vue'
import { 
  Setting, Grid, Monitor, User, Sunny, Moon, 
  Fold, Expand, Link, Document
} from '@element-plus/icons-vue'
import { getMenuRoutes } from '../router'

// 导入主题切换样式
import 'element-plus/theme-chalk/dark/css-vars.css'

// 使用 Pinia store
const menuStore = useMenuStore()
const tabsStore = useTabsStore()
const { openeds, isCollapse } = storeToRefs(menuStore)
const { contentFullscreen } = storeToRefs(tabsStore)

// 使用新的主题切换 composable
const { start } = useThemeWaveSwitch((next: 'light' | 'dark') => {
  document.documentElement.classList.toggle('dark', next === 'dark');
})

// 使用 ref 而不是 computed 来避免循环依赖
const isDark = ref(document.documentElement.classList.contains('dark'))

// 监听主题变化，但避免循环调用
watch(() => document.documentElement.classList.contains('dark'), (newValue, oldValue) => {
  // 只有当值真正改变时才更新
  if (newValue !== oldValue) {
    isDark.value = newValue
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
  
  // 添加当前页面
  if (route.meta?.title) {
    items.push({
      title: route.meta.title as string,
      path: route.path
    })
  }
  
  return items
})

// 方法
const handleMenuSelect = (index: string) => {
  // 菜单选择处理
}

const handleMenuOpen = (index: string) => {
  // 使用 store 管理菜单展开状态
  menuStore.addOpened(index)
}

const handleMenuClose = (index: string) => {
  // 使用 store 管理菜单关闭状态
  menuStore.removeOpened(index)
}

const toggleCollapse = () => {
  // 使用 store 管理折叠状态
  menuStore.toggleCollapse()
}

// 主题切换功能
const toggleTheme = () => {
  // 直接检查 DOM 状态，而不是依赖响应式变量
  const currentIsDark = document.documentElement.classList.contains('dark');
  const next = currentIsDark ? 'light' : 'dark';
  start(next);
}

// 工具函数
const getCategoryTitle = (category: string): string => {
  const titleMap: Record<string, string> = {
    'user': '用户管理',
    'order': '订单管理',
    'product': '产品管理',
    'report': '报表中心',
    'quality': '品质管理',
    'purchase': '采购管理',
    'engineering': '工程管理',
    'production': '生产管理',
    'bi': '商业智能',
    'devtools': '开发工具',
    'demo': '功能演示'
  }
  return titleMap[category] || category
}

const getCategoryIcon = (category: string): any => {
  const iconMap: Record<string, any> = {
    'user': markRaw(User),
    'order': markRaw(Setting),
    'product': markRaw(Setting),
    'report': markRaw(Setting),
    'quality': markRaw(Setting),
    'purchase': markRaw(Setting),
    'engineering': markRaw(Setting),
    'production': markRaw(Setting),
    'bi': markRaw(Monitor),
    'devtools': markRaw(Setting),
    'demo': markRaw(Monitor)
  }
  return iconMap[category] || markRaw(Setting)
}

// 监听路由变化
watch(() => route.path, (newPath) => {
  // 路由变化时，确保当前路由对应的菜单分类是展开的
  const currentCategory = route.meta?.category as string
  if (currentCategory) {
    menuStore.addOpened(currentCategory)
  }
}, { immediate: true })

// 组件挂载时初始化菜单状态
onMounted(() => {
  // 主题已经在main.ts中初始化，这里不需要重复初始化
  // initTheme()
  
  // 确保默认菜单展开（如果没有持久化状态）
  if (menuStore.openeds.length === 0) {
    menuStore.setOpeneds(['system', 'plugins', 'apps'])
  }
  
  // 根据当前路由展开对应菜单
  const currentCategory = route.meta?.category as string
  if (currentCategory && !menuStore.openeds.includes(currentCategory)) {
    menuStore.addOpened(currentCategory)
  }
})
</script>

<style lang="scss" src="./AdminLayout.scss"></style>
